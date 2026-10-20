"use client";

import { useEffect, useState } from "react";
import {
  Search,
  ChevronDown,
  Building2,
  Globe,
  Ban,
  CheckCircle2,
} from "lucide-react";
import CompanyAvatar from "../../components/CompanyAvatar";
import { getApiRoot } from "../../lib/auth";

interface Member {
  id: string;
  email: string;
  isActive: boolean;
  createdAt: string;
  company: {
    id: string;
    companyType: "HAUTE_MATSIATRA" | "OTHER_REGION" | "INTERNATIONAL";
    companyName: string;
    logoUrl?: string | null;
    managerName: string;
    phone: string;
    sector: string;
    address: string;
    needsDescription: string;
    verificationStatus: "APPROVED";
  };
  avatarUrl?: string | null;
}

type CompanyType = Member["company"]["companyType"];

const companyTypeLabels: Record<CompanyType, string> = {
  HAUTE_MATSIATRA: "Haute Matsiatra",
  OTHER_REGION: "Autre région",
  INTERNATIONAL: "International",
};

export default function AdminUsersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSector, setSelectedSector] = useState("ALL");
  const [selectedLocation, setSelectedLocation] = useState("ALL");
  const [users, setUsers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [processingUserId, setProcessingUserId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const loadMembers = async () => {
      try {
        const response = await fetch(`${getApiRoot()}/users`, {
          credentials: "include",
          cache: "no-store",
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error("Impossible de charger les membres approuvés.");
        }
        const members: Member[] = await response.json();
        setUsers(members);
      } catch (error) {
        if (controller.signal.aborted) return;
        console.error("Erreur lors du chargement des membres", error);
        setLoadError(
          error instanceof Error
            ? error.message
            : "Une erreur est survenue lors du chargement des membres.",
        );
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    };

    void loadMembers();
    return () => controller.abort();
  }, []);

  const handleToggleStatus = async (user: Member) => {
    if (processingUserId) return;

    setActionError(null);
    setProcessingUserId(user.id);

    try {
      const action = user.isActive ? "suspend" : "activate";
      const response = await fetch(
        `${getApiRoot()}/users/${user.id}/${action}`,
        { method: "PATCH", credentials: "include" },
      );

      if (!response.ok) {
        throw new Error(
          `Impossible de ${user.isActive ? "suspendre" : "réactiver"} ce membre.`,
        );
      }

      setUsers((currentUsers) =>
        currentUsers.map((currentUser) =>
          currentUser.id === user.id
            ? { ...currentUser, isActive: !user.isActive }
            : currentUser,
        ),
      );
    } catch (error) {
      console.error("Erreur lors du changement de statut", error);
      setActionError(
        error instanceof Error
          ? error.message
          : "Une erreur est survenue lors du changement de statut du membre.",
      );
    } finally {
      setProcessingUserId(null);
    }
  };

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
    const matchesLocation =
      selectedLocation === "ALL" ||
      user.company.companyType === selectedLocation;

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
    (first, second) => first.localeCompare(second, "fr"),
  );
  const companyTypes = [
    ...new Set(users.map((user) => user.company.companyType)),
  ].sort((first, second) =>
    companyTypeLabels[first].localeCompare(companyTypeLabels[second], "fr"),
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 ">
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            strokeWidth={2.2}
          />
          <input
            type="search"
            placeholder="Rechercher par nom, responsable..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-11 pr-4 text-sm font-medium text-slate-800 shadow-sm outline-none transition placeholder:font-normal placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          />
        </div>

        <div className="relative shrink-0">
          <select
            value={selectedSector}
            onChange={(e) => setSelectedSector(e.target.value)}
            className="w-full sm:w-auto cursor-pointer appearance-none rounded-xl border border-slate-200 bg-white py-2.5 pl-4 pr-9 text-xs font-semibold text-slate-700 shadow-sm outline-none transition hover:border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          >
            <option value="ALL">Tous les secteurs</option>
            {sectors.map((sector) => (
              <option key={sector} value={sector}>
                {getSectorLabel(sector)}
              </option>
            ))}
          </select>
          <ChevronDown
            className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400"
            strokeWidth={2.5}
          />
        </div>

        <div className="relative shrink-0">
          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="w-full sm:w-auto cursor-pointer appearance-none rounded-xl border border-slate-200 bg-white py-2.5 pl-4 pr-9 text-xs font-semibold text-slate-700 shadow-sm outline-none transition hover:border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          >
            <option value="ALL">Toutes localisations</option>
            {companyTypes.map((companyType) => (
              <option key={companyType} value={companyType}>
                {companyTypeLabels[companyType]}
              </option>
            ))}
          </select>
          <ChevronDown
            className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400"
            strokeWidth={2.5}
          />
        </div>
      </div>

      {actionError && (
        <div
          role="alert"
          className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800"
        >
          {actionError}
        </div>
      )}
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
            return (
              <div
                key={user.id}
                className="relative bg-white rounded-[28px] border border-slate-100 shadow-[0_4px_25px_-8px_rgba(15,23,42,0.06)] p-5 hover:shadow-lg hover:border-emerald-200 transition-all duration-300 flex flex-col"
              >
                {/* ── PROFIL : Avatar + Nom + Secteur + Badge ── */}
                <div className="flex flex-1 items-start gap-3 pb-4">
                  <CompanyAvatar
                    src={user.company.logoUrl || user.avatarUrl}
                    name={user.company.companyName}
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full shadow-md ${
                      isInternal ? "bg-emerald-100" : "bg-indigo-100"
                    }`}
                    initialsClassName={`text-sm font-bold ${
                      isInternal ? "text-emerald-700" : "text-indigo-700"
                    }`}
                  />

                  <div className="min-w-0 flex-1">
                    {/* Nom de l'entreprise */}
                    <h3 className="truncate text-sm font-bold leading-tight text-slate-900">
                      {user.company.companyName}
                    </h3>

                    {/* Secteur */}
                    <p className="mt-1 truncate text-[11px] font-medium text-slate-500">
                      {getSectorLabel(user.company.sector)}
                    </p>

                    {/* Badge Interne / Externe */}
                    <span
                      className={`mt-2 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold ${
                        isInternal
                          ? "border-sky-200 bg-sky-50 text-sky-700"
                          : "border-violet-200 bg-violet-50 text-violet-700"
                      }`}
                    >
                      {isInternal ? (
                        <Building2 className="h-2.5 w-2.5" strokeWidth={2.2} />
                      ) : (
                        <Globe className="h-2.5 w-2.5" strokeWidth={2.2} />
                      )}
                      {isInternal ? "Interne" : "Externe"}
                    </span>
                  </div>
                </div>

                {/* ── ACTION ── */}
                <div className="mt-2 flex items-center justify-end border-t border-slate-100 pt-3">
                  <button
                    type="button"
                    onClick={() => void handleToggleStatus(user)}
                    disabled={processingUserId !== null}
                    className={`inline-flex shrink-0 items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                      user.isActive
                        ? "border-rose-200 text-rose-600 hover:bg-rose-50"
                        : "border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                    }`}
                  >
                    {user.isActive ? (
                      <Ban className="h-3.5 w-3.5" strokeWidth={2} />
                    ) : (
                      <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={2} />
                    )}
                    {processingUserId === user.id
                      ? "Chargement..."
                      : user.isActive
                        ? "Suspendre"
                        : "Réactiver"}
                  </button>
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
