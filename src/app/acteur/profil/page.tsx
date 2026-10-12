"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import {
  BarChart3,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  Clock3,
  LoaderCircle,
  MapPin,
  Pencil,
  Plus,
  Save,
  Trash2,
  X,
  PieChart,
  Layers,
} from "lucide-react";
import Link from "next/link";
import { getApiRoot } from "../../lib/auth";
import { useAuth } from "../../providers/AuthProvider";

type AnnouncementStatus = "OPEN" | "IN_PROGRESS" | "CLOSED";
type AnnouncementType = "OFFRE" | "DEMANDE";

type Announcement = {
  id: string;
  title: string;
  category: string;
  description: string;
  type: AnnouncementType;
  status: AnnouncementStatus;
  specificLocation?: string | null;
  deadline?: string | null;
  createdAt: string;
};

type AnnouncementForm = {
  type: AnnouncementType;
  title: string;
  category: string;
  description: string;
  specificLocation: string;
  deadline: string;
};

const emptyForm: AnnouncementForm = {
  type: "OFFRE",
  title: "",
  category: "",
  description: "",
  specificLocation: "",
  deadline: "",
};

const statusLabels: Record<AnnouncementStatus, string> = {
  OPEN: "Publiée",
  IN_PROGRESS: "En cours",
  CLOSED: "Clôturée",
};

function toDateInputValue(date?: string | null) {
  if (!date) return "";
  const parsedDate = new Date(date);
  return Number.isNaN(parsedDate.getTime())
    ? ""
    : parsedDate.toISOString().slice(0, 10);
}

function formatDate(date: string) {
  const parsedDate = new Date(date);
  return Number.isNaN(parsedDate.getTime())
    ? "Date inconnue"
    : new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" }).format(
        parsedDate,
      );
}

// ─────────────────────────────────────────────────────────
// 📈 Courbe multi-lignes
// ─────────────────────────────────────────────────────────
function LineChart({
  data,
}: {
  data: {
    label: string;
    total: number;
    offres: number;
    demandes: number;
  }[];
}) {
  const width = 900;
  const height = 300;
  const padding = { top: 30, right: 30, bottom: 50, left: 40 };
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;

  const maxValue = Math.max(
    ...data.map((d) => Math.max(d.total, d.offres, d.demandes)),
    1,
  );

  const makePoints = (key: "total" | "offres" | "demandes") =>
    data.map((d, i) => ({
      x: padding.left + (i / Math.max(data.length - 1, 1)) * innerWidth,
      y: padding.top + innerHeight - (d[key] / maxValue) * innerHeight,
      value: d[key],
      label: d.label,
    }));

  const totalPoints = makePoints("total");
  const offresPoints = makePoints("offres");
  const demandesPoints = makePoints("demandes");

  const makePath = (points: { x: number; y: number }[]) =>
    points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

  const totalPath = makePath(totalPoints);
  const offresPath = makePath(offresPoints);
  const demandesPath = makePath(demandesPoints);

  const gridLines = 4;

  return (
    <div className="w-full">
      <div className="mb-4 flex flex-wrap items-center justify-end gap-5">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-violet-500" />
          <span className="text-[11px] font-bold text-slate-600">Total</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
          <span className="text-[11px] font-bold text-slate-600">Offres</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
          <span className="text-[11px] font-bold text-slate-600">Demandes</span>
        </div>
      </div>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full"
        style={{ height: "auto", maxHeight: 320 }}
      >
        <defs>
          <linearGradient id="areaTotal" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="lineTotal" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#a78bfa" />
            <stop offset="100%" stopColor="#7c3aed" />
          </linearGradient>
          <linearGradient id="lineOffres" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
          <linearGradient id="lineDemandes" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>
        </defs>

        {Array.from({ length: gridLines + 1 }).map((_, i) => {
          const y = padding.top + (i / gridLines) * innerHeight;
          const value = Math.round(maxValue * (1 - i / gridLines));
          return (
            <g key={i}>
              <line
                x1={padding.left}
                y1={y}
                x2={width - padding.right}
                y2={y}
                stroke="#f1f5f9"
                strokeWidth="1"
                strokeDasharray={i === gridLines ? "0" : "4 4"}
              />
              <text
                x={padding.left - 8}
                y={y + 4}
                textAnchor="end"
                fontSize="10"
                fill="#94a3b8"
                fontWeight="600"
              >
                {value}
              </text>
            </g>
          );
        })}

        <path
          d={`${totalPath} L ${totalPoints[totalPoints.length - 1]?.x ?? 0} ${
            padding.top + innerHeight
          } L ${totalPoints[0]?.x ?? 0} ${padding.top + innerHeight} Z`}
          fill="url(#areaTotal)"
        />

        <path
          d={totalPath}
          fill="none"
          stroke="url(#lineTotal)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <path
          d={offresPath}
          fill="none"
          stroke="url(#lineOffres)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="6 3"
        />

        <path
          d={demandesPath}
          fill="none"
          stroke="url(#lineDemandes)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="6 3"
        />

        {totalPoints.map((p, i) => (
          <g key={`t-${i}`}>
            <circle cx={p.x} cy={p.y} r="6" fill="white" />
            <circle cx={p.x} cy={p.y} r="4" fill="#8b5cf6" />
            <text
              x={p.x}
              y={p.y - 12}
              textAnchor="middle"
              fontSize="11"
              fontWeight="800"
              fill="#6d28d9"
            >
              {p.value}
            </text>
            <text
              x={p.x}
              y={height - 20}
              textAnchor="middle"
              fontSize="11"
              fontWeight="700"
              fill="#64748b"
            >
              {p.label}
            </text>
          </g>
        ))}

        {offresPoints.map((p, i) => (
          <g key={`o-${i}`}>
            <circle cx={p.x} cy={p.y} r="5" fill="white" />
            <circle cx={p.x} cy={p.y} r="3" fill="#10b981" />
          </g>
        ))}

        {demandesPoints.map((p, i) => (
          <g key={`d-${i}`}>
            <circle cx={p.x} cy={p.y} r="5" fill="white" />
            <circle cx={p.x} cy={p.y} r="3" fill="#f59e0b" />
          </g>
        ))}
      </svg>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// 📊 Barres
// ─────────────────────────────────────────────────────────
function BarChart({
  data,
}: {
  data: { label: string; value: number; color: string }[];
}) {
  const maxValue = Math.max(...data.map((d) => d.value), 1);
  const chartHeight = 240;

  return (
    <div className="w-full">
      <div
        className="relative flex items-end justify-around gap-2 rounded-2xl bg-gradient-to-b from-slate-50 to-white p-4"
        style={{ height: `${chartHeight}px` }}
      >
        <div className="pointer-events-none absolute inset-4 flex flex-col justify-between">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-px w-full bg-slate-100"
              style={{ opacity: i === 4 ? 0 : 0.6 }}
            />
          ))}
        </div>

        {data.map((item) => {
          const heightPct = (item.value / maxValue) * 100;
          const isZero = item.value === 0;

          return (
            <div
              key={item.label}
              className="group relative flex h-full flex-1 flex-col items-center justify-end"
            >
              <span
                className="mb-1.5 text-sm font-extrabold text-slate-900 transition-transform group-hover:-translate-y-1"
                style={{ opacity: isZero ? 0.4 : 1 }}
              >
                {item.value}
              </span>

              <div
                className="w-full max-w-[70px] rounded-t-xl transition-all duration-700 ease-out hover:shadow-lg hover:brightness-110"
                style={{
                  height: isZero ? "4px" : `${Math.max(heightPct, 4)}%`,
                  background: `linear-gradient(180deg, ${item.color}, ${item.color}dd)`,
                  boxShadow: isZero
                    ? "none"
                    : `0 4px 12px -2px ${item.color}55`,
                }}
              />
            </div>
          );
        })}
      </div>

      <div className="mt-3 flex items-center justify-around gap-2">
        {data.map((item) => (
          <div
            key={item.label}
            className="flex-1 text-center text-[10px] font-bold uppercase tracking-wider text-slate-500"
          >
            {item.label}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// 🍩 Donut
// ─────────────────────────────────────────────────────────
function DonutChart({ offre, demande }: { offre: number; demande: number }) {
  const total = offre + demande;
  const size = 200;
  const strokeWidth = 28;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const offrePercent = total > 0 ? offre / total : 0;
  const demandePercent = total > 0 ? demande / total : 0;
  const offreDash = offrePercent * circumference;
  const demandeDash = demandePercent * circumference;

  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row sm:justify-center">
      <div className="relative shrink-0">
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="-rotate-90"
          style={{ filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.06))" }}
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#f1f5f9"
            strokeWidth={strokeWidth}
          />
          {total > 0 && (
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="#10b981"
              strokeWidth={strokeWidth}
              strokeDasharray={`${offreDash} ${circumference - offreDash}`}
              strokeLinecap="round"
            />
          )}
          {total > 0 && (
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="#f59e0b"
              strokeWidth={strokeWidth}
              strokeDasharray={`${demandeDash} ${circumference - demandeDash}`}
              strokeDashoffset={-offreDash}
              strokeLinecap="round"
            />
          )}
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-3xl font-extrabold text-slate-900 leading-none">
            {total}
          </p>
          <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Total
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-3 rounded-xl bg-emerald-50 px-4 py-2.5 ring-1 ring-emerald-100">
          <span className="h-3 w-3 shrink-0 rounded-full bg-emerald-500" />
          <div>
            <p className="text-xs font-bold text-emerald-700">Offres</p>
            <p className="text-lg font-extrabold text-slate-900 leading-none">
              {offre}
              <span className="ml-1 text-xs font-semibold text-slate-400">
                ({total > 0 ? Math.round(offrePercent * 100) : 0}%)
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-xl bg-amber-50 px-4 py-2.5 ring-1 ring-amber-100">
          <span className="h-3 w-3 shrink-0 rounded-full bg-amber-500" />
          <div>
            <p className="text-xs font-bold text-amber-700">Demandes</p>
            <p className="text-lg font-extrabold text-slate-900 leading-none">
              {demande}
              <span className="ml-1 text-xs font-semibold text-slate-400">
                ({total > 0 ? Math.round(demandePercent * 100) : 0}%)
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// 📊 KPI Card
// ─────────────────────────────────────────────────────────
function KpiCard({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string;
  value: number | string;
  icon: React.ComponentType<{ className?: string }>;
  accent: string;
}) {
  return (
    <div className="group flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition hover:border-emerald-200 hover:shadow-md">
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${accent} transition group-hover:scale-105`}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-2xl font-extrabold text-slate-900 leading-none">
          {value}
        </p>
        <p className="mt-1 text-[11px] font-bold uppercase tracking-wider text-slate-500 truncate">
          {label}
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// 🎯 Page
// ─────────────────────────────────────────────────────────
export default function ActorProfilePage() {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<AnnouncementForm>(emptyForm);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [historyFilter, setHistoryFilter] = useState<
    "ALL" | "OPEN" | "IN_PROGRESS" | "CLOSED"
  >("ALL");

  const loadAnnouncements = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${getApiRoot()}/announcements/mine`, {
        credentials: "include",
        cache: "no-store",
      });
      if (!response.ok) {
        const result = (await response.json()) as { message?: string };
        throw new Error(
          result.message || "Impossible de charger vos annonces.",
        );
      }
      setAnnouncements((await response.json()) as Announcement[]);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Impossible de charger vos annonces.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAnnouncements();
  }, [loadAnnouncements]);

  const beginEditing = (announcement: Announcement) => {
    setError(null);
    setEditingId(announcement.id);
    setForm({
      type: announcement.type,
      title: announcement.title,
      category: announcement.category,
      description: announcement.description,
      specificLocation: announcement.specificLocation || "",
      deadline: toDateInputValue(announcement.deadline),
    });
  };

  const saveAnnouncement = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingId) return;

    setIsSaving(true);
    setError(null);
    const deadline = form.deadline
      ? new Date(form.deadline).toISOString()
      : null;
    const payload = {
      ...form,
      specificLocation: form.specificLocation || null,
      deadline,
    };

    try {
      const response = await fetch(
        `${getApiRoot()}/announcements/${editingId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        },
      );
      if (!response.ok) {
        const result = (await response.json()) as { message?: string };
        throw new Error(result.message || "La modification a échoué.");
      }
      const updated = (await response.json()) as Announcement;
      setAnnouncements((current) =>
        current.map((a) => (a.id === updated.id ? updated : a)),
      );
      setEditingId(null);
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "La modification a échoué.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const deleteAnnouncement = async (announcement: Announcement) => {
    if (
      !window.confirm(
        `Supprimer définitivement l'annonce « ${announcement.title} » ?`,
      )
    ) {
      return;
    }
    setDeletingId(announcement.id);
    setError(null);
    try {
      const response = await fetch(
        `${getApiRoot()}/announcements/${announcement.id}`,
        { method: "DELETE", credentials: "include" },
      );
      if (!response.ok) {
        const result = (await response.json()) as { message?: string };
        throw new Error(result.message || "La suppression a échoué.");
      }
      setAnnouncements((current) =>
        current.filter((item) => item.id !== announcement.id),
      );
      if (editingId === announcement.id) setEditingId(null);
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "La suppression a échoué.",
      );
    } finally {
      setDeletingId(null);
    }
  };

  // ─────────────────────────────────────────────────────────
  // Calculs
  // ─────────────────────────────────────────────────────────
  const publishedCount = announcements.filter(
    (a) => a.status === "OPEN",
  ).length;
  const inProgressCount = announcements.filter(
    (a) => a.status === "IN_PROGRESS",
  ).length;
  const closedCount = announcements.filter((a) => a.status === "CLOSED").length;
  const offreCount = announcements.filter((a) => a.type === "OFFRE").length;
  const demandeCount = announcements.filter((a) => a.type === "DEMANDE").length;

  const categoriesBreakdown = useMemo(() => {
    const map = new Map<string, number>();
    announcements.forEach((a) => {
      const cat = a.category || "Autre";
      map.set(cat, (map.get(cat) || 0) + 1);
    });
    return Array.from(map.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [announcements]);

  const evolutionData = useMemo(() => {
    const now = new Date();
    const months: {
      label: string;
      total: number;
      offres: number;
      demandes: number;
    }[] = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = d
        .toLocaleDateString("fr-FR", { month: "short" })
        .replace(".", "");

      const monthAnnouncements = announcements.filter((a) => {
        const created = new Date(a.createdAt);
        return (
          created.getFullYear() === d.getFullYear() &&
          created.getMonth() === d.getMonth()
        );
      });

      months.push({
        label: label.charAt(0).toUpperCase() + label.slice(1),
        total: monthAnnouncements.length,
        offres: monthAnnouncements.filter((a) => a.type === "OFFRE").length,
        demandes: monthAnnouncements.filter((a) => a.type === "DEMANDE").length,
      });
    }
    return months;
  }, [announcements]);

  const sortedHistory = useMemo(() => {
    return [...announcements].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [announcements]);

  const filteredHistory = useMemo(() => {
    if (historyFilter === "ALL") return sortedHistory;
    return sortedHistory.filter((a) => a.status === historyFilter);
  }, [sortedHistory, historyFilter]);

  const barData = [
    { label: "Publiées", value: publishedCount, color: "#10b981" },
    { label: "En cours", value: inProgressCount, color: "#f59e0b" },
    { label: "Clôturées", value: closedCount, color: "#64748b" },
  ];

  return (
    <div className="w-full space-y-6 py-4 px-4 sm:px-6 lg:px-8">
      {/* ═══════════════════════════════════════════
          KPI CARDS
          ═══════════════════════════════════════════ */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <KpiCard
          label="Toutes les annonces"
          value={announcements.length}
          icon={BarChart3}
          accent="bg-slate-100 text-slate-700"
        />
        <KpiCard
          label="Publiées"
          value={publishedCount}
          icon={Check}
          accent="bg-emerald-50 text-emerald-600"
        />
        <KpiCard
          label="En cours"
          value={inProgressCount}
          icon={Clock3}
          accent="bg-amber-50 text-amber-600"
        />
        <KpiCard
          label="Clôturées"
          value={closedCount}
          icon={CalendarDays}
          accent="bg-slate-50 text-slate-500"
        />
      </section>

      {/* ═══════════════════════════════════════════
          COURBE D'ÉVOLUTION
          ═══════════════════════════════════════════ */}
      <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
        <div className="mb-5">
          <h2 className="text-sm font-extrabold text-slate-900">
            Évolution de vos annonces
          </h2>
          <p className="mt-0.5 text-[11px] text-slate-500">
            Comparaison Offres / Demandes sur les 6 derniers mois
          </p>
        </div>

        <LineChart data={evolutionData} />
      </section>

      {/* ═══════════════════════════════════════════
          BARRES + DONUT
          ═══════════════════════════════════════════ */}
      <section className="grid gap-5 lg:grid-cols-5">
        <div className="lg:col-span-3 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="mb-5">
            <h2 className="text-sm font-extrabold text-slate-900">
              Répartition par statut
            </h2>
            <p className="mt-0.5 text-[11px] text-slate-500">
              Distribution de vos annonces selon leur état
            </p>
          </div>

          <BarChart data={barData} />
        </div>

        <div className="lg:col-span-2 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="mb-5">
            <h2 className="text-sm font-extrabold text-slate-900">
              Offres vs Demandes
            </h2>
            <p className="mt-0.5 text-[11px] text-slate-500">
              Répartition globale
            </p>
          </div>

          <DonutChart offre={offreCount} demande={demandeCount} />
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          TOP CATÉGORIES
          ═══════════════════════════════════════════ */}
      <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
        <div className="mb-5">
          <h2 className="text-sm font-extrabold text-slate-900">
            Top catégories
          </h2>
          <p className="mt-0.5 text-[11px] text-slate-500">
            {categoriesBreakdown.length} catégorie
            {categoriesBreakdown.length > 1 ? "s" : ""} utilisée
            {categoriesBreakdown.length > 1 ? "s" : ""}
          </p>
        </div>

        {categoriesBreakdown.length === 0 ? (
          <p className="py-6 text-center text-xs text-slate-400">
            Aucune catégorie pour le moment
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {categoriesBreakdown.map((cat, i) => {
              const maxCount = categoriesBreakdown[0].count || 1;
              const pct = (cat.count / maxCount) * 100;
              const hue = (i * 360) / categoriesBreakdown.length;
              return (
                <div
                  key={cat.name}
                  className="rounded-xl border border-slate-100 bg-slate-50/50 p-3 transition hover:border-emerald-200 hover:bg-emerald-50/30"
                >
                  <div className="mb-2 flex items-center justify-between text-xs font-bold">
                    <span className="truncate text-slate-700">{cat.name}</span>
                    <span
                      className="rounded-md px-2 py-0.5 text-[10px] font-extrabold text-white"
                      style={{ background: `hsl(${hue}, 70%, 55%)` }}
                    >
                      {cat.count}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${pct}%`,
                        background: `hsl(${hue}, 70%, 55%)`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ═══════════════════════════════════════════
          HISTORIQUE DES ANNONCES (design précédent restauré)
          ═══════════════════════════════════════════ */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="mt-1 text-xl font-extrabold text-slate-900">
              Historique des annonces
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Toutes vos annonces, passées et présentes — {announcements.length}{" "}
              au total
            </p>
          </div>
        </div>

        {/* Filtres */}
        {announcements.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {(
              [
                { value: "ALL", label: "Toutes", count: announcements.length },
                { value: "OPEN", label: "Publiées", count: publishedCount },
                {
                  value: "IN_PROGRESS",
                  label: "En cours",
                  count: inProgressCount,
                },
                { value: "CLOSED", label: "Clôturées", count: closedCount },
              ] as const
            ).map((f) => {
              const isActive = historyFilter === f.value;
              return (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => setHistoryFilter(f.value)}
                  className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                    isActive
                      ? "bg-slate-900 text-white shadow-sm"
                      : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {f.label}
                  <span
                    className={`rounded-md px-1.5 py-0.5 text-[10px] font-extrabold ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {f.count}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="flex items-center justify-between gap-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
          >
            <p>{error}</p>
            {!announcements.length && (
              <button
                onClick={() => void loadAnnouncements()}
                className="shrink-0 font-bold underline"
              >
                Réessayer
              </button>
            )}
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center gap-3 rounded-3xl border border-slate-100 bg-white py-16 text-sm font-semibold text-slate-500">
            <LoaderCircle className="h-5 w-5 animate-spin text-emerald-600" />
            Chargement de vos annonces...
          </div>
        ) : announcements.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
              <BriefcaseBusiness className="h-5 w-5" />
            </div>
            <h3 className="mt-4 font-bold text-slate-900">
              Vous n&apos;avez pas encore d&apos;annonce
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Publiez une offre ou une demande pour la retrouver ici.
            </p>
            <Link
              href="/acteur/annonces/nouvelle"
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-700"
            >
              <Plus className="h-4 w-4" />
              Créer une annonce
            </Link>
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center">
            <p className="text-sm font-semibold text-slate-500">
              Aucune annonce dans cette catégorie
            </p>
            <button
              onClick={() => setHistoryFilter("ALL")}
              className="mt-3 text-xs font-bold text-emerald-600 hover:underline"
            >
              Voir toutes les annonces
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            {filteredHistory.map((announcement) => {
              const isEditing = editingId === announcement.id;
              const isDeleting = deletingId === announcement.id;
              const statusLabel =
                statusLabels[announcement.status] || announcement.status;

              return (
                <article
                  key={announcement.id}
                  className="rounded-[24px] border border-slate-100 bg-white p-5 shadow-[0_4px_20px_-8px_rgba(15,23,42,0.06)] transition-all duration-300 hover:border-emerald-200 hover:shadow-lg"
                >
                  <div className="flex flex-col justify-between gap-4 sm:flex-row">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold ${
                            announcement.type === "OFFRE"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          {announcement.type}
                        </span>
                        <span
                          className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
                            announcement.status === "OPEN"
                              ? "bg-emerald-50 text-emerald-700"
                              : announcement.status === "IN_PROGRESS"
                                ? "bg-blue-50 text-blue-700"
                                : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {statusLabel}
                        </span>
                        <span className="text-[11px] font-medium text-slate-400">
                          {formatDate(announcement.createdAt)}
                        </span>
                      </div>
                      <h3 className="mt-3 text-lg font-extrabold text-slate-900">
                        {announcement.title}
                      </h3>
                      <p className="mt-1 text-xs font-bold text-emerald-700">
                        {announcement.category}
                      </p>
                      <p className="mt-3 line-clamp-3 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                        {announcement.description}
                      </p>
                      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-500">
                        {announcement.specificLocation && (
                          <span className="inline-flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5" />
                            {announcement.specificLocation}
                          </span>
                        )}
                        {announcement.deadline && (
                          <span className="inline-flex items-center gap-1.5">
                            <CalendarDays className="h-3.5 w-3.5" />
                            Échéance : {formatDate(announcement.deadline)}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex shrink-0 items-start gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          isEditing
                            ? setEditingId(null)
                            : beginEditing(announcement)
                        }
                        aria-label={
                          isEditing ? "Annuler la modification" : "Modifier"
                        }
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 transition hover:border-emerald-300 hover:text-emerald-700"
                      >
                        {isEditing ? (
                          <X className="h-4 w-4" />
                        ) : (
                          <Pencil className="h-4 w-4" />
                        )}
                        {isEditing ? "Annuler" : "Modifier"}
                      </button>
                      <button
                        type="button"
                        onClick={() => void deleteAnnouncement(announcement)}
                        disabled={isDeleting}
                        aria-label="Supprimer l'annonce"
                        className="inline-flex items-center gap-2 rounded-xl border border-rose-100 px-3 py-2 text-xs font-bold text-rose-600 transition hover:bg-rose-50 disabled:opacity-50"
                      >
                        {isDeleting ? (
                          <LoaderCircle className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                        Supprimer
                      </button>
                    </div>
                  </div>

                  {isEditing && (
                    <form
                      onSubmit={saveAnnouncement}
                      className="mt-6 space-y-4 border-t border-slate-100 pt-5"
                    >
                      <div className="grid gap-4 sm:grid-cols-2">
                        <label className="space-y-1.5 text-xs font-bold text-slate-700">
                          Type d&apos;annonce
                          <select
                            value={form.type}
                            onChange={(event) =>
                              setForm((current) => ({
                                ...current,
                                type: event.target.value as AnnouncementType,
                              }))
                            }
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium"
                          >
                            <option value="OFFRE">Offre</option>
                            <option value="DEMANDE">Demande</option>
                          </select>
                        </label>
                        <label className="space-y-1.5 text-xs font-bold text-slate-700">
                          Catégorie
                          <input
                            required
                            value={form.category}
                            onChange={(event) =>
                              setForm((current) => ({
                                ...current,
                                category: event.target.value,
                              }))
                            }
                            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-medium"
                          />
                        </label>
                      </div>
                      <label className="block space-y-1.5 text-xs font-bold text-slate-700">
                        Titre
                        <input
                          required
                          value={form.title}
                          onChange={(event) =>
                            setForm((current) => ({
                              ...current,
                              title: event.target.value,
                            }))
                          }
                          className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-medium"
                        />
                      </label>
                      <label className="block space-y-1.5 text-xs font-bold text-slate-700">
                        Description
                        <textarea
                          required
                          rows={4}
                          value={form.description}
                          onChange={(event) =>
                            setForm((current) => ({
                              ...current,
                              description: event.target.value,
                            }))
                          }
                          className="w-full resize-y rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-medium"
                        />
                      </label>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <label className="space-y-1.5 text-xs font-bold text-slate-700">
                          Localisation
                          <input
                            value={form.specificLocation}
                            onChange={(event) =>
                              setForm((current) => ({
                                ...current,
                                specificLocation: event.target.value,
                              }))
                            }
                            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-medium"
                          />
                        </label>
                        <label className="space-y-1.5 text-xs font-bold text-slate-700">
                          Date limite
                          <input
                            type="date"
                            value={form.deadline}
                            onChange={(event) =>
                              setForm((current) => ({
                                ...current,
                                deadline: event.target.value,
                              }))
                            }
                            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-medium"
                          />
                        </label>
                      </div>
                      <div className="flex justify-end">
                        <button
                          type="submit"
                          disabled={isSaving}
                          className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-emerald-700 disabled:opacity-60"
                        >
                          {isSaving ? (
                            <LoaderCircle className="h-4 w-4 animate-spin" />
                          ) : (
                            <Save className="h-4 w-4" />
                          )}
                          Enregistrer
                        </button>
                      </div>
                    </form>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
