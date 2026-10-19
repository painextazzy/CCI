"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Building2,
  CalendarDays,
  ChevronDown,
  ChevronUp,
  Clock3,
  Globe,
  LoaderCircle,
  MapPin,
  Phone,
  Search,
} from "lucide-react";
import { getApiRoot } from "../../lib/auth";
import { useAuth } from "../../providers/AuthProvider";

interface ContractCompany {
  id: string;
  name: string;
  logoUrl: string | null;
  avatarUrl: string | null;
  sector: string;
  companyType: "HAUTE_MATSIATRA" | "OTHER_REGION" | "INTERNATIONAL";
  address: string;
  phone: string;
  website: string | null;
}

interface ContractRecord {
  id: string;
  senderCompanyId: string;
  receiverCompanyId: string;
  senderCompany: ContractCompany;
  receiverCompany: ContractCompany;
  title?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  acceptedAt?: string;
}

interface PartnerRecord extends ContractCompany {
  contracts: ContractRecord[];
}

const COMPANY_TYPE_LABELS: Record<ContractCompany["companyType"], string> = {
  HAUTE_MATSIATRA: "Haute Matsiatra",
  OTHER_REGION: "Autre région",
  INTERNATIONAL: "International",
};

function formatDate(value?: string): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeZone: "UTC",
  }).format(date);
}

function formatPartnershipDuration(startValue?: string, endValue?: string) {
  if (!startValue || !endValue) return null;
  const start = new Date(`${startValue.slice(0, 10)}T00:00:00Z`);
  const end = new Date(`${endValue.slice(0, 10)}T00:00:00Z`);
  if (
    Number.isNaN(start.getTime()) ||
    Number.isNaN(end.getTime()) ||
    end < start
  ) {
    return null;
  }

  const addMonths = (months: number) => {
    const targetMonth = start.getUTCMonth() + months;
    const targetYear = start.getUTCFullYear() + Math.floor(targetMonth / 12);
    const normalizedMonth = targetMonth % 12;
    const lastDay = new Date(
      Date.UTC(targetYear, normalizedMonth + 1, 0),
    ).getUTCDate();
    return new Date(
      Date.UTC(
        targetYear,
        normalizedMonth,
        Math.min(start.getUTCDate(), lastDay),
      ),
    );
  };

  let months =
    (end.getUTCFullYear() - start.getUTCFullYear()) * 12 +
    end.getUTCMonth() -
    start.getUTCMonth();
  if (addMonths(months) > end) months -= 1;

  const elapsedDays = Math.floor(
    (end.getTime() - addMonths(months).getTime()) / 86_400_000,
  );
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  const durationParts = [
    years ? `${years} an${years > 1 ? "s" : ""}` : "",
    remainingMonths ? `${remainingMonths} mois` : "",
    elapsedDays ? `${elapsedDays} jour${elapsedDays > 1 ? "s" : ""}` : "",
  ].filter(Boolean);

  return durationParts.length ? durationParts.join(" ") : "Moins d'un jour";
}

export default function PartenairesPage() {
  const { user } = useAuth();
  const [contracts, setContracts] = useState<ContractRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  // ✅ Suivi des cartes dont tous les contrats sont ouverts
  const [expandedPartners, setExpandedPartners] = useState<Set<string>>(
    new Set(),
  );

  useEffect(() => {
    let active = true;

    async function loadPartners() {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`${getApiRoot()}/messages/contracts`, {
          credentials: "include",
          cache: "no-store",
        });
        if (!response.ok) {
          const result = (await response.json().catch(() => null)) as {
            message?: string;
          } | null;
          throw new Error(
            result?.message || "Impossible de charger les partenaires.",
          );
        }
        const result = (await response.json()) as ContractRecord[];
        if (active) setContracts(Array.isArray(result) ? result : []);
      } catch (cause) {
        if (active) {
          setError(
            cause instanceof Error
              ? cause.message
              : "Impossible de charger les partenaires.",
          );
        }
      } finally {
        if (active) setIsLoading(false);
      }
    }

    void loadPartners();
    return () => {
      active = false;
    };
  }, []);

  const partners = useMemo(() => {
    const companyId = user?.company?.id;
    if (!companyId) return [];

    const uniquePartners = new Map<string, PartnerRecord>();
    for (const contract of contracts) {
      const isSender = contract.senderCompanyId === companyId;
      const partner = isSender
        ? contract.receiverCompany
        : contract.receiverCompanyId === companyId
          ? contract.senderCompany
          : null;
      if (!partner) continue;

      const partnerRecord = uniquePartners.get(partner.id) ?? {
        ...partner,
        contracts: [],
      };
      partnerRecord.contracts.push(contract);
      uniquePartners.set(partner.id, partnerRecord);
    }
    return [...uniquePartners.values()].map((partner) => ({
      ...partner,
      contracts: partner.contracts.sort(
        (first, second) =>
          new Date(second.acceptedAt ?? 0).getTime() -
          new Date(first.acceptedAt ?? 0).getTime(),
      ),
    }));
  }, [contracts, user?.company?.id]);

  const filteredPartners = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return partners;
    return partners.filter((p) => {
      return (
        p.name.toLowerCase().includes(q) ||
        (p.sector || "").toLowerCase().includes(q) ||
        (p.address || "").toLowerCase().includes(q) ||
        p.contracts.some(
          (contract) =>
            (contract.title || "").toLowerCase().includes(q) ||
            (contract.description || "").toLowerCase().includes(q),
        ) ||
        COMPANY_TYPE_LABELS[p.companyType].toLowerCase().includes(q)
      );
    });
  }, [partners, searchQuery]);

  // ✅ Toggle "Voir plus / Voir moins"
  const togglePartnerExpanded = (partnerId: string) => {
    setExpandedPartners((prev) => {
      const next = new Set(prev);
      if (next.has(partnerId)) next.delete(partnerId);
      else next.add(partnerId);
      return next;
    });
  };

  return (
    <div className="space-y-4 pt-6">
      {/* ─── Barre de recherche ─── */}
      <div className="relative w-full sm:w-1/2 lg:w-[45%]">
        <Search
          className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400"
          strokeWidth={2.2}
        />
        <input
          type="text"
          placeholder="Rechercher un partenaire..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-11 pr-4 py-3 rounded-xl bg-white border-2 border-[#F2F2F2] text-xs font-medium text-slate-800 placeholder-slate-300 focus:outline-none focus:border-emerald-500 transition-colors shadow-sm"
        />
      </div>

      {/* ─── Contenu ─── */}
      {error && (
        <p
          role="alert"
          className="rounded-xl border border-[#F2F2F2] bg-rose-50 px-4 py-3 text-xs text-rose-700"
        >
          {error}
        </p>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-xs font-medium text-slate-500">
          <LoaderCircle className="h-4 w-4 animate-spin text-emerald-600" />
          Chargement des partenaires...
        </div>
      ) : partners.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#F2F2F2] bg-white px-6 py-12 text-center">
          <p className="text-xs font-semibold text-slate-500">
            Aucun partenaire lié à un contrat accepté pour le moment.
          </p>
        </div>
      ) : filteredPartners.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#F2F2F2] bg-white px-6 py-12 text-center">
          <p className="text-xs font-semibold text-slate-500">
            Aucun partenaire ne correspond à « {searchQuery} ».
          </p>
          <button
            onClick={() => setSearchQuery("")}
            className="mt-3 text-xs font-bold text-emerald-600 hover:underline"
          >
            Effacer la recherche
          </button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredPartners.map((partner) => {
            const photoUrl = partner.logoUrl || partner.avatarUrl;
            const website = partner.website
              ? partner.website.startsWith("http")
                ? partner.website
                : `https://${partner.website}`
              : null;

            const isExpanded = expandedPartners.has(partner.id);
            const hasMoreContracts = partner.contracts.length > 1;
            // ✅ Affiche 1 contrat par défaut, tous si "Voir plus"
            const visibleContracts = isExpanded
              ? partner.contracts
              : partner.contracts.slice(0, 1);
            const remainingCount = partner.contracts.length - 1;

            return (
              <article
                key={partner.id}
                className="rounded-2xl border border-[#F2F2F2] bg-white p-4 transition-colors hover:border-emerald-500"
              >
                {/* En-tête : logo + nom cliquable + secteur */}
                <div className="flex items-center gap-3">
                  {photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={photoUrl}
                      alt={`Logo de ${partner.name}`}
                      className="h-14 w-14 rounded-xl border border-[#F2F2F2] object-contain shrink-0"
                    />
                  ) : (
                    <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 shrink-0">
                      <Building2 className="h-6 w-6" />
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    {/* ✅ Nom cliquable → redirige vers le profil */}
                    <Link
                      href={`/acteur/entreprises/${partner.id}`}
                      className="block truncate text-sm font-extrabold text-slate-900 hover:text-emerald-700 hover:underline transition-colors"
                      title={`Voir le profil de ${partner.name}`}
                    >
                      {partner.name}
                    </Link>
                    <p className="truncate text-xs text-slate-500">
                      {partner.sector || "Secteur non renseigné"}
                    </p>
                  </div>
                </div>

                {/* Type d'acteur */}
                <div className="mt-3">
                  <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700">
                    {COMPANY_TYPE_LABELS[partner.companyType]}
                  </span>
                </div>

                {/* Infos côte à côte */}
                <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-slate-600">
                  <span className="inline-flex items-center gap-1.5 min-w-0">
                    <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                    <span className="truncate">
                      {partner.address || "Adresse non renseignée"}
                    </span>
                  </span>

                  {partner.phone && (
                    <>
                      <span
                        className="w-px h-3.5 bg-[#F2F2F2] shrink-0"
                        aria-hidden="true"
                      />
                      <span className="inline-flex items-center gap-1.5 shrink-0">
                        <Phone className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                        <span>{partner.phone}</span>
                      </span>
                    </>
                  )}

                  {website && (
                    <>
                      <span
                        className="w-px h-3.5 bg-[#F2F2F2] shrink-0"
                        aria-hidden="true"
                      />
                      <a
                        href={website}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="inline-flex items-center gap-1.5 text-emerald-700 hover:underline shrink-0"
                      >
                        <Globe className="h-3.5 w-3.5 shrink-0" />
                        Site web
                      </a>
                    </>
                  )}
                </div>

                {/* ✅ Partenariats : 1 par défaut + Voir plus */}
                <div className="mt-4 space-y-3">
                  {visibleContracts.map((contract) => {
                    const startDate = formatDate(contract.startDate);
                    const endDate = formatDate(contract.endDate);
                    const duration = formatPartnershipDuration(
                      contract.startDate,
                      contract.endDate,
                    );

                    return (
                      <div
                        key={contract.id}
                        className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-3"
                      >
                        <p className="text-[10px] font-bold uppercase tracking-wide text-emerald-700">
                          Objet du partenariat
                        </p>
                        <p className="mt-1 text-xs font-semibold text-slate-800">
                          {contract.title || "Objet non renseigné"}
                        </p>
                        {contract.description && (
                          <p className="mt-1 line-clamp-2 whitespace-pre-wrap text-[11px] leading-5 text-slate-600">
                            {contract.description}
                          </p>
                        )}
                        {(startDate || endDate) && (
                          <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-slate-600">
                            <span className="inline-flex items-center gap-1">
                              <CalendarDays className="h-3 w-3 text-emerald-700" />
                              {startDate && endDate
                                ? `${startDate} – ${endDate}`
                                : startDate
                                  ? `À partir du ${startDate}`
                                  : `Jusqu'au ${endDate}`}
                            </span>
                            {duration && (
                              <span className="inline-flex items-center gap-1">
                                <Clock3 className="h-3 w-3 text-emerald-700" />
                                {duration}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* ✅ "Voir plus" / "Voir moins" */}
                {hasMoreContracts && (
                  <button
                    type="button"
                    onClick={() => togglePartnerExpanded(partner.id)}
                    className="mt-3 inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-800 transition-colors"
                  >
                    {isExpanded ? (
                      <>
                        Voir moins
                        <ChevronUp className="h-3.5 w-3.5" />
                      </>
                    ) : (
                      <>
                        Voir plus ({remainingCount} autre
                        {remainingCount > 1 ? "s" : ""})
                        <ChevronDown className="h-3.5 w-3.5" />
                      </>
                    )}
                  </button>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
