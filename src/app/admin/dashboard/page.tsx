"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  BriefcaseBusiness,
  Building2,
  ChartNoAxesCombined,
  Clock3,
  LoaderCircle,
  RefreshCw,
  ShieldCheck,
  UserRoundCheck,
  UsersRound,
} from "lucide-react";
import { getApiRoot } from "../../lib/auth";

type VerificationStatus = "PENDING" | "APPROVED" | "REJECTED";
type AnnouncementStatus = "OPEN" | "IN_PROGRESS" | "CLOSED";

interface DashboardCompany {
  id: string;
  companyName?: string;
  sector?: string;
  verificationStatus?: VerificationStatus;
  createdAt?: string;
}

interface DashboardAnnouncement {
  id: string;
  status?: AnnouncementStatus;
}

interface MonthlyRegistration {
  key: string;
  label: string;
  count: number;
}

const numberFormatter = new Intl.NumberFormat("fr-FR");
const verificationLabels: Record<VerificationStatus, string> = {
  PENDING: "En attente",
  APPROVED: "Approuvée",
  REJECTED: "Refusée",
};

const sectorLabels: Record<string, string> = {
  AGRO: "Agroalimentaire",
  NTIC: "NTIC & Web",
  BTP: "BTP & Construction",
  TOURISM: "Tourisme",
  COMMERCE: "Commerce",
  ARTISANAT: "Artisanat",
};

function formatDate(value?: string): string {
  if (!value) return "Date inconnue";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date inconnue";
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function getSixMonthTrend(
  companies: DashboardCompany[],
): MonthlyRegistration[] {
  const now = new Date();
  const months = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - 5 + index, 1);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    return {
      key,
      label: new Intl.DateTimeFormat("fr-FR", { month: "short" })
        .format(date)
        .replace(".", ""),
      count: 0,
    };
  });
  const counts = new Map(months.map((month) => [month.key, 0]));

  companies.forEach((company) => {
    if (!company.createdAt) return;
    const date = new Date(company.createdAt);
    if (Number.isNaN(date.getTime())) return;
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    if (counts.has(key)) counts.set(key, (counts.get(key) ?? 0) + 1);
  });

  return months.map((month) => ({
    ...month,
    count: counts.get(month.key) ?? 0,
  }));
}

export default function AdminDashboardPage() {
  const [companies, setCompanies] = useState<DashboardCompany[]>([]);
  const [announcements, setAnnouncements] = useState<DashboardAnnouncement[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadDashboard() {
      setIsLoading(true);
      setLoadError(null);

      try {
        const apiRoot = getApiRoot();
        const [companiesResponse, announcementsResponse] = await Promise.all([
          fetch(`${apiRoot}/companies`, {
            credentials: "include",
            cache: "no-store",
            signal: controller.signal,
          }),
          fetch(`${apiRoot}/announcements`, {
            credentials: "include",
            cache: "no-store",
            signal: controller.signal,
          }),
        ]);

        if (!companiesResponse.ok) {
          throw new Error("Impossible de charger les entreprises.");
        }
        if (!announcementsResponse.ok) {
          throw new Error("Impossible de charger les annonces.");
        }

        const [companyData, announcementData] = await Promise.all([
          companiesResponse.json(),
          announcementsResponse.json(),
        ]);

        if (!Array.isArray(companyData) || !Array.isArray(announcementData)) {
          throw new Error("Les données reçues du serveur sont invalides.");
        }

        setCompanies(companyData as DashboardCompany[]);
        setAnnouncements(announcementData as DashboardAnnouncement[]);
        setUpdatedAt(new Date());
      } catch (cause) {
        if (controller.signal.aborted) return;
        setLoadError(
          cause instanceof Error
            ? cause.message
            : "Une erreur est survenue lors du chargement du tableau de bord.",
        );
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }

    void loadDashboard();
    return () => controller.abort();
  }, [refreshKey]);

  const approvedCount = companies.filter(
    (company) => company.verificationStatus === "APPROVED",
  ).length;
  const pendingCount = companies.filter(
    (company) => company.verificationStatus === "PENDING",
  ).length;
  const rejectedCount = companies.filter(
    (company) => company.verificationStatus === "REJECTED",
  ).length;

  const monthlyRegistrations = useMemo(
    () => getSixMonthTrend(companies),
    [companies],
  );
  const registrationTotal = monthlyRegistrations.reduce(
    (total, month) => total + month.count,
    0,
  );
  const previousMonthCount =
    monthlyRegistrations[monthlyRegistrations.length - 2]?.count ?? 0;
  const currentMonthCount =
    monthlyRegistrations[monthlyRegistrations.length - 1]?.count ?? 0;
  const monthlyChange =
    previousMonthCount === 0
      ? currentMonthCount > 0
        ? null
        : 0
      : ((currentMonthCount - previousMonthCount) / previousMonthCount) * 100;

  const chartPoints = monthlyRegistrations.map((month, index) => {
    const maxCount = Math.max(
      1,
      ...monthlyRegistrations.map((item) => item.count),
    );
    return {
      ...month,
      x: 54 + index * 122,
      y: 174 - (month.count / maxCount) * 126,
    };
  });
  const chartLine = chartPoints.map(({ x, y }) => `${x},${y}`).join(" ");
  const chartArea = chartPoints.length
    ? `54,190 ${chartLine} ${chartPoints[chartPoints.length - 1].x},190`
    : "";

  const sectorCounts = useMemo(() => {
    const counts = new Map<string, number>();
    companies.forEach((company) => {
      const sector = company.sector?.trim() || "OTHER";
      counts.set(sector, (counts.get(sector) ?? 0) + 1);
    });
    return [...counts.entries()]
      .map(([sector, count]) => ({
        sector,
        label:
          sectorLabels[sector] ??
          (sector === "OTHER" ? "Non renseigné" : sector),
        count,
      }))
      .sort((first, second) => second.count - first.count)
      .slice(0, 5);
  }, [companies]);

  const maximumSectorCount = Math.max(
    1,
    ...sectorCounts.map((sector) => sector.count),
  );
  const recentCompanies = [...companies]
    .sort((first, second) => {
      const firstDate = first.createdAt
        ? new Date(first.createdAt).getTime()
        : 0;
      const secondDate = second.createdAt
        ? new Date(second.createdAt).getTime()
        : 0;
      return secondDate - firstDate;
    })
    .slice(0, 5);

  const statusCounts: {
    status: AnnouncementStatus;
    label: string;
    count: number;
    color: string;
  }[] = [
    {
      status: "OPEN",
      label: "Ouvertes",
      count: announcements.filter(
        (announcement) => announcement.status === "OPEN",
      ).length,
      color: "bg-emerald-500",
    },
    {
      status: "IN_PROGRESS",
      label: "En cours",
      count: announcements.filter(
        (announcement) => announcement.status === "IN_PROGRESS",
      ).length,
      color: "bg-amber-400",
    },
    {
      status: "CLOSED",
      label: "Clôturées",
      count: announcements.filter(
        (announcement) => announcement.status === "CLOSED",
      ).length,
      color: "bg-slate-400",
    },
  ];

  return (
    <div className="space-y-6 pb-8">
      <section className="flex flex-col gap-4 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100 sm:flex-row sm:items-center sm:justify-between sm:p-7">
        <div>
          <p className="text-sm font-semibold text-emerald-700">
            Espace administration
          </p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            Tableau de bord analytique
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Vue d’ensemble des entreprises, annonces et inscriptions.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {updatedAt && (
            <span className="text-xs text-slate-500">
              Mis à jour à{" "}
              {new Intl.DateTimeFormat("fr-FR", {
                hour: "2-digit",
                minute: "2-digit",
              }).format(updatedAt)}
            </span>
          )}
          <button
            type="button"
            onClick={() => setRefreshKey((current) => current + 1)}
            disabled={isLoading}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-emerald-300 hover:text-emerald-700 disabled:cursor-wait disabled:opacity-60"
          >
            <RefreshCw
              className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
            />
            Actualiser
          </button>
        </div>
      </section>

      {loadError && (
        <div
          className="flex flex-col gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 sm:flex-row sm:items-center sm:justify-between"
          role="alert"
        >
          <p>{loadError}</p>
          <button
            type="button"
            onClick={() => setRefreshKey((current) => current + 1)}
            className="font-bold underline underline-offset-2"
          >
            Réessayer
          </button>
        </div>
      )}

      {isLoading && companies.length === 0 ? (
        <div className="flex min-h-64 items-center justify-center rounded-3xl bg-white text-emerald-700 shadow-sm ring-1 ring-slate-100">
          <LoaderCircle
            className="h-7 w-7 animate-spin"
            aria-label="Chargement"
          />
        </div>
      ) : !loadError ? (
        <>
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              label="Entreprises inscrites"
              value={companies.length}
              detail={`${approvedCount} approuvée${approvedCount === 1 ? "" : "s"}`}
              icon={<Building2 className="h-5 w-5" />}
              tone="emerald"
            />
            <MetricCard
              label="En attente de validation"
              value={pendingCount}
              detail="Demandes à examiner"
              icon={<Clock3 className="h-5 w-5" />}
              tone="amber"
            />
            <MetricCard
              label="Membres approuvés"
              value={approvedCount}
              detail={`${rejectedCount} refusée${rejectedCount === 1 ? "" : "s"}`}
              icon={<UserRoundCheck className="h-5 w-5" />}
              tone="blue"
            />
            <MetricCard
              label="Annonces visibles"
              value={announcements.length}
              detail={`${statusCounts[0].count} actuellement ouvertes`}
              icon={<BriefcaseBusiness className="h-5 w-5" />}
              tone="violet"
            />
          </section>

          <section className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.6fr)_minmax(320px,0.9fr)]">
            <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100 sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 text-slate-900">
                    <ChartNoAxesCombined className="h-5 w-5 text-emerald-600" />
                    <h2 className="font-bold">Évolution des inscriptions</h2>
                  </div>
                  <p className="mt-1 text-sm text-slate-500">
                    Nouvelles entreprises inscrites sur les six derniers mois
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-extrabold text-slate-900">
                    {numberFormatter.format(registrationTotal)}
                  </p>
                  <p className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500">
                    {monthlyChange !== null &&
                      (monthlyChange >= 0 ? (
                        <ArrowUpRight className="h-3.5 w-3.5 text-emerald-600" />
                      ) : (
                        <ArrowDownRight className="h-3.5 w-3.5 text-rose-600" />
                      ))}
                    {monthlyChange === null
                      ? "Nouvelle activité ce mois"
                      : `${monthlyChange > 0 ? "+" : ""}${Math.round(monthlyChange)} % vs mois précédent`}
                  </p>
                </div>
              </div>

              <div className="mt-5 overflow-hidden">
                <svg
                  viewBox="0 0 700 238"
                  className="h-56 w-full overflow-visible"
                  role="img"
                  aria-label="Courbe des inscriptions mensuelles sur les six derniers mois"
                >
                  <defs>
                    <linearGradient
                      id="registration-area"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  {[48, 82, 116, 150, 190].map((y) => (
                    <line
                      key={y}
                      x1="42"
                      x2="680"
                      y1={y}
                      y2={y}
                      stroke="#e2e8f0"
                      strokeDasharray="4 6"
                    />
                  ))}
                  {chartPoints.length > 0 && (
                    <>
                      <polygon
                        points={chartArea}
                        fill="url(#registration-area)"
                      />
                      <polyline
                        points={chartLine}
                        fill="none"
                        stroke="#059669"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      {chartPoints.map((point) => (
                        <g key={point.key}>
                          <circle
                            cx={point.x}
                            cy={point.y}
                            r="5"
                            fill="#fff"
                            stroke="#059669"
                            strokeWidth="3"
                          />
                          <text
                            x={point.x}
                            y="218"
                            textAnchor="middle"
                            className="fill-slate-500 text-[12px]"
                          >
                            {point.label}
                          </text>
                          <text
                            x={point.x}
                            y={Math.max(34, point.y - 13)}
                            textAnchor="middle"
                            className="fill-slate-700 text-[11px] font-semibold"
                          >
                            {point.count}
                          </text>
                        </g>
                      ))}
                    </>
                  )}
                </svg>
              </div>
            </div>

            <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100 sm:p-6">
              <div className="flex items-center gap-2 text-slate-900">
                <BriefcaseBusiness className="h-5 w-5 text-emerald-600" />
                <h2 className="font-bold">État des annonces</h2>
              </div>
              <p className="mt-1 text-sm text-slate-500">
                Répartition des annonces visibles par statut
              </p>
              <div className="mt-6 space-y-5">
                {statusCounts.map((item) => {
                  const percentage = announcements.length
                    ? (item.count / announcements.length) * 100
                    : 0;
                  return (
                    <div key={item.status}>
                      <div className="mb-2 flex items-center justify-between text-sm">
                        <span className="font-medium text-slate-600">
                          {item.label}
                        </span>
                        <span className="font-bold text-slate-900">
                          {numberFormatter.format(item.count)}
                        </span>
                      </div>
                      <div
                        className="h-2 overflow-hidden rounded-full bg-slate-100"
                        role="progressbar"
                        aria-label={item.label}
                        aria-valuenow={item.count}
                        aria-valuemin={0}
                        aria-valuemax={announcements.length}
                      >
                        <div
                          className={`h-full rounded-full ${item.color}`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
              <Link
                href="/acteur/opportunites"
                className="mt-7 inline-flex items-center gap-1.5 text-sm font-bold text-emerald-700 hover:text-emerald-800"
              >
                Parcourir les annonces
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </section>

          <section className="grid grid-cols-1 gap-5 xl:grid-cols-2">
            <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100 sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 text-slate-900">
                    <UsersRound className="h-5 w-5 text-emerald-600" />
                    <h2 className="font-bold">Inscriptions récentes</h2>
                  </div>
                  <p className="mt-1 text-sm text-slate-500">
                    Dernières entreprises enregistrées
                  </p>
                </div>
                <Link
                  href="/admin/companies/pending"
                  className="text-xs font-bold text-emerald-700 hover:text-emerald-800"
                >
                  Voir les demandes
                </Link>
              </div>
              <div className="mt-5 divide-y divide-slate-100">
                {recentCompanies.length ? (
                  recentCompanies.map((company) => {
                    const status = company.verificationStatus ?? "PENDING";
                    return (
                      <div
                        key={company.id}
                        className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                            <Building2 className="h-5 w-5" />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-bold text-slate-800">
                              {company.companyName || "Entreprise sans nom"}
                            </p>
                            <p className="mt-0.5 text-xs text-slate-500">
                              {formatDate(company.createdAt)}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold ${
                            status === "APPROVED"
                              ? "bg-emerald-50 text-emerald-700"
                              : status === "REJECTED"
                                ? "bg-rose-50 text-rose-700"
                                : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          {verificationLabels[status]}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <p className="py-8 text-center text-sm text-slate-500">
                    Aucune entreprise enregistrée.
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100 sm:p-6">
              <div className="flex items-center gap-2 text-slate-900">
                <ShieldCheck className="h-5 w-5 text-emerald-600" />
                <h2 className="font-bold">Secteurs représentés</h2>
              </div>
              <p className="mt-1 text-sm text-slate-500">
                Secteurs d’activité les plus présents chez les membres
              </p>
              <div className="mt-5 space-y-4">
                {sectorCounts.length ? (
                  sectorCounts.map((item) => (
                    <div key={item.sector}>
                      <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
                        <span className="truncate font-medium text-slate-600">
                          {item.label}
                        </span>
                        <span className="shrink-0 font-bold text-slate-900">
                          {numberFormatter.format(item.count)}
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-emerald-500"
                          style={{
                            width: `${(item.count / maximumSectorCount) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="py-8 text-center text-sm text-slate-500">
                    Les secteurs apparaîtront dès l’inscription des entreprises.
                  </p>
                )}
              </div>
              <Link
                href="/admin/users"
                className="mt-6 inline-flex items-center gap-1.5 text-sm font-bold text-emerald-700 hover:text-emerald-800"
              >
                Consulter les membres
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </section>
        </>
      ) : null}
    </div>
  );
}

function MetricCard({
  label,
  value,
  detail,
  icon,
  tone,
}: {
  label: string;
  value: number;
  detail: string;
  icon: ReactNode;
  tone: "emerald" | "amber" | "blue" | "violet";
}) {
  const toneClasses = {
    emerald: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
    blue: "bg-sky-50 text-sky-700",
    violet: "bg-violet-50 text-violet-700",
  };

  return (
    <article className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">
            {numberFormatter.format(value)}
          </p>
          <p className="mt-1 text-xs text-slate-500">{detail}</p>
        </div>
        <div className={`rounded-2xl p-3 ${toneClasses[tone]}`}>{icon}</div>
      </div>
    </article>
  );
}
