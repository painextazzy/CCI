"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Eye,
  FileClock,
  Globe2,
  Handshake,
  LoaderCircle,
  Megaphone,
  Users,
} from "lucide-react";
import { getApiRoot } from "../../lib/auth";

interface AdminDashboardStatistics {
  accounts: {
    local: number;
    external: number;
    total: number;
  };
  siteVisits: number;
  pendingRequests: number;
  contractsInProgress: number;
  announcements: {
    active: number;
    closed: number;
    total: number;
  };
  economicEvolution: {
    month: string;
    amount: string;
  }[];
}

const numberFormatter = new Intl.NumberFormat("fr-FR", {
  maximumFractionDigits: 0,
});

const currencyFormatter = new Intl.NumberFormat("fr-FR", {
  maximumFractionDigits: 0,
});

const MONTH_FORMATTER = new Intl.DateTimeFormat("fr-FR", {
  month: "short",
  timeZone: "UTC",
});

const ANNOUNCEMENT_STATES = [
  { key: "active", label: "Actives", color: "#059669" },
  { key: "closed", label: "Clôturées", color: "#cbd5e1" },
] as const;

export default function AdminDashboardPage() {
  const [statistics, setStatistics] =
    useState<AdminDashboardStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    let isMounted = true;
    let requestController: AbortController | null = null;

    async function load() {
      requestController?.abort();
      const controller = new AbortController();
      requestController = controller;
      try {
        const response = await fetch(
          `${getApiRoot()}/admin/dashboard/statistics`,
          {
            credentials: "include",
            cache: "no-store",
            signal: controller.signal,
          },
        );
        if (!response.ok) {
          throw new Error("Impossible de charger les statistiques.");
        }
        const data: AdminDashboardStatistics = await response.json();
        if (isMounted) {
          setStatistics(data);
          setLastUpdated(new Date());
          setError(null);
        }
      } catch (cause) {
        if (controller.signal.aborted) return;
        if (isMounted) {
          setError(
            cause instanceof Error
              ? cause.message
              : "Erreur de chargement.",
          );
        }
      } finally {
        if (isMounted && !controller.signal.aborted) setIsLoading(false);
      }
    }

    void load();
    const interval = window.setInterval(() => {
      if (document.visibilityState === "visible") void load();
    }, 10_000);
    return () => {
      isMounted = false;
      window.clearInterval(interval);
      requestController?.abort();
    };
  }, []);

  const economicData = useMemo(
    () =>
      (statistics?.economicEvolution ?? []).map(({ month, amount }) => ({
        month,
        amount: Number(amount),
      })),
    [statistics],
  );

  const currentMonthValue = economicData.at(-1)?.amount ?? 0;
  const previousMonthValue = economicData.at(-2)?.amount ?? 0;
  const monthDifference = currentMonthValue - previousMonthValue;

  const announcementSegments = useMemo(() => {
    if (!statistics) return [];
    const total = statistics.announcements.total;
    let offset = 0;
    return ANNOUNCEMENT_STATES.map((state) => {
      const count = statistics.announcements[state.key];
      const start = offset;
      offset += total > 0 ? (count / total) * 100 : 0;
      return {
        ...state,
        count,
        start,
        end: offset,
      };
    });
  }, [statistics]);

  const announcementChartStyle = useMemo(() => {
    if (!statistics || statistics.announcements.total === 0) {
      return { background: "#e2e8f0" };
    }
    const stops = announcementSegments
      .map(({ color, start, end }) => `${color} ${start}% ${end}%`)
      .join(", ");
    return { background: `conic-gradient(${stops})` };
  }, [announcementSegments, statistics]);

  return (
    <main className="min-h-screen bg-[#F5F6F8] p-4 sm:p-6 lg:p-8">
      <header className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-emerald-700">
            Tableau de bord
          </p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            Vue d’ensemble
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Indicateurs actualisés depuis la base de données
          </p>
        </div>
        <p className="inline-flex items-center gap-2 self-start rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 sm:self-auto">
          <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
          En direct ·{" "}
          {lastUpdated
            ? `mis à jour à ${lastUpdated.toLocaleTimeString("fr-FR")}`
            : "connexion…"}
        </p>
      </header>

      {error && (
        <div
          role="alert"
          className="mb-5 flex flex-col gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 sm:flex-row sm:items-center sm:justify-between"
        >
          <span>{error} Une nouvelle tentative sera faite automatiquement.</span>
        </div>
      )}

      {isLoading && !statistics ? (
        <div className="flex min-h-64 items-center justify-center rounded-3xl bg-white">
          <LoaderCircle
            className="h-7 w-7 animate-spin text-emerald-600"
            aria-label="Chargement des statistiques"
          />
        </div>
      ) : statistics ? (
        <>
          <section
            aria-label="Indicateurs principaux"
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-6"
          >
            <MetricCard
              label="Comptes inscrits"
              value={statistics.accounts.total}
              note="Comptes locaux et externes"
              icon={Users}
              accent="emerald"
            />
            <MetricCard
              label="Comptes externes"
              value={statistics.accounts.external}
              note="Entreprises des autres régions"
              icon={Globe2}
              accent="blue"
            />
            <MetricCard
              label="Visites du site"
              value={statistics.siteVisits}
              note="Pages vues enregistrées"
              icon={Eye}
              accent="violet"
            />
            <MetricCard
              label="Demandes en attente"
              value={statistics.pendingRequests}
              note="Dossiers à traiter"
              icon={FileClock}
              accent="amber"
            />
            <MetricCard
              label="Contrats en cours"
              value={statistics.contractsInProgress}
              note="Contrats dont la période est active"
              icon={Handshake}
              accent="blue"
            />
            <MetricCard
              label="Annonces actives"
              value={statistics.announcements.active}
              note="Ouvertes aux échanges"
              icon={Megaphone}
              accent="violet"
            />
          </section>

          <section className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-3">
            <div className="rounded-3xl bg-white p-5 shadow-sm sm:p-6 xl:col-span-2">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Évolution économique
                  </h2>
                  <p className="mt-1 text-xs text-slate-500">
                    Montant des contrats acceptés par mois, sur les six derniers mois
                  </p>
                </div>
                <div className="sm:text-right">
                  <p className="text-2xl font-extrabold text-slate-900">
                    {currencyFormatter.format(currentMonthValue)}{" "}
                    <span className="text-sm font-bold text-slate-500">Ar</span>
                  </p>
                  <p
                    className={`mt-1 text-xs font-semibold ${
                      monthDifference >= 0 ? "text-emerald-700" : "text-rose-700"
                    }`}
                  >
                    {monthDifference > 0 ? "+" : ""}
                    {currencyFormatter.format(monthDifference)} Ar par rapport au mois précédent
                  </p>
                </div>
              </div>
              <EconomicChart data={economicData} />
            </div>

            <div className="rounded-3xl bg-white p-5 shadow-sm sm:p-6">
              <h2 className="text-base font-bold text-slate-900">
                État des annonces
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Répartition des annonces ouvertes et clôturées, sans contrat accepté
              </p>
              <div className="mt-7 flex flex-col items-center gap-7 sm:flex-row sm:justify-center xl:flex-col">
                <div
                  role="img"
                  aria-label={`Répartition des annonces : ${statistics.announcements.active} actives et ${statistics.announcements.closed} clôturées`}
                  className="relative h-44 w-44 shrink-0 rounded-full"
                  style={announcementChartStyle}
                >
                  <div className="absolute inset-5 flex flex-col items-center justify-center rounded-full bg-white">
                    <span className="text-3xl font-extrabold text-slate-900">
                      {numberFormatter.format(statistics.announcements.total)}
                    </span>
                    <span className="text-xs font-medium text-slate-500">
                      annonces
                    </span>
                  </div>
                </div>
                <div className="w-full space-y-3 sm:w-auto xl:w-full">
                  {announcementSegments.map((segment) => (
                    <div
                      key={segment.key}
                      className="flex items-center justify-between gap-5 text-sm"
                    >
                      <span className="flex items-center gap-2 text-slate-600">
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: segment.color }}
                        />
                        {segment.label}
                      </span>
                      <span className="font-bold text-slate-900">
                        {numberFormatter.format(segment.count)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-100 bg-white p-4">
              <p className="text-xs font-semibold text-slate-500">
                Comptes locaux
              </p>
              <p className="mt-1 text-xl font-extrabold text-slate-900">
                {numberFormatter.format(statistics.accounts.local)}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Entreprises de la Haute Matsiatra
              </p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-white p-4">
              <p className="text-xs font-semibold text-slate-500">
                Comptes externes
              </p>
              <p className="mt-1 text-xl font-extrabold text-slate-900">
                {numberFormatter.format(statistics.accounts.external)}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Entreprises enregistrées dans d’autres régions
              </p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-white p-4">
              <p className="text-xs font-semibold text-slate-500">
                Annonces clôturées
              </p>
              <p className="mt-1 text-xl font-extrabold text-slate-900">
                {numberFormatter.format(statistics.announcements.closed)}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Toutes catégories confondues
              </p>
            </div>
          </section>
        </>
      ) : null}
    </main>
  );
}

function MetricCard({
  label,
  value,
  note,
  icon: Icon,
  accent,
}: {
  label: string;
  value: number;
  note: string;
  icon: typeof Users;
  accent: "emerald" | "amber" | "blue" | "violet" | "rose";
}) {
  const accentClasses = {
    emerald: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
    blue: "bg-blue-50 text-blue-700",
    violet: "bg-violet-50 text-violet-700",
    rose: "bg-rose-50 text-rose-700",
  }[accent];

  return (
    <article className="rounded-3xl bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-semibold text-slate-500">{label}</p>
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${accentClasses}`}>
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
      </div>
      <p className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900">
        {numberFormatter.format(value)}
      </p>
      <p className="mt-2 min-h-8 text-xs leading-5 text-slate-500">{note}</p>
    </article>
  );
}

function EconomicChart({
  data,
}: {
  data: { month: string; amount: number }[];
}) {
  const width = 640;
  const height = 260;
  const left = 66;
  const right = 18;
  const top = 18;
  const bottom = 42;
  const plotWidth = width - left - right;
  const plotHeight = height - top - bottom;
  const maxAmount = Math.max(...data.map(({ amount }) => amount), 1);
  const points = data.map(({ amount }, index) => ({
    x: left + (data.length > 1 ? (index / (data.length - 1)) * plotWidth : 0),
    y: top + plotHeight - (amount / maxAmount) * plotHeight,
  }));
  const linePoints = points.map(({ x, y }) => `${x},${y}`).join(" ");

  return (
    <div className="mt-5 w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-64 min-w-[520px] w-full"
        role="img"
        aria-label="Courbe des montants des contrats acceptés au cours des six derniers mois"
      >
        {[0, 0.5, 1].map((fraction) => {
          const y = top + plotHeight - fraction * plotHeight;
          return (
            <g key={fraction}>
              <line
                x1={left}
                x2={width - right}
                y1={y}
                y2={y}
                stroke="#e2e8f0"
                strokeDasharray="4 5"
              />
              <text
                x={left - 9}
                y={y + 4}
                textAnchor="end"
                fill="#94a3b8"
                fontSize="10"
              >
                {currencyFormatter.format(maxAmount * fraction)}
              </text>
            </g>
          );
        })}
        {points.length > 1 && (
          <polyline
            points={linePoints}
            fill="none"
            stroke="#059669"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        )}
        {points.map(({ x, y }, index) => (
          <g key={data[index].month}>
            <circle cx={x} cy={y} r="5" fill="#059669" />
            <circle cx={x} cy={y} r="2" fill="white" />
            <text
              x={x}
              y={height - 12}
              textAnchor="middle"
              fill="#64748b"
              fontSize="10"
              fontWeight="600"
            >
              {MONTH_FORMATTER.format(
                new Date(`${data[index].month}-01T00:00:00Z`),
              )}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
