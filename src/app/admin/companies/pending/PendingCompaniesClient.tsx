"use client";

import { useState, useRef, useEffect } from "react";
import CompanyDetailModal, { CompanyRequest } from "./CompanyDetailModal";
import CompanyAvatar from "../../../components/CompanyAvatar";

export type { CompanyRequest };

interface PendingCompaniesClientProps {
  initialCompanies?: CompanyRequest[];
}

// ─── Helpers & Constants ───
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

const getInitials = (name: string) =>
  (name || "?")
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

const getRegionLabel = (type: string) => {
  if (type === "HAUTE_MATSIATRA") return "Haute Matsiatra";
  if (type === "OTHER_REGION") return "Autre Région";
  return "International";
};

// ─── Sous-composant : Carte Entreprise ───
interface CompanyCardProps {
  item: CompanyRequest;
  onApprove: (id: string) => void;
  onReject: (company: CompanyRequest) => void;
  onViewDetails: (company: CompanyRequest) => void;
  processingAction: "approve" | "reject" | null;
}

function CompanyCard({
  item,
  onApprove,
  onReject,
  onViewDetails,
  processingAction,
}: CompanyCardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Fermer le menu au clic extérieur
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const status = STATUS_CONFIG[item.verificationStatus] ?? {
    label: item.verificationStatus,
    badge: "bg-slate-100 text-slate-600 border-slate-200",
    dot: "bg-slate-400",
  };
  const regionLabel = getRegionLabel(item.companyType);

  return (
    <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 p-6 flex flex-col relative">
      {/* Header : Avatar + Statut */}
      <div className="flex justify-between items-start mb-4">
        {/* Avatar avec gestion de la photoUrl */}
        <CompanyAvatar
          src={item.logoUrl || item.user?.avatarUrl}
          name={item.companyName}
          className="flex h-[72px] w-[72px] items-center justify-center rounded-full border-4 border-white bg-slate-100 text-2xl font-bold shadow-sm ring-1 ring-slate-100"
          initialsClassName="text-slate-500"
        />

        {/* Statut en haut à droite */}
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border ${status.badge}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
          {status.label}
        </span>
      </div>

      {/* Infos principales */}
      <div className="flex-1">
        <h3 className="text-xl font-bold text-slate-900 leading-tight mb-1 truncate">
          {item.companyName}
        </h3>
        <p className="text-sm font-medium text-slate-600 mb-4 truncate">
          {item.managerName || "Nom de l'acteur inconnu"}
        </p>

        {/* Détails (NIF, STAT, Région) */}
        <h3 className="text-slate-500 text-sm font-normal leading-relaxed flex flex-col gap-1.5">
          <span className="truncate flex items-center gap-2">
            <span className="w-12 text-slate-400 text-[10px] uppercase font-bold tracking-wider">
              NIF
            </span>
            <span className="font-mono text-slate-700">{item.nif || "—"}</span>
          </span>
          <span className="truncate flex items-center gap-2">
            <span className="w-12 text-slate-400 text-[10px] uppercase font-bold tracking-wider">
              STAT
            </span>
            <span className="font-mono text-slate-700">{item.stat || "—"}</span>
          </span>
          <span className="truncate flex items-center gap-2">
            <span className="w-12 text-slate-400 text-[10px] uppercase font-bold tracking-wider">
              Région
            </span>
            <span className="text-slate-700">{regionLabel}</span>
          </span>
        </h3>
      </div>

      {/* Actions en bas */}
      <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
        {/* Actions rapides (Accepter/Refuser) à gauche */}
        <div className="flex items-center gap-2">
          {item.verificationStatus === "PENDING" && (
            <>
              <button
                onClick={() => onReject(item)}
                disabled={processingAction !== null}
                className="px-3 py-2 rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-pink-50 hover:text-pink-600 hover:border-pink-200 text-xs font-semibold transition disabled:opacity-50"
              >
                Refuser
              </button>
              <button
                onClick={() => onApprove(item.id)}
                disabled={processingAction !== null}
                className="px-3 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition shadow-sm disabled:opacity-50 flex items-center gap-1"
              >
                {processingAction === "approve" ? "..." : "Accepter"}
              </button>
            </>
          )}
        </div>

        {/* Boutons "Voir détails" et "..." à droite */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onViewDetails(item)}
            className="px-4 py-2 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition shadow-sm"
          >
            Voir détails
          </button>

          {/* Menu ... vertical */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition border border-transparent hover:border-slate-200"
              aria-label="Plus d'options"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 13a1 1 0 100-2 1 1 0 000 2zM12 7a1 1 0 100-2 1 1 0 000 2zM12 19a1 1 0 100-2 1 1 0 000 2z" />
              </svg>
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 bottom-full mb-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                <button
                  onClick={() => {
                    onViewDetails(item);
                    setIsMenuOpen(false);
                  }}
                  className="w-full px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2 text-left"
                >
                  <svg
                    className="w-4 h-4 text-slate-400"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                  Voir les détails complets
                </button>
                {item.kbisUrl && (
                  <a
                    href={item.kbisUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2 text-left border-t border-slate-50 mt-1 pt-1.5"
                  >
                    <svg
                      className="w-4 h-4 text-slate-400"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"
                      />
                    </svg>
                    Ouvrir Kbis
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Composant Principal ───
export default function PendingCompaniesClient({
  initialCompanies = [],
}: PendingCompaniesClientProps) {
  const [companies, setCompanies] = useState<CompanyRequest[]>(
    initialCompanies ?? [],
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");

  const [rejectingCompany, setRejectingCompany] =
    useState<CompanyRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [processingAction, setProcessingAction] = useState<
    "approve" | "reject" | null
  >(null);
  const [detailCompany, setDetailCompany] = useState<CompanyRequest | null>(
    null,
  );

  const actionInProgressRef = useRef(false);

  const safeCompanies = Array.isArray(companies) ? companies : [];

  // Filtrage
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

  // Actions API
  const handleApprove = async (id: string) => {
    if (actionInProgressRef.current) return;
    actionInProgressRef.current = true;
    setProcessingAction("approve");
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/companies/${id}/status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "APPROVED" }),
        },
      );
      if (!response.ok)
        throw new Error("Erreur lors de la mise à jour du statut");
      setCompanies((prev) =>
        prev.map((c) =>
          c.id === id ? { ...c, verificationStatus: "APPROVED" } : c,
        ),
      );
      setDetailCompany(null);
    } catch (error) {
      console.error("Erreur lors de l'approbation", error);
      alert("Impossible d'approuver l'entreprise en base de données.");
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
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/companies/${rejectingCompany.id}/status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: "REJECTED",
            rejectionReason: rejectionReason.trim(),
          }),
        },
      );
      if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        throw new Error(
          errorBody?.message || "Erreur lors du refus de l'entreprise",
        );
      }
      setCompanies((prev) =>
        prev.filter((company) => company.id !== rejectingCompany.id),
      );
      setRejectingCompany(null);
      setRejectionReason("");
      setDetailCompany(null);
    } catch (error) {
      console.error("Erreur lors du refus", error);
      alert(
        error instanceof Error
          ? error.message
          : "Impossible de refuser l'entreprise.",
      );
    } finally {
      actionInProgressRef.current = false;
      setProcessingAction(null);
    }
  };

  return (
    <div className="flex flex-col gap-6 mt-1 w-full text-slate-800 relative">
      {/* ─── Barre recherche + filtres ─── */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-xs p-3.5">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          <div className="relative w-full lg:w-80">
            <svg
              className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Rechercher (Nom, NIF, STAT, Resp.)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 text-xs bg-slate-50 border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-500/35 focus:border-emerald-500 text-slate-700 placeholder-slate-400 py-2.5 shadow-2xs transition"
            />
          </div>

          <div className="flex items-center gap-1.5 flex-wrap justify-end">
            {[
              { label: "Toutes", value: "ALL" },
              { label: "En attente", value: "PENDING" },
              { label: "Approuvées", value: "APPROVED" },
              { label: "Refusées", value: "REJECTED" },
            ].map((tab) => (
              <button
                key={tab.value}
                onClick={() => setSelectedStatus(tab.value)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition ${
                  selectedStatus === tab.value
                    ? "bg-black text-white shadow-xs"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                }`}
              >
                {tab.label} ({countStatus(tab.value)})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Grille de cards ─── */}
      {filteredCompanies.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCompanies.map((item) => (
            <CompanyCard
              key={item.id}
              item={item}
              onApprove={handleApprove}
              onReject={setRejectingCompany}
              onViewDetails={setDetailCompany}
              processingAction={processingAction}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xs py-16 px-6 text-center">
          <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-slate-50 flex items-center justify-center">
            <svg
              className="w-6 h-6 text-slate-300"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
          </div>
          <p className="text-sm font-semibold text-slate-700 mb-1">
            Aucune entreprise trouvée
          </p>
          <p className="text-xs text-slate-400">
            Aucune demande ne correspond à votre recherche ou filtre.
          </p>
        </div>
      )}

      {/* ─── Modales ─── */}
      {detailCompany && (
        <CompanyDetailModal
          company={detailCompany}
          onClose={() => setDetailCompany(null)}
          onApprove={handleApprove}
          processingAction={processingAction}
          onReject={(c) => {
            setRejectingCompany(c);
            setDetailCompany(null);
          }}
        />
      )}

      {rejectingCompany && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Motif du refus
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Veuillez indiquer la raison du refus pour{" "}
              <span className="font-semibold text-slate-700">
                {rejectingCompany.companyName}
              </span>
              .
            </p>
            <form onSubmit={handleRejectSubmit} className="flex flex-col gap-4">
              <textarea
                required
                rows={4}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Ex : Numéro NIF invalide ou documents illisibles..."
                className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 text-slate-700 placeholder-slate-400 resize-none transition"
              />
              <div className="flex items-center justify-end gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => {
                    setRejectingCompany(null);
                    setRejectionReason("");
                  }}
                  disabled={processingAction !== null}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={processingAction !== null}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-pink-600 hover:bg-pink-700 text-white transition shadow-sm disabled:opacity-50"
                >
                  {processingAction === "reject"
                    ? "Refus en cours..."
                    : "Confirmer le refus"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
