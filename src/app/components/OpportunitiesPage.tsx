"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  Search,
  Clock,
  MapPin,
  CalendarDays,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  PlusCircle,
  Globe,
} from "lucide-react";
import { getApiRoot } from "../lib/auth";
import { useAuth } from "../providers/AuthProvider";

// Alignement exact avec votre backend NestJS / TypeORM
export type AnnonceType = "OFFRE" | "DEMANDE";

export interface CompanyDetails {
  id: string;
  userId?: string;
  name: string;
  activitySector?: string;
  companyType?: "HAUTE_MATSIATRA" | "OTHER_REGION" | "INTERNATIONAL";
  address?: string;
  logoUrl?: string;
  avatarUrl?: string | null;
  nif?: string;
  stat?: string;
  phone?: string;
  website?: string;
  needsDescription?: string;
  verificationStatus?: "PENDING" | "APPROVED" | "REJECTED";
}

export interface Opportunity {
  id: string | number;
  title: string;
  category: string;
  description: string;
  annonceType: AnnonceType;
  status: "OPEN" | "IN_PROGRESS" | "CLOSED";
  specificLocation?: string;
  deadline?: string;
  createdAt: string;
  timeAgo?: string;
  company: CompanyDetails;
}

function formatTimeAgo(isoDate: string): string {
  if (!isoDate) return "Date inconnue";

  const now = new Date();
  const past = new Date(isoDate);
  const diffMs = now.getTime() - past.getTime();

  if (diffMs < 0) return "À l'instant";

  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (seconds < 60) return "À l'instant";
  if (minutes < 60) return `Il y a ${minutes} min`;
  if (hours < 24) return `Il y a ${hours} h`;
  if (days === 1) return "Hier";
  if (days < 7) return `Il y a ${days} j`;
  if (weeks < 5) return `Il y a ${weeks} sem.`;
  if (months < 12) return `Il y a ${months} mois`;
  return `Il y a ${years} an${years > 1 ? "s" : ""}`;
}

function formatDeadline(isoDate: string): string {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return "Date inconnue";

  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeZone: "UTC",
  }).format(date);
}

function formatWebsite(url?: string): string {
  if (!url) return "";
  return url
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/$/, "");
}

const DESCRIPTION_MAX_LENGTH = 180;
const INITIAL_VISIBLE_COUNT = 6;
const LOAD_MORE_BATCH = 6;
const SKELETON_DELAY = 700;

export default function OpportunitiesPage({
  isPublic = false,
}: {
  isPublic?: boolean;
}) {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sendingInterestId, setSendingInterestId] = useState<string | number | null>(null);
  const [interestFeedback, setInterestFeedback] = useState<{
    id: string | number;
    message: string;
    success: boolean;
  } | null>(null);

  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COUNT);
  const [loadingMore, setLoadingMore] = useState(false);

  const loadMoreRef = useRef<HTMLDivElement>(null);

  const [, setTick] = useState(0);

  const [expandedDescriptions, setExpandedDescriptions] = useState<
    Set<string | number>
  >(new Set());

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedAnnonceType, setSelectedAnnonceType] = useState<
    "OFFRE" | "DEMANDE" | "ALL"
  >("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");

  const categoriesList = [
    "Sous-traitance",
    "Partenariat commercial",
    "Achat groupé",
    "Distribution",
    "Appel d'offres",
    "Co-développement",
  ];

  const toggleDescription = useCallback((id: string | number) => {
    setExpandedDescriptions((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleExpressInterest = useCallback(
    async (opportunity: Opportunity) => {
      if (!user?.company?.id || user.role !== "COMPANY") {
        setInterestFeedback({
          id: opportunity.id,
          message: "Connectez-vous avec un compte entreprise pour envoyer une demande.",
          success: false,
        });
        return;
      }

      setSendingInterestId(opportunity.id);
      setInterestFeedback(null);

      try {
        const response = await fetch(
          `${getApiRoot()}/interests/${opportunity.id}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({}),
          },
        );
        const result = await response.json().catch(() => null);

        if (!response.ok) {
          const message = Array.isArray(result?.message)
            ? result.message.join(" ")
            : result?.message;
          throw new Error(message || "Impossible d'envoyer votre demande.");
        }

        setInterestFeedback({
          id: opportunity.id,
          message: "Votre demande d'intérêt a été envoyée.",
          success: true,
        });
      } catch (cause) {
        setInterestFeedback({
          id: opportunity.id,
          message:
            cause instanceof Error
              ? cause.message
              : "Impossible d'envoyer votre demande.",
          success: false,
        });
      } finally {
        setSendingInterestId(null);
      }
    },
    [user],
  );

  useEffect(() => {
    async function fetchAnnouncements() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`${getApiRoot()}/announcements`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });

        if (!res.ok) {
          throw new Error(
            "Impossible de charger les annonces depuis la base de données.",
          );
        }

        const data = await res.json();

        const formattedData: Opportunity[] = data.map((item: any) => ({
          id: item.id,
          title: item.title,
          category: item.category,
          description: item.description,
          annonceType: item.type as AnnonceType,
          status: item.status || "OPEN",
          specificLocation: item.specificLocation,
          deadline: item.deadline,
          createdAt: item.createdAt,
          company: {
            id: item.company?.id || "",
            userId: item.company?.userId,
            name:
              item.company?.companyName ||
              item.company?.name ||
              "Entreprise CCI",
            activitySector:
              item.company?.sector === "AUTRE"
                ? item.company?.sectorOther || "Autre secteur"
                : item.company?.sector || "Non spécifié",
            companyType: item.company?.companyType,
            address: item.company?.address || "Adresse non renseignée",
            logoUrl: item.company?.logoUrl,
            avatarUrl: item.company?.user?.avatarUrl,
            nif: item.company?.nif || "Non renseigné",
            stat: item.company?.stat || "Non renseigné",
            phone: item.company?.phone || "Non renseigné",
            website: item.company?.website,
            needsDescription: item.company?.needsDescription,
            verificationStatus: item.company?.verificationStatus || "APPROVED",
          },
        }));

        setOpportunities(formattedData);
      } catch (err: any) {
        console.error("Erreur de chargement des annonces :", err);
        setError(err.message || "Erreur de connexion au serveur.");
      } finally {
        setLoading(false);
      }
    }

    fetchAnnouncements();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 60_000);
    return () => clearInterval(interval);
  }, []);

  const filteredOpportunities = useMemo(() => {
    const filtered = opportunities.filter((opp) => {
      if (
        user &&
        (opp.company.userId === user.id ||
          (!!user.company?.id && opp.company.id === user.company.id))
      ) {
        return false;
      }

      const matchesCategory =
        selectedCategory === "ALL" || opp.category === selectedCategory;

      const matchesSearch =
        opp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        opp.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        opp.company.name.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        selectedStatus === "ALL" || opp.status === selectedStatus;

      const matchesAnnonceType =
        selectedAnnonceType === "ALL" ||
        opp.annonceType === selectedAnnonceType;

      return (
        matchesCategory && matchesSearch && matchesStatus && matchesAnnonceType
      );
    });

    return filtered.sort((a, b) => {
      const aIsLocal = a.company.companyType === "HAUTE_MATSIATRA";
      const bIsLocal = b.company.companyType === "HAUTE_MATSIATRA";

      if (aIsLocal && !bIsLocal) return -1;
      if (!aIsLocal && bIsLocal) return 1;

      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [
    opportunities,
    searchQuery,
    selectedCategory,
    selectedStatus,
    selectedAnnonceType,
    user?.company?.id,
  ]);

  const visibleOpportunities = useMemo(
    () => filteredOpportunities.slice(0, visibleCount),
    [filteredOpportunities, visibleCount],
  );

  const hasMore = visibleCount < filteredOpportunities.length;

  const loadMore = useCallback(() => {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);

    setTimeout(() => {
      setVisibleCount((prev) =>
        Math.min(prev + LOAD_MORE_BATCH, filteredOpportunities.length),
      );
      setLoadingMore(false);
    }, SKELETON_DELAY);
  }, [loadingMore, hasMore, filteredOpportunities.length]);

  useEffect(() => {
    setVisibleCount(INITIAL_VISIBLE_COUNT);
  }, [searchQuery, selectedCategory, selectedStatus, selectedAnnonceType]);

  useEffect(() => {
    const el = loadMoreRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          loadMore();
        }
      },
      { rootMargin: "200px" },
    );

    observer.observe(el);

    return () => observer.disconnect();
  }, [loadMore, hasMore, loadingMore]);

  return (
    <div className="min-h-screen  py-4">
      <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 pb-12">
        {/* ─── En-tête ─── */}
        <div data-actor-card className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#F2F2F2]">
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Opportunités B2B & Partenariats
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Explorez les offres et demandes de collaboration au sein du réseau
              CCI.
            </p>
          </div>

          <Link
            href={
              isPublic && !user
                ? `/login?next=${encodeURIComponent("/acteur/annonces/nouvelle")}`
                : "/acteur/annonces/nouvelle"
            }
            className="inline-flex items-center gap-2 px-5 py-3 bg-[#FFBF00] hover:bg-[#FFD16A] text-white rounded-2xl text-xs font-bold border border-[#F2F2F2] transition active:scale-95 shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Publier une annonce</span>
          </Link>
        </div>

        {/* ─── Barre de recherche + filtres ─── */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
          <div className="relative flex-1 lg:max-w-md">
            <Search
              className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-300"
              strokeWidth={2.2}
            />
            <input
              type="text"
              placeholder="Rechercher une opportunité, un mot-clé..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-full bg-white border border-[#F2F2F2] text-xs font-medium text-slate-800 placeholder-slate-300 focus:outline-none focus:border-[#6FCF97] transition-all"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <select
                value={selectedAnnonceType}
                onChange={(e) =>
                  setSelectedAnnonceType(
                    e.target.value as "OFFRE" | "DEMANDE" | "ALL",
                  )
                }
                className="pl-4 pr-9 py-3 rounded-full bg-white border border-[#F2F2F2] text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#6FCF97] appearance-none cursor-pointer transition-all"
              >
                <option value="ALL">Tous les types (Offres & Demandes)</option>
                <option value="DEMANDE">Demandes uniquement</option>
                <option value="OFFRE">Offres uniquement</option>
              </select>
              <ChevronDown
                className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-300"
                strokeWidth={2.5}
              />
            </div>

            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="pl-4 pr-9 py-3 rounded-full bg-white border border-[#F2F2F2] text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#6FCF97] appearance-none cursor-pointer transition-all"
              >
                <option value="ALL">Toutes les collaborations</option>
                {categoriesList.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <ChevronDown
                className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-300"
                strokeWidth={2.5}
              />
            </div>

            <div className="relative">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="pl-4 pr-9 py-3 rounded-full bg-white border border-[#F2F2F2] text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#6FCF97] appearance-none cursor-pointer transition-all"
              >
                <option value="ALL">Tous les statuts</option>
                <option value="OPEN">Ouvert</option>
                <option value="IN_PROGRESS">En cours</option>
                <option value="CLOSED">Clôturé</option>
              </select>
              <ChevronDown
                className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-300"
                strokeWidth={2.5}
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-[#F2F2F2] text-xs font-semibold text-rose-700">
            {error}
          </div>
        )}

        {/* Compteur */}
        <div className="flex items-center justify-between px-2">
          <p className="text-xs text-slate-400 font-medium">
            <span className="font-bold text-slate-700">
              {filteredOpportunities.length}
            </span>{" "}
            opportunité{filteredOpportunities.length > 1 ? "s" : ""} trouvée
            {filteredOpportunities.length > 1 ? "s" : ""}
            {filteredOpportunities.length > visibleCount && (
              <span className="text-slate-300 ml-1">
                (affichage {visibleCount}/{filteredOpportunities.length})
              </span>
            )}
          </p>
        </div>

        {/* Chargement initial OU Liste */}
        {loading || (isPublic && isAuthLoading) ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {[1, 2, 3, 4].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : visibleOpportunities.length > 0 ? (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {visibleOpportunities.map((item) => {
                const isLocal = item.company.companyType === "HAUTE_MATSIATRA";
                const websiteDisplay = formatWebsite(item.company.website);
                const actorPhoto = item.company.avatarUrl;
                const isExpanded = expandedDescriptions.has(item.id);
                const isLongDescription =
                  item.description.length > DESCRIPTION_MAX_LENGTH;

                return (
                  <article
                    key={item.id}
                    data-actor-card
                    className="bg-white rounded-[24px] p-5 border border-[#F2F2F2] hover:border-[#6FCF97] transition-colors duration-300 flex flex-col group"
                  >
                    {/* En-tête : Info Entreprise */}
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        {actorPhoto ? (
                          <img
                            alt={`Photo de ${item.company.name}`}
                            className="w-11 h-11 rounded-full object-cover ring-2 ring-white shrink-0"
                            src={actorPhoto}
                          />
                        ) : (
                          <div
                            aria-label={`Photo de ${item.company.name} non renseignée`}
                            className="w-11 h-11 rounded-full bg-emerald-100 text-emerald-800 ring-2 ring-white shrink-0 flex items-center justify-center text-sm font-bold"
                          >
                            {item.company.name.trim().charAt(0).toUpperCase()}
                          </div>
                        )}

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <Link
                              href={`/acteur/entreprises/${item.company.id}`}
                              className="text-sm font-bold text-slate-900 truncate hover:text-emerald-700 hover:underline transition"
                              title="Voir la fiche entreprise"
                            >
                              {item.company.name}
                            </Link>
                            <CheckCircle2
                              className={`w-4 h-4 shrink-0 ${
                                isLocal ? "text-emerald-500" : "text-blue-500"
                              }`}
                              strokeWidth={2.5}
                              aria-label={
                                isLocal ? "Acteur local" : "Acteur externe"
                              }
                            />
                          </div>

                          <div className="flex items-center gap-2 mt-0.5 text-[11px] min-w-0">
                            <span className="text-slate-400 truncate">
                              {item.company.activitySector}
                            </span>

                            {websiteDisplay && (
                              <>
                                <span
                                  className="w-px h-3 bg-[#F2F2F2] shrink-0"
                                  aria-hidden="true"
                                />
                                <a
                                  href={
                                    item.company.website?.startsWith("http")
                                      ? item.company.website
                                      : `https://${item.company.website}`
                                  }
                                  target="_blank"
                                  rel="noreferrer noopener"
                                  className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-700 hover:underline font-medium truncate shrink-0"
                                  title={item.company.website}
                                >
                                  <Globe
                                    className="w-3 h-3 shrink-0"
                                    strokeWidth={2.2}
                                  />
                                  <span className="truncate">
                                    {websiteDisplay}
                                  </span>
                                </a>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0 flex flex-col items-end gap-1">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${
                            item.status === "OPEN"
                              ? "bg-emerald-50 text-emerald-700 border-[#6FCF97]"
                              : "bg-amber-50 text-amber-700 border-[#F2F2F2]"
                          }`}
                        >
                          {item.status === "OPEN" ? "Ouvert" : "En cours"}
                        </span>
                        <span
                          className="flex items-center gap-1 text-[10px] text-slate-300 font-medium"
                          title={new Date(item.createdAt).toLocaleString(
                            "fr-FR",
                          )}
                        >
                          <Clock className="w-3 h-3" strokeWidth={2} />
                          {formatTimeAgo(item.createdAt)}
                        </span>
                      </div>
                    </div>

                    {/* Corps */}
                    <div className="flex-1 space-y-3 mb-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-50 border border-[#F2F2F2] text-slate-500">
                            {item.annonceType}
                          </span>

                          <span className="text-[10px] font-semibold text-slate-500 bg-slate-50 px-2 py-0.5 rounded-md border border-[#F2F2F2]">
                            {item.category}
                          </span>
                        </div>

                        <h2 className="text-base font-bold text-slate-900 tracking-tight leading-snug group-hover:text-emerald-700 transition-colors line-clamp-2">
                          {item.title}
                        </h2>
                      </div>

                      <div>
                        <p
                          className={`text-xs text-slate-400 leading-relaxed ${
                            isExpanded ? "" : "line-clamp-3"
                          }`}
                        >
                          {item.description}
                        </p>

                        {isLongDescription && (
                          <button
                            type="button"
                            onClick={() => toggleDescription(item.id)}
                            className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 hover:text-emerald-700 transition active:scale-95"
                            aria-expanded={isExpanded}
                          >
                            {isExpanded ? (
                              <>
                                Voir moins
                                <ChevronUp
                                  className="w-3.5 h-3.5"
                                  strokeWidth={2.5}
                                />
                              </>
                            ) : (
                              <>
                                Voir plus
                                <ChevronDown
                                  className="w-3.5 h-3.5"
                                  strokeWidth={2.5}
                                />
                              </>
                            )}
                          </button>
                        )}
                      </div>

                      {item.specificLocation && (
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
                          <MapPin
                            className="w-3.5 h-3.5 text-emerald-500 shrink-0"
                            strokeWidth={2.2}
                          />
                          <span className="truncate">
                            {item.specificLocation}
                          </span>
                        </div>
                      )}
                      {item.deadline && (
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
                          <CalendarDays
                            className="w-3.5 h-3.5 text-emerald-500 shrink-0"
                            strokeWidth={2.2}
                          />
                          <span>
                            Échéance : {formatDeadline(item.deadline)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Pied */}
                    <div className="pt-3 border-t border-[#F2F2F2] flex items-center justify-end gap-2 mt-auto">
                      {isPublic && !user ? (
                        <Link
                          href={`/login?next=${encodeURIComponent(
                            "/acteur/opportunites",
                          )}`}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold border border-[#F2F2F2] transition-all active:scale-95"
                        >
                          <span>Manifester mon intérêt</span>
                          <ArrowRight
                            className="w-3.5 h-3.5"
                            strokeWidth={2.5}
                          />
                        </Link>
                      ) : (
                        <button
                          type="button"
                          onClick={() => void handleExpressInterest(item)}
                          disabled={
                            !user ||
                            user.role !== "COMPANY" ||
                            sendingInterestId === item.id
                          }
                          className="inline-flex items-center gap-1.5 px-4 py-3 rounded-4xl bg-[#FFA02E] hover:bg-[#FFA02E] text-white text-xs font-bold border border-[#F2F2F2] transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <span>
                            {sendingInterestId === item.id
                              ? "Envoi..."
                              : "Manifester mon intérêt"}
                          </span>
                          {sendingInterestId !== item.id && (
                            <ArrowRight
                              className="w-3.5 h-3.5"
                              strokeWidth={2.5}
                            />
                          )}
                        </button>
                      )}
                      {interestFeedback?.id === item.id && (
                        <p
                          role={interestFeedback.success ? "status" : "alert"}
                          className={`basis-full text-right text-xs ${
                            interestFeedback.success
                              ? "text-emerald-700"
                              : "text-red-600"
                          }`}
                        >
                          {interestFeedback.message}
                        </p>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>

            {loadingMore && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-5">
                {Array.from({ length: LOAD_MORE_BATCH }).map((_, i) => (
                  <SkeletonCard key={`skeleton-${i}`} />
                ))}
              </div>
            )}

            {hasMore && !loadingMore && (
              <div
                ref={loadMoreRef}
                className="h-20 flex items-center justify-center"
                aria-hidden="true"
              />
            )}

            {!hasMore &&
              filteredOpportunities.length > INITIAL_VISIBLE_COUNT && (
                <div className="text-center py-6">
                  <p className="text-xs text-slate-300 font-medium">
                    Toutes les opportunités ont été affichées
                  </p>
                </div>
              )}
          </>
        ) : (
          <div data-actor-card className="bg-white rounded-3xl p-12 text-center border border-[#F2F2F2] space-y-3">
            <p className="text-slate-400 text-xs font-semibold">
              Aucune opportunité n'a encore été publiée ou ne correspond à vos
              critères.
            </p>
            <Link
              href="/acteur/annonces/nouvelle"
              className="inline-block text-xs font-bold text-emerald-600 hover:underline"
            >
              Publier la première annonce →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div data-actor-card className="bg-white rounded-[24px] p-5 border border-[#F2F2F2] animate-pulse">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <div className="w-11 h-11 rounded-full bg-slate-100 shrink-0" />
          <div className="flex-1 min-w-0 space-y-2">
            <div className="h-3 bg-slate-100 rounded w-2/3" />
            <div className="h-2.5 bg-slate-50 rounded w-1/2" />
          </div>
        </div>
        <div className="shrink-0 flex flex-col items-end gap-2">
          <div className="h-4 bg-slate-100 rounded-full w-16" />
          <div className="h-2.5 bg-slate-50 rounded w-12" />
        </div>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex gap-1.5">
          <div className="h-4 bg-slate-100 rounded w-16" />
          <div className="h-4 bg-slate-50 rounded w-20" />
        </div>
        <div className="h-4 bg-slate-100 rounded w-5/6" />
        <div className="space-y-1.5">
          <div className="h-2.5 bg-slate-50 rounded w-full" />
          <div className="h-2.5 bg-slate-50 rounded w-full" />
          <div className="h-2.5 bg-slate-50 rounded w-3/4" />
        </div>
        <div className="h-3 bg-slate-50 rounded w-1/3" />
      </div>

      <div className="pt-3 border-t border-[#F2F2F2] flex justify-end">
        <div className="h-8 bg-slate-100 rounded-xl w-40" />
      </div>
    </div>
  );
}
