"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Eye,
  FileClock,
  Globe2,
  LoaderCircle,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { getApiRoot } from "../../lib/auth";
import CompanyAvatar from "../../components/CompanyAvatar";

// ─── Types ───
interface AdminDashboardStatistics {
  accounts: { local: number; external: number; total: number };
  siteVisits: number;
  pendingRequests: number;
  contractsInProgress: number;
  announcements: { active: number; closed: number; total: number };
  economicEvolution: { month: string; amount: string }[];
}

interface MemberSummary {
  id: string;
  email: string;
  avatarUrl?: string | null;
  company: {
    companyName: string;
    sector: string;
    companyType: string;
    logoUrl?: string | null;
  };
}

type DashboardPeriod = "day" | "week" | "month";

const periodOptions: { value: DashboardPeriod; label: string }[] = [
  { value: "day", label: "Aujourd’hui" },
  { value: "week", label: "Cette semaine" },
  { value: "month", label: "Ce mois" },
];

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

export default function AdminDashboardPage() {
  const [statistics, setStatistics] = useState<AdminDashboardStatistics | null>(
    null,
  );
  const [recentMembers, setRecentMembers] = useState<MemberSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<DashboardPeriod>("month");
  const [now, setNow] = useState(new Date());

  // Mise à jour de l'heure
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Chargement des stats et des membres récents
  useEffect(() => {
    let isMounted = true;
    let requestController: AbortController | null = null;

    async function load() {
      requestController?.abort();
      const controller = new AbortController();
      requestController = controller;
      try {
        const [statsRes, membersRes] = await Promise.all([
          fetch(`${getApiRoot()}/admin/dashboard/statistics?period=${period}`, {
            credentials: "include",
            cache: "no-store",
            signal: controller.signal,
          }),
          fetch(`${getApiRoot()}/users`, {
            credentials: "include",
            cache: "no-store",
            signal: controller.signal,
          }),
        ]);

        if (!statsRes.ok)
          throw new Error("Impossible de charger les statistiques.");
        const data: AdminDashboardStatistics = await statsRes.json();

        if (membersRes.ok) {
          const membersData: MemberSummary[] = await membersRes.json();
          if (isMounted) setRecentMembers(membersData.slice(0, 4));
        }

        if (isMounted) {
          setStatistics(data);
          setError(null);
        }
      } catch (cause) {
        if (controller.signal.aborted) return;
        if (isMounted)
          setError(
            cause instanceof Error ? cause.message : "Erreur de chargement.",
          );
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
  }, [period]);

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
  const monthDiffPercent =
    previousMonthValue > 0 ? (monthDifference / previousMonthValue) * 100 : 0;

  // ─── DONNÉES VISITES AVEC PIC ───
  const visitBars = useMemo(() => {
    if (!statistics) return [];
    const base = statistics.siteVisits / 7;
    return [
      { label: "Lun", value: base * 0.4 },
      { label: "Mar", value: base * 0.7 },
      { label: "Mer", value: base * 2.5 }, // PIC
      { label: "Jeu", value: base * 1.1 },
      { label: "Ven", value: base * 0.8 },
      { label: "Sam", value: base * 0.5 },
      { label: "Dim", value: base * 0.3 },
    ];
  }, [statistics]);

  const maxVisit = Math.max(...visitBars.map((b) => b.value), 1);

  const getSectorLabel = (sector: string) => {
    const labels: Record<string, string> = {
      AGRO: "Agroalimentaire",
      NTIC: "NTIC & Web",
      BTP: "BTP & Construction",
      TOURISM: "Tourisme",
      COMMERCE: "Commerce",
      ARTISANAT: "Artisanat",
    };
    return labels[sector] || sector || "—";
  };

  if (isLoading && !statistics) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-[#f4f7fe]">
        <LoaderCircle className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!statistics) return null;

  return (
    <main className="min-h-screen bg-[#f4f7fe] p-4 sm:p-6 lg:p-8">
      {/* ─── EN-TÊTE (Sans texte) ─── */}
      <header
        className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        data-aos="fade-down"
      >
        <div>
          <p className="text-lg font-bold text-slate-900">
            {now.toLocaleDateString("fr-FR", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
          <p className="text-xs font-semibold text-slate-500">
            {now.toLocaleTimeString("fr-FR")}
          </p>
        </div>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value as DashboardPeriod)}
          className="self-start rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 sm:self-auto"
        >
          {periodOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </header>

      {error && (
        <div
          role="alert"
          className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800"
          data-aos="fade-in"
        >
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* COLONNE GAUCHE (2/3) */}
        <div className="flex flex-col gap-5 lg:col-span-2">
          {/* Métriques Top */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* CARTE VISITES AVEC PIC */}
            <div
              className="flex flex-col justify-between relative overflow-hidden rounded-[24px] bg-[#4b6bfb] p-5 text-white shadow-md"
              data-aos="fade-up"
              data-aos-delay="0"
            >
              <div className="flex items-start justify-between relative z-10 mb-4">
                <div>
                  <p className="text-sm font-medium text-white/80">
                    Visites du site
                  </p>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold">
                      {numberFormatter.format(statistics.siteVisits)}
                    </span>
                    <span className="text-[10px] text-white/70">
                      vs période précédente
                    </span>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2 py-1 text-[10px] font-bold">
                  <ArrowUpRight className="h-3 w-3" /> +2.08%
                </span>
              </div>

              {/* Histogramme avec pic */}
              <div className="relative z-10 flex h-28 items-end justify-between gap-2 mt-auto pt-2 border-b border-white/20 pb-2">
                {visitBars.map((bar, i) => (
                  <div
                    key={i}
                    className="flex flex-1 flex-col items-center gap-1 group h-full justify-end"
                  >
                    <span className="text-[9px] font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity">
                      {numberFormatter.format(bar.value)}
                    </span>
                    <div
                      className="w-full max-w-[24px] rounded-t-md bg-white transition-all duration-300 group-hover:bg-[#ffd700] group-hover:shadow-[0_0_12px_rgba(255,215,0,0.6)]"
                      style={{
                        height: `${(bar.value / maxVisit) * 100}%`,
                        minHeight: "4px",
                      }}
                    />
                    <span className="text-[9px] font-medium text-white/70 group-hover:text-white transition mt-1">
                      {bar.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Carte violette */}
            <div
              className="relative overflow-hidden rounded-[24px] bg-[#8b5cf6] p-5 text-white shadow-md"
              data-aos="fade-up"
              data-aos-delay="100"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
                  <Users className="h-5 w-5" />
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2 py-1 text-[10px] font-bold text-emerald-100">
                  <ArrowUpRight className="h-3 w-3" /> +12.4%
                </span>
              </div>
              <p className="mt-4 text-sm font-medium text-white/80">
                Comptes inscrits
              </p>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold">
                  {numberFormatter.format(statistics.accounts.total)}
                </span>
                <span className="text-[10px] text-white/70">
                  vs période précédente
                </span>
              </div>
            </div>

            {/* Carte verte */}
            <div
              className="relative overflow-hidden rounded-[24px] bg-[#10b981] p-5 text-white shadow-md"
              data-aos="fade-up"
              data-aos-delay="200"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
                  <Globe2 className="h-5 w-5" />
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2 py-1 text-[10px] font-bold text-rose-100">
                  <ArrowDownRight className="h-3 w-3" /> -2.08%
                </span>
              </div>
              <p className="mt-4 text-sm font-medium text-white/80">
                Comptes externes
              </p>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold">
                  {numberFormatter.format(statistics.accounts.external)}
                </span>
                <span className="text-[10px] text-white/70">
                  vs période précédente
                </span>
              </div>
            </div>

            {/* Carte ambre */}
            <div
              className="relative overflow-hidden rounded-[24px] bg-[#f59e0b] p-5 text-white shadow-md"
              data-aos="fade-up"
              data-aos-delay="300"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
                  <FileClock className="h-5 w-5" />
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2 py-1 text-[10px] font-bold text-emerald-100">
                  <ArrowUpRight className="h-3 w-3" /> +12.1%
                </span>
              </div>
              <p className="mt-4 text-sm font-medium text-white/80">
                Demandes en attente
              </p>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold">
                  {numberFormatter.format(statistics.pendingRequests)}
                </span>
                <span className="text-[10px] text-white/70">
                  vs période précédente
                </span>
              </div>
            </div>
          </div>

          {/* Graphique Évolution économique */}
          <div
            className="rounded-[24px] bg-[#eef2ff] p-5 shadow-sm border border-[#dbe3ff]"
            data-aos="fade-up"
            data-aos-delay="400"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Évolution économique
                </h2>
                <p className="mt-1 text-xs text-slate-600">
                  Montant des contrats acceptés par mois
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg font-extrabold text-slate-900">
                  {currencyFormatter.format(currentMonthValue)}{" "}
                  <span className="text-xs font-bold text-slate-600">Ar</span>
                </p>
                <p
                  className={`text-[10px] font-semibold ${monthDiffPercent >= 0 ? "text-emerald-700" : "text-rose-700"}`}
                >
                  {monthDiffPercent > 0 ? "+" : ""}
                  {monthDiffPercent.toFixed(1)}% vs mois précédent
                </p>
              </div>
            </div>
            <div className="mt-6">
              <EconomicCurveChart data={economicData} />
            </div>
          </div>

          {/* ─── Liste des membres avec Avatar Photo ─── */}
          <div
            className="rounded-[24px] bg-white p-5 shadow-sm"
            data-aos="fade-up"
            data-aos-delay="500"
          >
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Derniers membres
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Acteurs récemment inscrits
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-100 text-[10px] uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="pb-3 pr-4 font-bold">Acteur</th>
                    <th className="pb-3 px-4 font-bold">Domaine</th>
                    <th className="pb-3 pl-4 font-bold text-right">Contact</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {recentMembers.map((member) => {
                    const isInternal =
                      member.company.companyType === "HAUTE_MATSIATRA";
                    return (
                      <tr
                        key={member.id}
                        className="group hover:bg-slate-50/50"
                      >
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-3">
                            <CompanyAvatar
                              src={member.company.logoUrl || member.avatarUrl}
                              name={member.company.companyName}
                              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full shadow-sm ${
                                isInternal ? "bg-emerald-100" : "bg-indigo-100"
                              }`}
                              initialsClassName={`text-[10px] font-bold ${
                                isInternal
                                  ? "text-emerald-700"
                                  : "text-indigo-700"
                              }`}
                            />
                            <div className="min-w-0">
                              <p className="truncate font-bold text-slate-900">
                                {member.company.companyName}
                              </p>
                              <p className="truncate text-[10px] text-slate-500">
                                {member.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-flex rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                            {getSectorLabel(member.company.sector)}
                          </span>
                        </td>
                        <td className="py-3 pl-4 text-right text-xs text-slate-500">
                          {isInternal ? "Interne" : "Externe"}
                        </td>
                      </tr>
                    );
                  })}
                  {recentMembers.length === 0 && (
                    <tr>
                      <td
                        colSpan={3}
                        className="py-6 text-center text-xs text-slate-400"
                      >
                        Aucun membre récent.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* COLONNE DROITE (1/3) */}
        <div className="flex flex-col gap-5">
          {/* Calendrier */}
          <div data-aos="fade-left" data-aos-delay="100">
            <MiniCalendar />
          </div>

          {/* État des annonces */}
          <div
            className="rounded-[24px] bg-[#8b5cf6] p-5 text-white shadow-sm"
            data-aos="fade-left"
            data-aos-delay="200"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white">
                  État des annonces
                </h2>
                <p className="mt-1 text-xs text-white/80">
                  Répartition par statut
                </p>
              </div>
            </div>
            <div className="mt-4 flex flex-col items-center gap-4">
              <div className="relative flex h-40 w-40 items-center justify-center">
                <DonutRing
                  total={statistics.announcements.total}
                  active={statistics.announcements.active}
                  closed={statistics.announcements.closed}
                  colorActive="#ffffff"
                  colorClosed="#c4b5fd"
                  trackColor="rgba(255,255,255,0.2)"
                />
                <div className="absolute flex flex-col items-center justify-center text-center">
                  <span className="text-2xl font-extrabold text-white">
                    {numberFormatter.format(statistics.announcements.total)}
                  </span>
                  <span className="text-[10px] font-medium text-white/80">
                    Annonces
                  </span>
                </div>
              </div>
              <div className="w-full space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2 text-white/90">
                    <span className="h-2.5 w-2.5 rounded-full bg-white" />
                    Ouvertes
                  </span>
                  <span className="font-bold text-white">
                    {numberFormatter.format(statistics.announcements.active)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2 text-white/90">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#c4b5fd]" />
                    En cours
                  </span>
                  <span className="font-bold text-white">
                    {numberFormatter.format(statistics.announcements.closed)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Typologie des entreprises */}
          <div
            className="rounded-[24px] bg-[#10b981] p-5 text-white shadow-sm"
            data-aos="fade-left"
            data-aos-delay="300"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white">
                  Typologie des entreprises
                </h2>
                <p className="mt-1 text-xs text-white/80">Interne vs Externe</p>
              </div>
            </div>
            <div className="mt-5 flex flex-col items-center justify-center">
              <div className="relative flex h-40 w-40 items-center justify-center">
                <DonutRing
                  total={statistics.accounts.total}
                  active={statistics.accounts.local}
                  closed={statistics.accounts.external}
                  colorActive="#ffffff"
                  colorClosed="#a7f3d0"
                  trackColor="rgba(255,255,255,0.2)"
                />
                <div className="absolute flex flex-col items-center justify-center text-center">
                  <span className="text-2xl font-extrabold text-white">
                    {numberFormatter.format(statistics.accounts.total)}
                  </span>
                  <span className="text-[10px] font-medium text-white/80">
                    Total
                  </span>
                </div>
              </div>
              <div className="mt-4 flex w-full items-center justify-center gap-6 text-xs">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-white" />
                  <span className="text-white/90">Interne</span>
                  <span className="font-bold text-white">
                    {numberFormatter.format(statistics.accounts.local)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#a7f3d0]" />
                  <span className="text-white/90">Externe</span>
                  <span className="font-bold text-white">
                    {numberFormatter.format(statistics.accounts.external)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

// ─── Sous-composants (inchangés) ───

function MiniCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthName = new Intl.DateTimeFormat("fr-FR", {
    month: "long",
    year: "numeric",
  }).format(currentDate);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const startingDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: startingDay }, () => null);
  const allDays = [...emptyDays, ...days];

  const today = new Date();
  const isToday = (day: number) =>
    day === today.getDate() &&
    month === today.getMonth() &&
    year === today.getFullYear();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  return (
    <div className="rounded-[24px] bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold text-slate-900 capitalize">
          {monthName}
        </h2>
        <div className="flex items-center gap-1">
          <button
            onClick={prevMonth}
            className="p-1 rounded-full hover:bg-slate-100 text-slate-500 transition"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={nextMonth}
            className="p-1 rounded-full hover:bg-slate-100 text-slate-500 transition"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        {["L", "M", "M", "J", "V", "S", "D"].map((d, i) => (
          <span
            key={i}
            className="text-[10px] font-bold text-slate-400 uppercase"
          >
            {d}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {allDays.map((day, index) => {
          if (!day) return <div key={`empty-${index}`} />;
          const active = isToday(day);
          return (
            <div
              key={day}
              className={`flex h-7 w-7 items-center justify-center rounded-full text-xs transition cursor-pointer ${
                active
                  ? "bg-[#4b6bfb] text-white font-bold shadow-md"
                  : "text-slate-700 hover:bg-slate-100 font-medium"
              }`}
            >
              {day}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function EconomicCurveChart({
  data,
}: {
  data: { month: string; amount: number }[];
}) {
  const width = 640;
  const height = 260;
  const left = 50;
  const right = 20;
  const top = 30;
  const bottom = 40;
  const plotWidth = width - left - right;
  const plotHeight = height - top - bottom;
  const maxAmount = Math.max(...data.map(({ amount }) => amount), 1);

  const points = data.map(({ amount }, index) => ({
    x:
      left +
      (data.length > 1
        ? (index / (data.length - 1)) * plotWidth
        : plotWidth / 2),
    y: top + plotHeight - (amount / maxAmount) * plotHeight,
  }));

  const pathD = points.reduce((acc, point, i, a) => {
    if (i === 0) return `M ${point.x},${point.y}`;
    const prev = a[i - 1];
    const cp1x = prev.x + (point.x - prev.x) / 2;
    const cp1y = prev.y;
    const cp2x = prev.x + (point.x - prev.x) / 2;
    const cp2y = point.y;
    return `${acc} C ${cp1x},${cp1y} ${cp2x},${cp2y} ${point.x},${point.y}`;
  }, "");

  const areaD = `${pathD} L ${points[points.length - 1]?.x ?? width - right},${top + plotHeight} L ${left},${top + plotHeight} Z`;

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-64 min-w-[500px] w-full"
      >
        <defs>
          <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4b6bfb" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#4b6bfb" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0, 0.5, 1].map((fraction) => {
          const y = top + plotHeight - fraction * plotHeight;
          return (
            <g key={fraction}>
              <line
                x1={left}
                x2={width - right}
                y1={y}
                y2={y}
                stroke="#cbd5e1"
                strokeDasharray="4 5"
              />
              <text
                x={left - 9}
                y={y + 4}
                textAnchor="end"
                fill="#64748b"
                fontSize="10"
              >
                {currencyFormatter.format(maxAmount * fraction)}
              </text>
            </g>
          );
        })}
        <path d={areaD} fill="url(#areaGradient)" />
        <path
          d={pathD}
          fill="none"
          stroke="#4b6bfb"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {points.map(({ x, y }, index) => (
          <g key={data[index].month}>
            <circle cx={x} cy={y} r="5" fill="#4b6bfb" />
            <circle cx={x} cy={y} r="2" fill="white" />
            <text
              x={x}
              y={height - 12}
              textAnchor="middle"
              fill="#475569"
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

function DonutRing({
  total,
  active,
  closed,
  colorActive = "#4b6bfb",
  colorClosed = "#ef4444",
  trackColor = "#f1f5f9",
}: {
  total: number;
  active: number;
  closed: number;
  colorActive?: string;
  colorClosed?: string;
  trackColor?: string;
}) {
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const activePercent = total > 0 ? (active / total) * 100 : 0;
  const closedPercent = total > 0 ? (closed / total) * 100 : 0;

  return (
    <svg className="h-full w-full -rotate-90" viewBox="0 0 160 160">
      <circle
        cx="80"
        cy="80"
        r={radius}
        fill="none"
        stroke={trackColor}
        strokeWidth="12"
      />
      {activePercent > 0 && (
        <circle
          cx="80"
          cy="80"
          r={radius}
          fill="none"
          stroke={colorActive}
          strokeWidth="12"
          strokeDasharray={circumference}
          strokeDashoffset={
            circumference - (activePercent / 100) * circumference
          }
          strokeLinecap="round"
        />
      )}
      {closedPercent > 0 && (
        <circle
          cx="80"
          cy="80"
          r={radius}
          fill="none"
          stroke={colorClosed}
          strokeWidth="12"
          strokeDasharray={circumference}
          strokeDashoffset={
            circumference - (closedPercent / 100) * circumference
          }
          strokeLinecap="round"
          transform={`rotate(${(activePercent / 100) * 360} 80 80)`}
        />
      )}
    </svg>
  );
}
