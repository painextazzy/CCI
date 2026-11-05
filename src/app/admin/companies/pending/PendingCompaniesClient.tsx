"use client";

import { useState, useRef } from "react";
import {
  Search,
  Check,
  X,
  Eye,
  LoaderCircle,
  Building2,
  CheckCheck,
} from "lucide-react";
import CompanyDetailModal, { CompanyRequest } from "./CompanyDetailModal";
import CompanyAvatar from "../../../components/CompanyAvatar";
import { getApiRoot } from "../../../lib/auth";

export type { CompanyRequest };

interface PendingCompaniesClientProps {
  initialCompanies?: CompanyRequest[];
}

// ─── Helpers ───
const STATUS_CONFIG: Record<
  string,
  { label: string; badge: string; dot: string }
> = {
  PENDING: {
    label: "En attente",
    badge: "bg-amber-50 text-amber-700 border-amber-200",
    dot: "bg-amber-500 animate-pulse",
  },
  APPROVED: {
    label: "Approuvée",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-500",
  },
  REJECTED: {
    label: "Refusée",
    badge: "bg-pink-50 text-pink-600 border-pink-200",
    dot: "bg-pink-500",
  },
};

const getRegionLabel = (type: string) => {
  if (type === "HAUTE_MATSIATRA") return "Haute Matsiatra";
  if (type === "OTHER_REGION") return "Autre Région";
  return "International";
};

export default function PendingCompaniesClient({
  initialCompanies = [],
}: PendingCompaniesClientProps) {
  const [companies, setCompanies] = useState<CompanyRequest[]>(
    initialCompanies ?? [],
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [selectedCompanyIds, setSelectedCompanyIds] = useState<Set<string>>(
    new Set(),
  );
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const [rejectingCompany, setRejectingCompany] =
    useState<CompanyRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [processingAction, setProcessingAction] = useState<
    "approve" | "bulkApprove" | "reject" | null
  >(null);
  const [detailCompany, setDetailCompany] = useState<CompanyRequest | null>(
    null,
  );

  const actionInProgressRef = useRef(false);
  const safeCompanies = Array.isArray(companies) ? companies : [];

  // ─── Filtrage ───
  const filteredCompanies = safeCompanies.filter((company) => {
    if (!company) return false;
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      (company.companyName?.toLowerCase() || "").includes(query) ||
      (company.nif || "").includes(query) ||
      (company.stat || "").includes(query) ||
      (company.managerName?.toLowerCase() || "").includes(query);
    const matchesStatus =
      selectedStatus === "ALL" || company.verificationStatus === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const countStatus = (status: string) => {
    if (status === "ALL") return safeCompanies.length;
    return safeCompanies.filter((c) => c?.verificationStatus === status).length;
  };

  const visiblePendingCompanies = filteredCompanies.filter(
    (company) => company.verificationStatus === "PENDING",
  );
  const selectedPendingIds = visiblePendingCompanies
    .filter((company) => selectedCompanyIds.has(company.id))
    .map((company) => company.id);
  const allVisiblePendingSelected =
    visiblePendingCompanies.length > 0 &&
    visiblePendingCompanies.every((company) =>
      selectedCompanyIds.has(company.id),
    );

  const toggleCompanySelection = (companyId: string) => {
    setSelectedCompanyIds((current) => {
      const next = new Set(current);
      if (next.has(companyId)) next.delete(companyId);
      else next.add(companyId);
      return next;
    });
  };

  const toggleVisiblePendingSelection = () => {
    setSelectedCompanyIds((current) => {
      const next = new Set(current);
      if (allVisiblePendingSelected) {
        visiblePendingCompanies.forEach((company) => next.delete(company.id));
      } else {
        visiblePendingCompanies.forEach((company) => next.add(company.id));
      }
      return next;
    });
  };

  // ─── Actions API ───
  const handleApprove = async (companyIds: string[]) => {
    if (actionInProgressRef.current) return;
    if (
      companyIds.length > 1 &&
      !window.confirm(
        `Confirmer l’approbation de ${companyIds.length} demandes sélectionnées ?`,
      )
    ) {
      return;
    }

    actionInProgressRef.current = true;
    setProcessingAction(companyIds.length === 1 ? "approve" : "bulkApprove");
    setActionError(null);
    setActionMessage(null);

    try {
      const approvedIds: string[] = [];
      const failures: { id: string; message: string }[] = [];

      for (let offset = 0; offset < companyIds.length; offset += 100) {
        const batch = companyIds.slice(offset, offset + 100);
        try {
          const response = await fetch(
            `${getApiRoot()}/companies/status/bulk`,
            {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify({ companyIds: batch }),
            },
          );
          const result = await response.json().catch(() => null);
          if (!response.ok) {
            const message = Array.isArray(result?.message)
              ? result.message.join(", ")
              : result?.message;
            throw new Error(message || "Impossible d’approuver les demandes.");
          }

          if (Array.isArray(result?.approvedIds)) {
            approvedIds.push(...(result.approvedIds as string[]));
          }
          if (Array.isArray(result?.failures)) {
            failures.push(
              ...(result.failures as { id: string; message: string }[]),
            );
          }
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : "Impossible d’approuver les demandes.";
          failures.push(...batch.map((id) => ({ id, message })));
          failures.push(
            ...companyIds
              .slice(offset + batch.length)
              .map((id) => ({ id, message })),
          );
          break;
        }
      }

      setCompanies((current) =>
        current.map((company) =>
          approvedIds.includes(company.id)
            ? { ...company, verificationStatus: "APPROVED" }
            : company,
        ),
      );
      setSelectedCompanyIds((current) => {
        const next = new Set(current);
        approvedIds.forEach((id) => next.delete(id));
        return next;
      });
      if (detailCompany && approvedIds.includes(detailCompany.id)) {
        setDetailCompany(null);
      }

      if (failures.length > 0) {
        const failureNames = failures.slice(0, 5).map((failure) => {
          const company = safeCompanies.find((item) => item.id === failure.id);
          return `${company?.companyName ?? failure.id}: ${failure.message}`;
        });
        const remainingFailures = failures.length - failureNames.length;
        setActionError(
          `${approvedIds.length} demande(s) approuvée(s). Échecs (${failures.length}) : ${failureNames.join(" ; ")}${remainingFailures > 0 ? ` ; et ${remainingFailures} autre(s)` : ""}`,
        );
      } else {
        setActionMessage(
          approvedIds.length === 1
            ? "La demande a été approuvée."
            : `${approvedIds.length} demandes ont été approuvées.`,
        );
      }
    } catch (error) {
      console.error(error);
      setActionError(
        error instanceof Error
          ? error.message
          : "Impossible d’approuver les demandes.",
      );
    } finally {
      actionInProgressRef.current = false;
      setProcessingAction(null);
    }
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingCompany || actionInProgressRef.current) return;
    actionInProgressRef.current = true;
    setProcessingAction("reject");
    setActionError(null);
    setActionMessage(null);
    try {
      const response = await fetch(
        `${getApiRoot()}/companies/${rejectingCompany.id}/status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            status: "REJECTED",
            rejectionReason: rejectionReason.trim(),
          }),
        },
      );
      if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        const message = Array.isArray(errorBody?.message)
          ? errorBody.message.join(", ")
          : errorBody?.message;
        throw new Error(message || "Impossible de refuser cette demande.");
      }
      setCompanies((prev) =>
        prev.filter((company) => company.id !== rejectingCompany.id),
      );
      setSelectedCompanyIds((current) => {
        const next = new Set(current);
        next.delete(rejectingCompany.id);
        return next;
      });
      setActionMessage("La demande a été refusée.");
      setRejectingCompany(null);
      setRejectionReason("");
      setDetailCompany(null);
    } catch (error) {
      console.error(error);
      setActionError(
        error instanceof Error ? error.message : "Impossible de refuser.",
      );
    } finally {
      actionInProgressRef.current = false;
      setProcessingAction(null);
    }
  };

  return (
    <main className="min-h-screen bg-[#f4f7fe] p-4 sm:p-6 lg:p-8">
      {/* ─── Barre de recherche et filtres ─── */}
      <div className="mb-6 flex flex-col gap-4 rounded-3xl bg-white p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        {/* Barre de recherche avec coins arrondis 3xl */}
        <div className="relative flex-1 rounded-3xl border border-slate-200 bg-slate-50 transition focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher (Nom, NIF, STAT, Responsable)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-3xl bg-transparent py-2.5 pl-11 pr-4 text-sm font-medium text-slate-800 outline-none"
          />
        </div>

        {/* Filtres avec coins arrondis 3xl */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { label: "Toutes", value: "ALL" },
            { label: "En attente", value: "PENDING" },
            { label: "Approuvées", value: "APPROVED" },
            { label: "Refusées", value: "REJECTED" },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setSelectedStatus(tab.value)}
              className={`whitespace-nowrap rounded-3xl px-4 py-2 text-xs font-bold transition ${
                selectedStatus === tab.value
                  ? "bg-[#10b981] text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {tab.label} ({countStatus(tab.value)})
            </button>
          ))}
        </div>
      </div>

      {(actionError || actionMessage) && (
        <div
          role={actionError ? "alert" : "status"}
          className={`mb-4 rounded-2xl border px-4 py-3 text-sm ${
            actionError
              ? "border-rose-200 bg-rose-50 text-rose-800"
              : "border-emerald-200 bg-emerald-50 text-emerald-800"
          }`}
        >
          {actionError || actionMessage}
        </div>
      )}

      {visiblePendingCompanies.length > 0 && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/70 px-4 py-3">
          <p className="text-sm font-medium text-slate-700">
            {selectedPendingIds.length} demande(s) sélectionnée(s) sur{" "}
            {visiblePendingCompanies.length} en attente affichée(s).
          </p>
          <button
            type="button"
            onClick={() => void handleApprove(selectedPendingIds)}
            disabled={
              selectedPendingIds.length === 0 || processingAction !== null
            }
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {processingAction === "bulkApprove" ? (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCheck className="h-4 w-4" />
            )}
            Approuver la sélection
          </button>
        </div>
      )}

      {/* ─── Tableau des demandes avec cardbox arrondie 3xl ─── */}
      <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm text-slate-600">
            <thead className="border-b border-slate-100 bg-slate-50 text-xs font-bold uppercase tracking-wide text-slate-500">
              <tr>
                <th scope="col" className="w-12 px-4 py-4">
                  <input
                    type="checkbox"
                    aria-label="Sélectionner toutes les demandes en attente affichées"
                    checked={allVisiblePendingSelected}
                    onChange={toggleVisiblePendingSelection}
                    disabled={
                      visiblePendingCompanies.length === 0 ||
                      processingAction !== null
                    }
                    className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                </th>
                <th scope="col" className="px-6 py-4">
                  Acteur
                </th>
                <th scope="col" className="px-6 py-4">
                  NIF
                </th>
                <th scope="col" className="px-6 py-4">
                  STAT
                </th>
                <th scope="col" className="px-6 py-4">
                  Région
                </th>
                <th scope="col" className="px-6 py-4">
                  Statut
                </th>
                <th scope="col" className="px-6 py-4 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCompanies.length > 0 ? (
                filteredCompanies.map((item) => {
                  const status = STATUS_CONFIG[item.verificationStatus] ?? {
                    label: item.verificationStatus,
                    badge: "bg-slate-100 text-slate-600 border-slate-200",
                    dot: "bg-slate-400",
                  };
                  const isHM = item.companyType === "HAUTE_MATSIATRA";
                  const regionLabel = getRegionLabel(item.companyType);

                  return (
                    <tr
                      key={item.id}
                      className="transition hover:bg-slate-50/70"
                    >
                      <td className="px-4 py-4">
                        {item.verificationStatus === "PENDING" && (
                          <input
                            type="checkbox"
                            aria-label={`Sélectionner ${item.companyName}`}
                            checked={selectedCompanyIds.has(item.id)}
                            onChange={() => toggleCompanySelection(item.id)}
                            disabled={processingAction !== null}
                            className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                          />
                        )}
                      </td>
                      {/* Acteur */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <CompanyAvatar
                            src={item.logoUrl || item.user?.avatarUrl}
                            name={item.companyName}
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full shadow-sm ${
                              isHM ? "bg-purple-100" : "bg-blue-100"
                            }`}
                            initialsClassName={`text-xs font-bold ${
                              isHM ? "text-purple-700" : "text-blue-700"
                            }`}
                          />
                          <div className="min-w-0">
                            <p className="truncate font-bold text-slate-900">
                              {item.companyName}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* NIF */}
                      <td className="px-6 py-4 font-mono text-xs font-semibold text-slate-700">
                        {item.nif || "—"}
                      </td>

                      {/* STAT */}
                      <td className="px-6 py-4 font-mono text-xs font-semibold text-slate-700">
                        {item.stat || "—"}
                      </td>

                      {/* Région */}
                      <td className="px-6 py-4 text-xs font-medium text-slate-600">
                        {regionLabel}
                      </td>

                      {/* Statut */}
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold ${status.badge}`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${status.dot}`}
                          />
                          {status.label}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {item.verificationStatus === "PENDING" && (
                            <>
                              <button
                                onClick={() => void handleApprove([item.id])}
                                disabled={processingAction !== null}
                                className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1.5 text-[11px] font-bold text-emerald-700 transition hover:bg-emerald-100 disabled:opacity-50"
                                title="Accepter"
                              >
                                {processingAction === "approve" ? (
                                  <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <Check className="h-3.5 w-3.5" />
                                )}
                                Accepter
                              </button>
                              <button
                                onClick={() => setRejectingCompany(item)}
                                disabled={processingAction !== null}
                                className="inline-flex items-center gap-1 rounded-lg bg-rose-50 px-2.5 py-1.5 text-[11px] font-bold text-rose-700 transition hover:bg-rose-100 disabled:opacity-50"
                                title="Refuser"
                              >
                                <X className="h-3.5 w-3.5" />
                                Refuser
                              </button>
                            </>
                          )}

                          <button
                            onClick={() => setDetailCompany(item)}
                            className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1.5 text-[11px] font-bold text-slate-700 transition hover:bg-slate-200"
                            title="Voir détails"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            Détails
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-14 text-center text-slate-500"
                  >
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                      <Building2 className="h-5 w-5 text-slate-400" />
                    </div>
                    <p className="text-sm font-semibold text-slate-700">
                      Aucune entreprise trouvée
                    </p>
                    <p className="mt-1 text-xs">
                      Aucune demande ne correspond à votre recherche ou filtre.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── Modales ─── */}
      {detailCompany && (
        <CompanyDetailModal
          company={detailCompany}
          onClose={() => setDetailCompany(null)}
          onApprove={(id) => void handleApprove([id])}
          processingAction={processingAction}
          onReject={(c) => {
            setRejectingCompany(c);
            setDetailCompany(null);
          }}
        />
      )}

      {rejectingCompany && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl">
            <h3 className="text-base font-bold text-slate-900">
              Motif du refus
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Veuillez indiquer la raison du refus pour{" "}
              <span className="font-semibold text-slate-700">
                {rejectingCompany.companyName}
              </span>
              .
            </p>
            <form
              onSubmit={handleRejectSubmit}
              className="mt-4 flex flex-col gap-4"
            >
              <textarea
                required
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Ex : NIF invalide ou documents manquants..."
                className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
              />
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setRejectingCompany(null);
                    setRejectionReason("");
                  }}
                  disabled={processingAction !== null}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 disabled:opacity-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={processingAction !== null}
                  className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-rose-700 disabled:opacity-50"
                >
                  {processingAction === "reject"
                    ? "Refus..."
                    : "Confirmer le refus"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}