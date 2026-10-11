"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  HiOutlineBuildingOffice2,
  HiOutlineMapPin,
  HiOutlineGlobeAlt,
  HiOutlineCalendarDays,
  HiOutlineCheckBadge,
  HiOutlineXCircle,
  HiOutlineMegaphone,
  HiOutlineEllipsisHorizontal,
  HiOutlineChatBubbleLeftRight,
  HiOutlineArrowRight,
  HiOutlineClock,
} from "react-icons/hi2";
import { getApiRoot } from "../../../lib/auth";

// ─────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────
interface Company {
  id: string;
  companyName: string;
  sector?: string;
  sectorOther?: string;
  companyType?: "HAUTE_MATSIATRA" | "OTHER_REGION" | "INTERNATIONAL";
  address?: string;
  city?: string;
  region?: string;
  logoUrl?: string;
  coverUrl?: string;
  nif?: string;
  stat?: string;
  website?: string;
  verificationStatus?: "PENDING" | "APPROVED" | "REJECTED";
  createdAt?: string;
}

interface Announcement {
  id: string | number;
  title: string;
  category: string;
  type: "OFFRE" | "DEMANDE";
  status: "OPEN" | "IN_PROGRESS" | "CLOSED";
  createdAt: string;
  specificLocation?: string;
  description?: string;
  companyId?: string;
  company?: { id?: string };
}

// ─────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────
function formatDate(iso?: string): string {
  if (!iso) return "Non renseignée";
  try {
    return new Date(iso).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  } catch {
    return "Non renseignée";
  }
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

  if (seconds < 60) return "À l'instant";
  if (minutes < 60) return `Il y a ${minutes} min`;
  if (hours < 24) return `Il y a ${hours} h`;
  if (days === 1) return "Hier";
  if (days < 7) return `Il y a ${days} j`;
  if (days < 30) return `Il y a ${Math.floor(days / 7)} sem.`;
  if (days < 365) return `Il y a ${Math.floor(days / 30)} mois`;
  return `Il y a ${Math.floor(days / 365)} an(s)`;
}

function getSectorLabel(company: Company): string {
  if (company.sector === "AUTRE") {
    return company.sectorOther || "Autre secteur";
  }
  return company.sector || "Non spécifié";
}

function getTypeLabel(type?: string): string {
  switch (type) {
    case "HAUTE_MATSIATRA":
      return "Acteur local";
    case "OTHER_REGION":
      return "Acteur national";
    case "INTERNATIONAL":
      return "Acteur international";
    default:
      return "Type non renseigné";
  }
}

function formatWebsite(url?: string): string {
  if (!url) return "";
  return url
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/$/, "");
}

// ─────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────
export default function CompanyDetailPage() {
  const params = useParams();
  const companyId = params?.id as string;

  const [company, setCompany] = useState<Company | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 🔄 Chargement
  useEffect(() => {
    if (!companyId) return;

    async function fetchCompany() {
      try {
        setLoading(true);
        setError(null);

        const companyRes = await fetch(
          `${getApiRoot()}/companies/${companyId}`,
          { credentials: "include" },
        );

        if (!companyRes.ok) {
          throw new Error(
            "Impossible de charger les informations de l'entreprise.",
          );
        }

        const companyData = await companyRes.json();
        setCompany(companyData);

        const annRes = await fetch(`${getApiRoot()}/announcements`, {
          credentials: "include",
        });

        if (annRes.ok) {
          const allAnnouncements = await annRes.json();
          const allAnn = Array.isArray(allAnnouncements)
            ? allAnnouncements
            : [];

          const filteredAnn = allAnn.filter((a: any) => {
            const annCompanyId =
              a.companyId || a.company?.id || a.actorId || a.ownerId;
            return String(annCompanyId) === String(companyId);
          });

          setAnnouncements(filteredAnn);
        }
      } catch (err: any) {
        setError(err.message || "Erreur de connexion au serveur.");
      } finally {
        setLoading(false);
      }
    }

    fetchCompany();
  }, [companyId]);

  const isLocal = company?.companyType === "HAUTE_MATSIATRA";

  // ─────────────────────────────────────────────────────────
  // Loading / Error
  // ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-[3px] border-emerald-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-medium text-slate-500">
          Chargement du profil...
        </p>
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center shadow-sm space-y-4">
          <HiOutlineXCircle className="w-12 h-12 text-rose-400 mx-auto" />
          <p className="text-sm font-bold text-slate-800">
            {error || "Entreprise introuvable"}
          </p>
        </div>
      </div>
    );
  }

  const fullAddress = [company.address, company.city, company.region]
    .filter(Boolean)
    .join(", ");

  const websiteDisplay = formatWebsite(company.website);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 space-y-6">
      {/* ═══════════════════════════════════════════════════════
          CARTE PROFIL (pleine largeur)
          ═══════════════════════════════════════════════════════ */}
      <article className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        {/* Couverture */}
        <div
          className={`h-28 sm:h-36 bg-gradient-to-br ${
            isLocal
              ? "from-emerald-400 via-emerald-500 to-emerald-600"
              : "from-blue-400 via-blue-500 to-blue-600"
          }`}
          style={
            company.coverUrl
              ? {
                  backgroundImage: `url(${company.coverUrl})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }
              : undefined
          }
        />

        {/* Avatar + Actions */}
        <div className="px-6 sm:px-10">
          <div className="flex items-end justify-between -mt-16 sm:-mt-20 mb-4">
            <div className="relative">
              <img
                alt={company.companyName}
                className="w-32 h-32 sm:w-40 sm:h-40 rounded-full object-cover ring-4 ring-white shadow-xl bg-white"
                src={
                  company.logoUrl ||
                  "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&q=80"
                }
              />
              {company.verificationStatus === "APPROVED" && (
                <span
                  className="absolute bottom-2 right-2 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-emerald-500 ring-[4px] ring-white flex items-center justify-center shadow-lg"
                  title="Certifiée CCI"
                >
                  <HiOutlineCheckBadge className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 mb-3">
              <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold shadow-md shadow-emerald-600/20 transition active:scale-95">
                <HiOutlineChatBubbleLeftRight className="w-4 h-4" />
                <span className="hidden sm:inline">Contacter</span>
              </button>
              <button
                className="w-11 h-11 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition active:scale-95"
                aria-label="Plus d'options"
              >
                <HiOutlineEllipsisHorizontal className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Identité */}
          <div className="space-y-4 pb-6">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              {company.companyName}
            </h1>

            <p className="text-base sm:text-lg text-slate-600">
              {getSectorLabel(company)}
            </p>

            <div className="flex items-center gap-3 flex-wrap text-sm sm:text-base text-slate-500 pt-1">
              <span
                className={`inline-flex items-center gap-2 font-bold ${
                  isLocal ? "text-emerald-600" : "text-blue-600"
                }`}
              >
                <HiOutlineMapPin className="w-5 h-5" />
                {getTypeLabel(company.companyType)}
              </span>

              {company.city && (
                <>
                  <span
                    className="w-px h-5 bg-slate-200 shrink-0"
                    aria-hidden="true"
                  />
                  <span className="inline-flex items-center gap-2">
                    <HiOutlineBuildingOffice2 className="w-5 h-5" />
                    {company.city}
                  </span>
                </>
              )}

              {fullAddress && (
                <>
                  <span
                    className="w-px h-5 bg-slate-200 shrink-0"
                    aria-hidden="true"
                  />
                  <span className="inline-flex items-center gap-2 min-w-0">
                    <HiOutlineMapPin className="w-5 h-5 shrink-0" />
                    <span className="truncate">{fullAddress}</span>
                  </span>
                </>
              )}

              {websiteDisplay && (
                <>
                  <span
                    className="w-px h-5 bg-slate-200 shrink-0"
                    aria-hidden="true"
                  />
                  <a
                    href={
                      company.website?.startsWith("http")
                        ? company.website
                        : `https://${company.website}`
                    }
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 hover:underline font-medium shrink-0"
                    title={company.website}
                  >
                    <HiOutlineGlobeAlt className="w-5 h-5 shrink-0" />
                    <span className="truncate">{websiteDisplay}</span>
                  </a>
                </>
              )}
            </div>

            {(company.nif || company.stat) && (
              <div className="flex items-center gap-4 flex-wrap text-sm sm:text-base text-slate-500">
                {company.nif && (
                  <span className="inline-flex items-center gap-2">
                    <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">
                      NIF
                    </span>
                    <span className="font-semibold text-slate-700">
                      {company.nif}
                    </span>
                  </span>
                )}

                {company.nif && company.stat && (
                  <span
                    className="w-px h-5 bg-slate-200 shrink-0"
                    aria-hidden="true"
                  />
                )}

                {company.stat && (
                  <span className="inline-flex items-center gap-2">
                    <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">
                      STAT
                    </span>
                    <span className="font-semibold text-slate-700">
                      {company.stat}
                    </span>
                  </span>
                )}
              </div>
            )}

            <div className="flex items-center gap-2 text-sm sm:text-base text-slate-500 pt-1">
              <HiOutlineCalendarDays className="w-5 h-5 text-emerald-600" />
              <span>
                Inscrit depuis le{" "}
                <strong className="text-slate-700 font-bold">
                  {formatDate(company.createdAt)}
                </strong>
              </span>
            </div>
          </div>
        </div>
      </article>

      {/* ═══════════════════════════════════════════════════════
          SECTION ANNONCES
          ═══════════════════════════════════════════════════════ */}
      <section className="space-y-4">
        <div className="flex items-center gap-2.5 px-1">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
            <HiOutlineMegaphone className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-extrabold text-slate-900">
            Annonces de cette entreprise
          </h2>
          {announcements.length > 0 && (
            <span className="ml-auto text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
              {announcements.length}{" "}
              {announcements.length > 1 ? "annonces" : "annonce"}
            </span>
          )}
        </div>

        {announcements.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center shadow-sm">
            <HiOutlineMegaphone className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-700 mb-1">
              Aucune annonce publiée
            </p>
            <p className="text-xs text-slate-500">
              Cette entreprise n'a pas encore publié d'annonce.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {announcements.map((item) => {
              return (
                <article
                  key={item.id}
                  className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-lg hover:border-emerald-200 transition-all duration-300 flex flex-col group"
                >
                  {/* En-tête */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <img
                        alt={company.companyName}
                        className="w-10 h-10 rounded-full object-cover ring-2 ring-white shadow-xs shrink-0"
                        src={
                          company.logoUrl ||
                          "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&q=80"
                        }
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <h3 className="text-sm font-bold text-slate-900 truncate">
                            {company.companyName}
                          </h3>
                          <HiOutlineCheckBadge
                            className={`w-3.5 h-3.5 shrink-0 ${
                              isLocal ? "text-emerald-500" : "text-blue-500"
                            }`}
                          />
                        </div>
                        <p className="text-[11px] text-slate-500 truncate">
                          {getSectorLabel(company)}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0 flex flex-col items-end gap-1">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                          item.status === "OPEN"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}
                      >
                        {item.status === "OPEN" ? "Ouvert" : "En cours"}
                      </span>
                      <span className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                        <HiOutlineClock className="w-3 h-3" />
                        {formatTimeAgo(item.createdAt)}
                      </span>
                    </div>
                  </div>

                  {/* Corps */}
                  <div className="flex-1 space-y-3 mb-4">
                    <div className="flex-1 min-w-0">
                      {/* ✅ Badges DEMANDE/OFFRE + catégorie TOUS EN GRIS */}
                      <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200/60">
                          {item.type}
                        </span>

                        <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/60">
                          {item.category}
                        </span>
                      </div>

                      <h2 className="text-base font-bold text-slate-900 tracking-tight leading-snug group-hover:text-emerald-700 transition-colors line-clamp-2">
                        {item.title}
                      </h2>
                    </div>

                    {item.description && (
                      <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">
                        {item.description}
                      </p>
                    )}

                    {item.specificLocation && (
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
                        <HiOutlineMapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="truncate">
                          {item.specificLocation}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Pied */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2 mt-auto">
                    <Link
                      href={`/acteur/annonces/${item.id}`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all active:scale-95"
                    >
                      <span>Manifester mon intérêt</span>
                      <HiOutlineArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
