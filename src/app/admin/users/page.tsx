"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import {
  Search,
  ChevronDown,
  Building2,
  Globe,
  User,
  MapPin,
  Mail,
  Phone,
  Eye,
  Ban,
  MoreVertical,
} from "lucide-react";

interface Member {
  id: string;
  email: string;
  isActive: boolean;
  createdAt: string;
  company: {
    id: string;
    companyType: "HAUTE_MATSIATRA" | "OTHER_REGION" | "INTERNATIONAL";
    companyName: string;
    managerName: string;
    phone: string;
    sector: string;
    address: string;
    needsDescription: string;
    verificationStatus: "APPROVED";
  };
}

export default function AdminUsersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSector, setSelectedSector] = useState("ALL");
  const [selectedLocation, setSelectedLocation] = useState("ALL");
  const [users, setUsers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const menuRef = useRef<HTMLDivElement>(null);

  // Fermer le menu si on clique en dehors
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenuId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const loadMembers = async () => {
      try {
        const configuredApiUrl = process.env.NEXT_PUBLIC_API_URL
          ?.trim()
          .replace(/\/+$/, "");
        if (!configuredApiUrl) {
          throw new Error(
            "La variable NEXT_PUBLIC_API_URL n'est pas configurée."
          );
        }

        const apiRoot = /\/api$/i.test(configuredApiUrl)
          ? configuredApiUrl
          : `${configuredApiUrl}/api`;
        const response = await fetch(`${apiRoot}/users`);
        if (!response.ok) {
          throw new Error("Impossible de charger les membres approuvés.");
        }

        const members: Member[] = await response.json();
        setUsers(members);
      } catch (error) {
        console.error("Erreur lors du chargement des membres", error);
        setLoadError(
          error instanceof Error
            ? error.message
            : "Une erreur est survenue lors du chargement des membres."
        );
      } finally {
        setIsLoading(false);
      }
    };

    void loadMembers();
  }, []);

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.company.companyName
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      user.company.managerName
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      user.company.needsDescription
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

    const matchesSector =
      selectedSector === "ALL" || user.company.sector === selectedSector;
    const locationType =
      user.company.companyType === "HAUTE_MATSIATRA" ? "INTERNAL" : "EXTERNAL";
    const matchesLocation =
      selectedLocation === "ALL" || locationType === selectedLocation;

    return matchesSearch && matchesSector && matchesLocation;
  });

  const getSectorLabel = (sector: string) => {
    const labels: Record<string, string> = {
      AGRO: "Agroalimentaire",
      NTIC: "NTIC & Web",
      BTP: "BTP & Construction",
      TOURISM: "Tourisme",
      COMMERCE: "Commerce",
      ARTISANAT: "Artisanat",
    };
    return labels[sector] || sector;
  };

  const sectors = [...new Set(users.map((user) => user.company.sector))].sort(
    (first, second) => first.localeCompare(second, "fr")
  );

  return (
    <div className="space-y-6">
      {/* ═══════════════════════════════════════════════════════════
          BARRE DE FILTRES (compacte)
          ═══════════════════════════════════════════════════════════ */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_4px_25px_-4px_rgba(15,23,42,0.06)] p-1.5 flex flex-col sm:flex-row items-stretch sm:items-center gap-1.5">
        {/* Secteur */}
        <div className="relative flex-1 flex flex-col px-4 py-2 sm:border-r sm:border-slate-100">
          <label className="text-[9px] uppercase tracking-wider font-bold text-slate-400 mb-0.5">
            Secteur
          </label>
          <div className="relative">
            <select
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value)}
              className="w-full bg-transparent text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer appearance-none pr-6"
            >
              <option value="ALL">Tous les secteurs</option>
              {sectors.map((sector) => (
                <option key={sector} value={sector}>
                  {getSectorLabel(sector)}
                </option>
              ))}
            </select>
            <ChevronDown
              className="w-3.5 h-3.5 absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400"
              strokeWidth={2.5}
            />
          </div>
        </div>

        {/* Localisation */}
        <div className="relative flex-1 flex flex-col px-4 py-2 sm:border-r sm:border-slate-100">
          <label className="text-[9px] uppercase tracking-wider font-bold text-slate-400 mb-0.5">
            Localisation
          </label>
          <div className="relative">
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full bg-transparent text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer appearance-none pr-6"
            >
              <option value="ALL">Toutes localisations</option>
              <option value="INTERNAL">Haute Matsiatra (interne)</option>
              <option value="EXTERNAL">Hors région (externe)</option>
            </select>
            <ChevronDown
              className="w-3.5 h-3.5 absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400"
              strokeWidth={2.5}
            />
          </div>
        </div>

        {/* Recherche */}
        <div className="flex-1 flex flex-col px-4 py-2">
          <label className="text-[9px] uppercase tracking-wider font-bold text-slate-400 mb-0.5">
            Recherche
          </label>
          <div className="relative">
            <Search
              className="w-3.5 h-3.5 absolute left-0 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400"
              strokeWidth={2.2}
            />
            <input
              type="text"
              placeholder="Nom, responsable..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-xs font-semibold text-slate-800 placeholder-slate-300 focus:outline-none pl-5"
            />
          </div>
        </div>

        {/* Bouton recherche */}
        <button
          aria-label="Rechercher"
          className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-emerald-600 hover:text-white text-slate-500 flex items-center justify-center transition shrink-0 self-end sm:self-center"
        >
          <Search className="w-4 h-4" strokeWidth={2.2} />
        </button>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          GRILLE DE CARTES
          ═══════════════════════════════════════════════════════════ */}
      {isLoading ? (
        <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center">
          <p className="text-slate-500 text-sm font-medium">
            Chargement des membres approuvés...
          </p>
        </div>
      ) : loadError ? (
        <div className="bg-white rounded-3xl border border-rose-100 p-12 text-center">
          <p className="text-rose-600 text-sm font-medium">{loadError}</p>
        </div>
      ) : filteredUsers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
          {filteredUsers.map((user) => {
            const isInternal = user.company.companyType === "HAUTE_MATSIATRA";
            const initials = user.company.companyName
              .split(/\s+/)
              .slice(0, 2)
              .map((word) => word[0])
              .join("")
              .toUpperCase();

            return (
              <div
                key={user.id}
                className="relative bg-white rounded-[28px] border border-slate-100 shadow-[0_4px_25px_-8px_rgba(15,23,42,0.06)] p-5 hover:shadow-lg hover:border-emerald-200 transition-all duration-300 flex flex-col"
              >
                {/* ─── Menu d'actions (haut à droite) ─── */}
                <div className="absolute top-4 right-4">
                  <button
                    onClick={() =>
                      setActiveMenuId(activeMenuId === user.id ? null : user.id)
                    }
                    className="w-8 h-8 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition"
                    aria-label="Actions"
                  >
                    <MoreVertical className="w-4 h-4" strokeWidth={2.2} />
                  </button>

                  {activeMenuId === user.id && (
                    <div
                      ref={menuRef}
                      className="absolute right-0 top-10 w-44 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 z-50 text-left"
                    >
                      <Link
                        href={`/admin/users/${user.id}`}
                        onClick={() => setActiveMenuId(null)}
                        className="w-full px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                      >
                        <Eye
                          className="w-3.5 h-3.5 text-slate-400"
                          strokeWidth={2}
                        />
                        Voir le profil
                      </Link>

                      <Link
                        href={`mailto:${user.email}`}
                        onClick={() => setActiveMenuId(null)}
                        className="w-full px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                      >
                        <Mail
                          className="w-3.5 h-3.5 text-slate-400"
                          strokeWidth={2}
                        />
                        Envoyer un email
                      </Link>

                      <button
                        onClick={() => {
                          setActiveMenuId(null);
                          // Action suspendre
                        }}
                        className="w-full px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 flex items-center gap-2 border-t border-slate-100 mt-1 pt-1.5"
                      >
                        <Ban
                          className="w-3.5 h-3.5 text-rose-500"
                          strokeWidth={2}
                        />
                        Suspendre
                      </button>
                    </div>
                  )}
                </div>

                {/* ─── En-tête : avatar + nom + badge ─── */}
                <div className="flex items-start gap-3 mb-4 pr-8">
                  <div
                    className={`w-12 h-12 rounded-full bg-gradient-to-br ${
                      isInternal
                        ? "from-emerald-500 to-emerald-700"
                        : "from-indigo-500 to-indigo-700"
                    } flex items-center justify-center text-white font-bold text-sm shadow-md shrink-0`}
                  >
                    {initials}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-slate-900 leading-tight mb-0.5 truncate">
                      {user.company.companyName}
                    </h3>
                    <p className="text-[11px] text-slate-500 font-medium truncate mb-2">
                      {getSectorLabel(user.company.sector)}
                    </p>

                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-bold ${
                        isInternal
                          ? "bg-sky-50 text-sky-700 border-sky-200"
                          : "bg-violet-50 text-violet-700 border-violet-200"
                      }`}
                    >
                      {isInternal ? (
                        <Building2 className="w-2.5 h-2.5" strokeWidth={2.2} />
                      ) : (
                        <Globe className="w-2.5 h-2.5" strokeWidth={2.2} />
                      )}
                      {isInternal ? "Interne" : "Externe"}
                    </span>
                  </div>
                </div>

                {/* ─── Description ─── */}
                <p className="text-xs text-slate-500 leading-relaxed mb-4 line-clamp-2">
                  {user.company.needsDescription}
                </p>

                {/* ─── Infos (responsable, adresse, contact, date) ─── */}
                <div className="space-y-2 mb-4 text-[11px]">
                  <div className="flex items-center gap-2">
                    <User
                      className="w-3.5 h-3.5 text-slate-400 shrink-0"
                      strokeWidth={2}
                    />
                    <span className="text-slate-600 font-medium truncate">
                      {user.company.managerName}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <MapPin
                      className="w-3.5 h-3.5 text-slate-400 shrink-0"
                      strokeWidth={2}
                    />
                    <span className="text-slate-500 truncate">
                      {user.company.address}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Phone
                      className="w-3.5 h-3.5 text-slate-400 shrink-0"
                      strokeWidth={2}
                    />
                    <span className="text-slate-500 font-mono truncate">
                      {user.company.phone}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Mail
                      className="w-3.5 h-3.5 text-slate-400 shrink-0"
                      strokeWidth={2}
                    />
                    <span className="text-slate-500 truncate">
                      {user.email}
                    </span>
                  </div>
                </div>

                {/* ─── Pied : date d'inscription ─── */}
                <div className="pt-3 border-t border-slate-100 mt-auto">
                  <p className="text-[10px] text-slate-400 font-medium">
                    Inscrit le{" "}
                    {new Intl.DateTimeFormat("fr-FR", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    }).format(new Date(user.createdAt))}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center">
          <p className="text-slate-400 text-sm font-medium">
            Aucun membre ne correspond à votre recherche.
          </p>
        </div>
      )}
    </div>
  );
}