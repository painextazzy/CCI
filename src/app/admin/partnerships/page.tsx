"use client";

import { useEffect, useMemo, useState } from "react";
import { FileText, LoaderCircle, Search, X } from "lucide-react";
import { getApiRoot } from "../../lib/auth";
import CompanyAvatar from "../../components/CompanyAvatar";

interface PartnershipContract {
  id: string;
  reference: string;
  senderCompanyName: string;
  receiverCompanyName: string;
  title: string;
  description: string;
  amount: string;
  startDate: string;
  endDate: string;
  senderCompanyLogoUrl?: string | null;
  senderLogoUrl?: string | null;
  senderAvatarUrl?: string | null;
  receiverCompanyLogoUrl?: string | null;
  receiverLogoUrl?: string | null;
  receiverAvatarUrl?: string | null;
  status: "UPCOMING" | "IN_PROGRESS" | "COMPLETED";
}

const numberFormatter = new Intl.NumberFormat("fr-FR", {
  maximumFractionDigits: 0,
});

const statusLabel: Record<PartnershipContract["status"], string> = {
  UPCOMING: "À venir",
  IN_PROGRESS: "En cours",
  COMPLETED: "Terminé",
};

const statusClass: Record<PartnershipContract["status"], string> = {
  UPCOMING: "bg-blue-50 text-blue-700 ring-blue-200",
  IN_PROGRESS: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  COMPLETED: "bg-slate-100 text-slate-600 ring-slate-200",
};

function formatDate(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (!match) return value;

  const [, year, month, day] = match;
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(Number(year), Number(month) - 1, Number(day)));
}

export default function AdminPartnershipsPage() {
  const [contracts, setContracts] = useState<PartnershipContract[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedContract, setSelectedContract] =
    useState<PartnershipContract | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadContracts() {
      try {
        const response = await fetch(
          `${getApiRoot()}/admin/dashboard/contracts`,
          {
            credentials: "include",
            cache: "no-store",
            signal: controller.signal,
          },
        );
        if (!response.ok) {
          throw new Error("Impossible de charger les contrats.");
        }
        const data: PartnershipContract[] = await response.json();
        setContracts(data);
      } catch (cause) {
        if (controller.signal.aborted) return;
        setError(
          cause instanceof Error ? cause.message : "Erreur de chargement.",
        );
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }

    void loadContracts();
    return () => controller.abort();
  }, []);

  const filteredContracts = useMemo(() => {
    const query = searchTerm.trim().toLocaleLowerCase("fr");
    if (!query) return contracts;
    return contracts.filter((contract) =>
      [
        contract.reference,
        contract.senderCompanyName,
        contract.receiverCompanyName,
        contract.title,
        statusLabel[contract.status],
      ].some((value) => value.toLocaleLowerCase("fr").includes(query)),
    );
  }, [contracts, searchTerm]);

  return (
    <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-emerald-700">
            Suivi des contrats
          </p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900">
            Partenariats
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Entreprises ayant concrétisé un partenariat par un contrat accepté.
          </p>
        </div>
        {!isLoading && !error && (
          <span className="self-start rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 sm:self-auto">
            {numberFormatter.format(contracts.length)} contrats
          </span>
        )}
      </header>

      <label className="relative block">
        <Search
          className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
          aria-hidden="true"
        />
        <input
          type="search"
          placeholder="Rechercher par numéro de contrat ou entreprise…"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          aria-label="Rechercher un partenariat"
          className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
        />
      </label>

      {error && (
        <div
          role="alert"
          className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800"
        >
          {error}
        </div>
      )}

      <section
        aria-label="Liste des partenariats"
        className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm"
      >
        {isLoading ? (
          <div className="flex min-h-52 items-center justify-center">
            <LoaderCircle
              className="h-6 w-6 animate-spin text-emerald-600"
              aria-label="Chargement des contrats"
            />
          </div>
        ) : !error && filteredContracts.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <FileText className="mx-auto h-8 w-8 text-slate-300" />
            <p className="mt-3 text-sm font-semibold text-slate-700">
              {contracts.length === 0
                ? "Aucun contrat accepté pour le moment."
                : "Aucun contrat ne correspond à cette recherche."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1120px] text-left text-sm text-slate-600">
              <thead className="border-b border-slate-100 bg-slate-50 text-xs font-bold uppercase tracking-wide text-slate-500">
                <tr>
                  <th scope="col" className="px-5 py-4">
                    N° du contrat
                  </th>
                  <th scope="col" className="px-5 py-4">
                    Acteur initiateur
                  </th>
                  <th scope="col" className="px-5 py-4">
                    Autre acteur
                  </th>
                  <th scope="col" className="px-5 py-4">
                    État du partenariat
                  </th>
                  <th scope="col" className="px-5 py-4">
                    Date de début
                  </th>
                  <th scope="col" className="px-5 py-4">
                    Date de fin
                  </th>
                  <th scope="col" className="px-5 py-4 text-right">
                    Détails
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredContracts.map((contract) => (
                  <tr
                    key={contract.id}
                    className="transition hover:bg-slate-50/70"
                  >
                    <td className="whitespace-nowrap px-5 py-4 font-bold text-slate-900">
                      {contract.reference}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <CompanyAvatar
                          src={
                            contract.senderAvatarUrl ||
                            contract.senderCompanyLogoUrl ||
                            contract.senderLogoUrl
                          }
                          name={contract.senderCompanyName}
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100"
                          initialsClassName="text-[10px] font-bold text-slate-600"
                        />
                        <span className="max-w-56 truncate font-semibold text-slate-900">
                          {contract.senderCompanyName}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <CompanyAvatar
                          src={
                            contract.receiverAvatarUrl ||
                            contract.receiverCompanyLogoUrl ||
                            contract.receiverLogoUrl
                          }
                          name={contract.receiverCompanyName}
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100"
                          initialsClassName="text-[10px] font-bold text-slate-600"
                        />
                        <span className="max-w-56 truncate font-semibold text-slate-900">
                          {contract.receiverCompanyName}
                        </span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${statusClass[contract.status]}`}
                      >
                        {statusLabel[contract.status]}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                      {formatDate(contract.startDate)}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                      {formatDate(contract.endDate)}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedContract(contract)}
                        className="rounded-lg px-3 py-2 text-xs font-bold text-emerald-700 transition hover:bg-emerald-50"
                      >
                        Voir les détails
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {selectedContract && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelectedContract(null);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="partnership-detail-title"
            className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl sm:p-8"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                  {selectedContract.reference}
                </p>
                <h2
                  id="partnership-detail-title"
                  className="mt-1 text-xl font-extrabold text-slate-900"
                >
                  Détails du partenariat
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedContract(null)}
                aria-label="Fermer les détails"
                className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-6 space-y-4">
              <DetailRow label="Entreprise initiatrice">
                <div className="flex items-center gap-2">
                  <CompanyAvatar
                    src={
                      selectedContract.senderAvatarUrl ||
                      selectedContract.senderCompanyLogoUrl ||
                      selectedContract.senderLogoUrl
                    }
                    name={selectedContract.senderCompanyName}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white"
                    initialsClassName="text-xs font-bold text-slate-600"
                  />
                  {selectedContract.senderCompanyName}
                </div>
              </DetailRow>
              <DetailRow label="Entreprise partenaire">
                <div className="flex items-center gap-2">
                  <CompanyAvatar
                    src={
                      selectedContract.receiverAvatarUrl ||
                      selectedContract.receiverCompanyLogoUrl ||
                      selectedContract.receiverLogoUrl
                    }
                    name={selectedContract.receiverCompanyName}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white"
                    initialsClassName="text-xs font-bold text-slate-600"
                  />
                  {selectedContract.receiverCompanyName}
                </div>
              </DetailRow>
              <DetailRow label="Objet du contrat">
                {selectedContract.title}
              </DetailRow>
              <DetailRow label="État du partenariat">
                <span
                  className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${statusClass[selectedContract.status]}`}
                >
                  {statusLabel[selectedContract.status]}
                </span>
              </DetailRow>
              <div className="grid grid-cols-2 gap-3">
                <DetailRow label="Date de début">
                  {formatDate(selectedContract.startDate)}
                </DetailRow>
                <DetailRow label="Date de fin">
                  {formatDate(selectedContract.endDate)}
                </DetailRow>
              </div>
              <DetailRow label="Montant du contrat">
                {numberFormatter.format(Number(selectedContract.amount))} Ar
              </DetailRow>
              <DetailRow label="Description">
                <span className="whitespace-pre-wrap">
                  {selectedContract.description}
                </span>
              </DetailRow>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}

function DetailRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl bg-slate-50 p-3">
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>
      <div className="mt-1 text-sm font-semibold text-slate-800">{children}</div>
    </div>
  );
}
