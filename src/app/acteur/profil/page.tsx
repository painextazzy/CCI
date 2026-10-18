"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import {
  BriefcaseBusiness,
  CalendarDays,
  LoaderCircle,
  MapPin,
  Pencil,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react";
import Link from "next/link";
import { getApiRoot } from "../../lib/auth";
import { useAuth } from "../../providers/AuthProvider";

// ─────────────────────────────────────────────────────────
// Types & constantes
// ─────────────────────────────────────────────────────────
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

type ContractRecord = {
  id: string;
  reference: string;
  status: "ACCEPTED";
  title: string;
  description: string;
  amount: string;
  startDate: string;
  endDate: string;
  senderCompanyName: string;
  receiverCompanyName: string;
  senderCompanyId: string;
  receiverCompanyId: string;
  receiverSignerName: string;
  acceptedAt: string;
};

const EMPTY_FORM: AnnouncementForm = {
  type: "OFFRE",
  title: "",
  category: "",
  description: "",
  specificLocation: "",
  deadline: "",
};

const STATUS_LABELS: Record<AnnouncementStatus, string> = {
  OPEN: "Publiée",
  IN_PROGRESS: "En cours",
  CLOSED: "Clôturée",
};

// ─────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────
const toDateInput = (date?: string | null) => {
  if (!date) return "";
  const d = new Date(date);
  return Number.isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 10);
};

const formatDate = (date: string) => {
  const d = new Date(date);
  return Number.isNaN(d.getTime())
    ? "Date inconnue"
    : new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" }).format(d);
};

// ─────────────────────────────────────────────────────────
// 📈 Courbe multi-lignes
// ─────────────────────────────────────────────────────────
function LineChart({
  data,
}: {
  data: { label: string; total: number; offres: number; demandes: number }[];
}) {
  const W = 900,
    H = 300,
    P = { top: 30, right: 30, bottom: 50, left: 40 };
  const iW = W - P.left - P.right;
  const iH = H - P.top - P.bottom;
  const max = Math.max(
    ...data.map((d) => Math.max(d.total, d.offres, d.demandes)),
    1,
  );

  const makePts = (k: "total" | "offres" | "demandes") =>
    data.map((d, i) => ({
      x: P.left + (i / Math.max(data.length - 1, 1)) * iW,
      y: P.top + iH - (d[k] / max) * iH,
      v: d[k],
      l: d.label,
    }));

  const total = makePts("total");
  const offres = makePts("offres");
  const demandes = makePts("demandes");

  const path = (pts: { x: number; y: number }[]) =>
    pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

  return (
    <div className="w-full">
      <div className="mb-4 flex flex-wrap items-center justify-end gap-5">
        {[
          { c: "bg-emerald-600", l: "Total" },
          { c: "bg-emerald-500", l: "Offres" },
          { c: "bg-amber-500", l: "Demandes" },
        ].map(({ c, l }) => (
          <div key={l} className="flex items-center gap-2">
            <span className={`h-2.5 w-2.5 rounded-full ${c}`} />
            <span className="text-[11px] font-bold text-slate-600">{l}</span>
          </div>
        ))}
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        style={{ maxHeight: 320 }}
      >
        <defs>
          <linearGradient id="area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2EA043" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#2EA043" stopOpacity="0" />
          </linearGradient>
        </defs>

        {Array.from({ length: 5 }).map((_, i) => {
          const y = P.top + (i / 4) * iH;
          return (
            <g key={i}>
              <line
                x1={P.left}
                y1={y}
                x2={W - P.right}
                y2={y}
                stroke="#f1f5f9"
                strokeWidth="1"
                strokeDasharray={i === 4 ? "0" : "4 4"}
              />
              <text
                x={P.left - 8}
                y={y + 4}
                textAnchor="end"
                fontSize="10"
                fill="#94a3b8"
                fontWeight="600"
              >
                {Math.round(max * (1 - i / 4))}
              </text>
            </g>
          );
        })}

        <path
          d={`${path(total)} L ${total[total.length - 1]?.x ?? 0} ${
            P.top + iH
          } L ${total[0]?.x ?? 0} ${P.top + iH} Z`}
          fill="url(#area)"
        />
        <path
          d={path(total)}
          fill="none"
          stroke="#2EA043"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d={path(offres)}
          fill="none"
          stroke="#10b981"
          strokeWidth="2.5"
          strokeDasharray="6 3"
          strokeLinecap="round"
        />
        <path
          d={path(demandes)}
          fill="none"
          stroke="#f59e0b"
          strokeWidth="2.5"
          strokeDasharray="6 3"
          strokeLinecap="round"
        />

        {total.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="6" fill="white" />
            <circle cx={p.x} cy={p.y} r="4" fill="#2EA043" />
            <text
              x={p.x}
              y={p.y - 12}
              textAnchor="middle"
              fontSize="11"
              fontWeight="800"
              fill="#2EA043"
            >
              {p.v}
            </text>
            <text
              x={p.x}
              y={H - 20}
              textAnchor="middle"
              fontSize="11"
              fontWeight="700"
              fill="#64748b"
            >
              {p.l}
            </text>
          </g>
        ))}

        {[...offres, ...demandes].map((p, i) => (
          <g key={`d-${i}`}>
            <circle cx={p.x} cy={p.y} r="4" fill="white" />
            <circle
              cx={p.x}
              cy={p.y}
              r="3"
              fill={i < offres.length ? "#10b981" : "#f59e0b"}
            />
          </g>
        ))}
      </svg>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// 📈 Courbe contrats
// ─────────────────────────────────────────────────────────
function ContractLineChart({
  data,
}: {
  data: { label: string; total: number }[];
}) {
  const width = 900;
  const height = 250;
  const padding = { top: 24, right: 24, bottom: 42, left: 42 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const maximum = Math.max(...data.map((item) => item.total), 1);
  const points = data.map((item, index) => ({
    ...item,
    x: padding.left + (index / Math.max(data.length - 1, 1)) * chartWidth,
    y: padding.top + chartHeight - (item.total / maximum) * chartHeight,
  }));
  const linePath = points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");

  return (
    <div className="w-full">
      <div className="mb-3 flex items-center justify-end gap-2 text-[11px] font-semibold text-slate-600">
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-600" />
        Contrats acceptés
      </div>
      <svg
        role="img"
        aria-label="Évolution mensuelle des contrats acceptés sur les six derniers mois"
        viewBox={`0 0 ${width} ${height}`}
        className="w-full"
      >
        {Array.from({ length: 5 }, (_, index) => {
          const y = padding.top + (index / 4) * chartHeight;
          return (
            <g key={index}>
              <line
                x1={padding.left}
                y1={y}
                x2={width - padding.right}
                y2={y}
                stroke="#e2e8f0"
                strokeDasharray={index === 4 ? undefined : "4 4"}
              />
              <text
                x={padding.left - 9}
                y={y + 4}
                textAnchor="end"
                fontSize="10"
                fill="#94a3b8"
              >
                {Math.round(maximum * (1 - index / 4))}
              </text>
            </g>
          );
        })}
        <path
          d={linePath}
          fill="none"
          stroke="#059669"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {points.map((point) => (
          <g key={point.label}>
            <circle cx={point.x} cy={point.y} r="5" fill="#059669" />
            <text
              x={point.x}
              y={point.y - 12}
              textAnchor="middle"
              fontSize="11"
              fontWeight="700"
              fill="#047857"
            >
              {point.total}
            </text>
            <text
              x={point.x}
              y={height - 14}
              textAnchor="middle"
              fontSize="10"
              fontWeight="600"
              fill="#64748b"
            >
              {point.label}
            </text>
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
  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="w-full">
      <div className="relative flex items-end justify-around gap-2 rounded-2xl bg-[#FAFAFA] border border-[#F2F2F2] p-4 h-[240px]">
        {data.map((item) => {
          const hPct = (item.value / max) * 100;
          return (
            <div
              key={item.label}
              className="group relative flex h-full flex-1 flex-col items-center justify-end"
            >
              <span className="mb-1.5 text-sm font-extrabold text-slate-900">
                {item.value}
              </span>
              <div
                className="w-full max-w-[70px] rounded-t-xl transition-all duration-700 group-hover:brightness-110"
                style={{
                  height: item.value === 0 ? "4px" : `${Math.max(hPct, 4)}%`,
                  background: `linear-gradient(180deg, ${item.color}, ${item.color}dd)`,
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
  const S = 200,
    SW = 28,
    R = (S - SW) / 2,
    C = 2 * Math.PI * R;
  const oP = total > 0 ? offre / total : 0;
  const dP = total > 0 ? demande / total : 0;

  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row sm:justify-center">
      <div className="relative shrink-0">
        <svg
          width={S}
          height={S}
          viewBox={`0 0 ${S} ${S}`}
          className="-rotate-90"
        >
          <circle
            cx={S / 2}
            cy={S / 2}
            r={R}
            fill="none"
            stroke="#f1f5f9"
            strokeWidth={SW}
          />
          {total > 0 && (
            <circle
              cx={S / 2}
              cy={S / 2}
              r={R}
              fill="none"
              stroke="#2EA043"
              strokeWidth={SW}
              strokeDasharray={`${oP * C} ${C - oP * C}`}
              strokeLinecap="round"
            />
          )}
          {total > 0 && (
            <circle
              cx={S / 2}
              cy={S / 2}
              r={R}
              fill="none"
              stroke="#f59e0b"
              strokeWidth={SW}
              strokeDasharray={`${dP * C} ${C - dP * C}`}
              strokeDashoffset={-oP * C}
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
        {[
          { l: "Offres", v: offre, p: oP, c: "emerald" },
          { l: "Demandes", v: demande, p: dP, c: "amber" },
        ].map(({ l, v, p, c }) => (
          <div
            key={l}
            className={`flex items-center gap-3 rounded-xl bg-${c}-50 px-4 py-2.5 border border-[#F2F2F2]`}
          >
            <span className={`h-3 w-3 shrink-0 rounded-full bg-${c}-500`} />
            <div>
              <p className={`text-xs font-bold text-${c}-700`}>{l}</p>
              <p className="text-lg font-extrabold text-slate-900 leading-none">
                {v}
                <span className="ml-1 text-xs font-semibold text-slate-400">
                  ({total > 0 ? Math.round(p * 100) : 0}%)
                </span>
              </p>
            </div>
          </div>
        ))}
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
  const [contracts, setContracts] = useState<ContractRecord[]>([]);
  const [isLoadingContracts, setIsLoadingContracts] = useState(true);
  const [contractsError, setContractsError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<AnnouncementForm>(EMPTY_FORM);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"ALL" | AnnouncementStatus>("ALL");

  // Chargement annonces
  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const r = await fetch(`${getApiRoot()}/announcements/mine`, {
        credentials: "include",
        cache: "no-store",
      });
      if (!r.ok)
        throw new Error((await r.json()).message || "Erreur de chargement");
      setAnnouncements(await r.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur de chargement");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  // Chargement contrats
  useEffect(() => {
    if (!user?.company?.id) return;
    let active = true;

    async function loadContracts() {
      setIsLoadingContracts(true);
      setContractsError(null);
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
            result?.message ||
              "Impossible de charger l'historique des contrats.",
          );
        }
        const result = (await response.json()) as ContractRecord[];
        if (active) setContracts(Array.isArray(result) ? result : []);
      } catch (cause) {
        if (active) {
          setContractsError(
            cause instanceof Error
              ? cause.message
              : "Impossible de charger l'historique des contrats.",
          );
        }
      } finally {
        if (active) setIsLoadingContracts(false);
      }
    }

    void loadContracts();
    return () => {
      active = false;
    };
  }, [user?.company?.id]);

  // Édition
  const startEdit = (a: Announcement) => {
    setEditingId(a.id);
    setForm({
      type: a.type,
      title: a.title,
      category: a.category,
      description: a.description,
      specificLocation: a.specificLocation || "",
      deadline: toDateInput(a.deadline),
    });
  };

  const save = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingId) return;
    setIsSaving(true);
    try {
      const r = await fetch(`${getApiRoot()}/announcements/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...form,
          specificLocation: form.specificLocation || null,
          deadline: form.deadline
            ? new Date(form.deadline).toISOString()
            : null,
        }),
      });
      if (!r.ok) throw new Error((await r.json()).message || "Échec");
      const updated = await r.json();
      setAnnouncements((prev) =>
        prev.map((a) => (a.id === updated.id ? updated : a)),
      );
      setEditingId(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Échec");
    } finally {
      setIsSaving(false);
    }
  };

  // Suppression
  const remove = async (a: Announcement) => {
    if (!window.confirm(`Supprimer « ${a.title} » ?`)) return;
    setDeletingId(a.id);
    try {
      const r = await fetch(`${getApiRoot()}/announcements/${a.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!r.ok) throw new Error((await r.json()).message || "Échec");
      setAnnouncements((prev) => prev.filter((x) => x.id !== a.id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Échec");
    } finally {
      setDeletingId(null);
    }
  };

  // Stats
  const stats = useMemo(() => {
    const byStatus = (s: AnnouncementStatus) =>
      announcements.filter((a) => a.status === s).length;
    const byType = (t: AnnouncementType) =>
      announcements.filter((a) => a.type === t).length;
    return {
      total: announcements.length,
      published: byStatus("OPEN"),
      inProgress: byStatus("IN_PROGRESS"),
      closed: byStatus("CLOSED"),
      offres: byType("OFFRE"),
      demandes: byType("DEMANDE"),
    };
  }, [announcements]);

  // Évolution annonces 6 mois
  const evolution = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 6 }, (_, idx) => {
      const i = 5 - idx;
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const month = announcements.filter((a) => {
        const c = new Date(a.createdAt);
        return (
          c.getFullYear() === d.getFullYear() && c.getMonth() === d.getMonth()
        );
      });
      const label = d
        .toLocaleDateString("fr-FR", { month: "short" })
        .replace(".", "");
      return {
        label: label.charAt(0).toUpperCase() + label.slice(1),
        total: month.length,
        offres: month.filter((a) => a.type === "OFFRE").length,
        demandes: month.filter((a) => a.type === "DEMANDE").length,
      };
    });
  }, [announcements]);

  // Évolution contrats 6 mois
  const contractEvolution = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 6 }, (_, index) => {
      const monthDate = new Date(
        now.getFullYear(),
        now.getMonth() - 5 + index,
        1,
      );
      const label = monthDate
        .toLocaleDateString("fr-FR", { month: "short" })
        .replace(".", "");
      return {
        label: label.charAt(0).toUpperCase() + label.slice(1),
        total: contracts.filter((contract) => {
          const acceptedDate = new Date(contract.acceptedAt);
          return (
            acceptedDate.getFullYear() === monthDate.getFullYear() &&
            acceptedDate.getMonth() === monthDate.getMonth()
          );
        }).length,
      };
    });
  }, [contracts]);

  // Historique filtré
  const history = useMemo(() => {
    const sorted = [...announcements].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
    return filter === "ALL"
      ? sorted
      : sorted.filter((a) => a.status === filter);
  }, [announcements, filter]);

  const barData = [
    { label: "Publiées", value: stats.published, color: "#2EA043" },
    { label: "En cours", value: stats.inProgress, color: "#f59e0b" },
    { label: "Clôturées", value: stats.closed, color: "#64748b" },
  ];

  const filters = [
    { value: "ALL" as const, label: "Toutes", count: stats.total },
    { value: "OPEN" as const, label: "Publiées", count: stats.published },
    {
      value: "IN_PROGRESS" as const,
      label: "En cours",
      count: stats.inProgress,
    },
    { value: "CLOSED" as const, label: "Clôturées", count: stats.closed },
  ];

  return (
    <div className="w-full space-y-6 py-4 px-4 sm:px-6 lg:px-8">
      {/* Évolution des annonces */}
      <section
        data-actor-card
        className="rounded-3xl border border-[#F2F2F2] bg-white p-6"
      >
        <div className="mb-5">
          <h2 className="text-sm font-extrabold text-slate-900">
            Évolution de vos annonces
          </h2>
          <p className="mt-0.5 text-[11px] text-slate-500">
            Comparaison Offres / Demandes sur les 6 derniers mois
          </p>
        </div>
        <LineChart data={evolution} />
      </section>

      {/* Barres + Donut */}
      <section className="grid gap-5 lg:grid-cols-5">
        <div
          data-actor-card
          className="lg:col-span-3 rounded-3xl border border-[#F2F2F2] bg-white p-6"
        >
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
        <div
          data-actor-card
          className="lg:col-span-2 rounded-3xl border border-[#F2F2F2] bg-white p-6"
        >
          <div className="mb-5">
            <h2 className="text-sm font-extrabold text-slate-900">
              Offres vs Demandes
            </h2>
            <p className="mt-0.5 text-[11px] text-slate-500">
              Répartition globale
            </p>
          </div>
          <DonutChart offre={stats.offres} demande={stats.demandes} />
        </div>
      </section>

      {/* Évolution des contrats + Suivi */}
      <section className="grid gap-5 lg:grid-cols-5">
        <div
          data-actor-card
          className="rounded-3xl border border-[#F2F2F2] bg-white p-6 lg:col-span-3"
        >
          <div className="mb-5">
            <h2 className="text-sm font-extrabold text-slate-900">
              Évolution des contrats
            </h2>
            <p className="mt-0.5 text-[11px] text-slate-500">
              Contrats acceptés au cours des six derniers mois
            </p>
          </div>
          {isLoadingContracts ? (
            <div className="flex h-48 items-center justify-center gap-2 text-xs font-medium text-slate-500">
              <LoaderCircle className="h-4 w-4 animate-spin text-emerald-600" />
              Chargement des contrats...
            </div>
          ) : contractsError ? (
            <p role="alert" className="py-16 text-center text-xs text-rose-600">
              {contractsError}
            </p>
          ) : (
            <>
              <ContractLineChart data={contractEvolution} />
              {contracts.length === 0 && (
                <p className="mt-2 text-center text-xs text-slate-500">
                  Aucun contrat accepté à afficher pour le moment.
                </p>
              )}
            </>
          )}
        </div>
        <div
          data-actor-card
          className="rounded-3xl border border-[#F2F2F2] bg-white p-6 lg:col-span-2"
        >
          <div className="mb-5">
            <h2 className="text-sm font-extrabold text-slate-900">
              Suivi contractuel
            </h2>
            <p className="mt-0.5 text-[11px] text-slate-500">
              Vue d'ensemble de vos engagements acceptés
            </p>
          </div>
          <p className="text-4xl font-extrabold text-emerald-700">
            {contracts.length}
          </p>
          <p className="mt-1 text-xs font-semibold text-slate-500">
            contrat{contracts.length === 1 ? "" : "s"} enregistré
            {contracts.length === 1 ? "" : "s"}
          </p>
          {contracts[0] && (
            <div className="mt-5 border-t border-slate-100 pt-4">
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                Dernier contrat
              </p>
              <p className="mt-1 truncate text-sm font-bold text-slate-800">
                {contracts[0].title}
              </p>
              {contracts[0].description && (
                <div className="mt-3">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                    Objet du partenariat
                  </p>
                  <p className="mt-1 line-clamp-3 whitespace-pre-wrap text-xs leading-5 text-slate-600">
                    {contracts[0].description}
                  </p>
                </div>
              )}
              {(contracts[0].startDate || contracts[0].endDate) && (
                <p className="mt-3 text-xs text-slate-500">
                  Période :{" "}
                  {contracts[0].startDate
                    ? formatDate(contracts[0].startDate)
                    : "Date de début non renseignée"}
                  {" – "}
                  {contracts[0].endDate
                    ? formatDate(contracts[0].endDate)
                    : "Date de fin non renseignée"}
                </p>
              )}
              <p className="mt-1 text-xs text-slate-500">
                Accepté le {formatDate(contracts[0].acceptedAt)}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ❌ SECTION "Historique des contrats" SUPPRIMÉE */}

      {/* Historique des annonces */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900">
            Historique des annonces
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Toutes vos annonces, passées et présentes — {stats.total} au total
          </p>
        </div>

        {announcements.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {filters.map((f) => {
              const active = filter === f.value;
              return (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => setFilter(f.value)}
                  className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition-colors ${
                    active
                      ? "bg-[#2EA043] text-white border border-[#2EA043]"
                      : "border border-[#F2F2F2] bg-white text-slate-600 hover:bg-[#FAFAFA]"
                  }`}
                >
                  {f.label}
                  <span
                    className={`rounded-md px-1.5 py-0.5 text-[10px] font-extrabold ${
                      active
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
            className="flex items-center justify-between gap-4 rounded-2xl border border-[#F2F2F2] bg-rose-50 px-4 py-3 text-sm text-rose-700"
          >
            <p>{error}</p>
            {!announcements.length && (
              <button
                onClick={() => void load()}
                className="shrink-0 font-bold underline"
              >
                Réessayer
              </button>
            )}
          </div>
        )}

        {isLoading ? (
          <div
            data-actor-card
            className="flex items-center justify-center gap-3 rounded-3xl border border-[#F2F2F2] bg-white py-16 text-sm font-semibold text-slate-500"
          >
            <LoaderCircle className="h-5 w-5 animate-spin text-emerald-600" />
            Chargement de vos annonces...
          </div>
        ) : announcements.length === 0 ? (
          <div
            data-actor-card
            className="rounded-3xl border border-dashed border-[#F2F2F2] bg-white px-6 py-14 text-center"
          >
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
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Créer une annonce
            </Link>
          </div>
        ) : history.length === 0 ? (
          <div
            data-actor-card
            className="rounded-3xl border border-dashed border-[#F2F2F2] bg-white px-6 py-10 text-center"
          >
            <p className="text-sm font-semibold text-slate-500">
              Aucune annonce dans cette catégorie
            </p>
            <button
              onClick={() => setFilter("ALL")}
              className="mt-3 text-xs font-bold text-emerald-600 hover:underline"
            >
              Voir toutes les annonces
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            {history.map((a) => {
              const isEditing = editingId === a.id;
              const isDeleting = deletingId === a.id;

              return (
                <article
                  key={a.id}
                  className="rounded-[24px] border border-[#F2F2F2] bg-white p-5 transition-colors hover:border-[#6FCF97]"
                >
                  <div className="flex flex-col justify-between gap-4 sm:flex-row">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold border ${
                            a.type === "OFFRE"
                              ? "bg-emerald-50 text-emerald-700 border-[#6FCF97]"
                              : "bg-amber-50 text-amber-700 border-[#F2F2F2]"
                          }`}
                        >
                          {a.type}
                        </span>
                        <span
                          className={`rounded-full px-2.5 py-1 text-[10px] font-bold border ${
                            a.status === "OPEN"
                              ? "bg-emerald-50 text-emerald-700 border-[#6FCF97]"
                              : a.status === "IN_PROGRESS"
                                ? "bg-blue-50 text-blue-700 border-[#F2F2F2]"
                                : "bg-slate-100 text-slate-600 border-[#F2F2F2]"
                          }`}
                        >
                          {STATUS_LABELS[a.status]}
                        </span>
                        <span className="text-[11px] font-medium text-slate-400">
                          {formatDate(a.createdAt)}
                        </span>
                      </div>
                      <h3 className="mt-3 text-lg font-extrabold text-slate-900">
                        {a.title}
                      </h3>
                      <p className="mt-1 text-xs font-bold text-emerald-700">
                        {a.category}
                      </p>
                      <p className="mt-3 line-clamp-3 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                        {a.description}
                      </p>
                      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-500">
                        {a.specificLocation && (
                          <span className="inline-flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5" />
                            {a.specificLocation}
                          </span>
                        )}
                        {a.deadline && (
                          <span className="inline-flex items-center gap-1.5">
                            <CalendarDays className="h-3.5 w-3.5" />
                            Échéance : {formatDate(a.deadline)}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex shrink-0 items-start gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          isEditing ? setEditingId(null) : startEdit(a)
                        }
                        className="inline-flex items-center gap-2 rounded-xl border border-[#F2F2F2] px-3 py-2 text-xs font-bold text-slate-700 transition-colors hover:border-[#6FCF97] hover:text-emerald-700"
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
                        onClick={() => void remove(a)}
                        disabled={isDeleting}
                        className="inline-flex items-center gap-2 rounded-xl border border-[#F2F2F2] px-3 py-2 text-xs font-bold text-rose-600 transition-colors hover:bg-rose-50 disabled:opacity-50"
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
                      onSubmit={save}
                      className="mt-6 space-y-4 border-t border-[#F2F2F2] pt-5"
                    >
                      <div className="grid gap-4 sm:grid-cols-2">
                        <label className="space-y-1.5 text-xs font-bold text-slate-700">
                          Type d&apos;annonce
                          <select
                            value={form.type}
                            onChange={(e) =>
                              setForm({
                                ...form,
                                type: e.target.value as AnnouncementType,
                              })
                            }
                            className="w-full rounded-xl border border-[#F2F2F2] bg-[#FAFAFA] px-3 py-2.5 text-sm font-medium focus:outline-none focus:bg-white focus:border-[#6FCF97]"
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
                            onChange={(e) =>
                              setForm({ ...form, category: e.target.value })
                            }
                            className="w-full rounded-xl border border-[#F2F2F2] bg-[#FAFAFA] px-3 py-2.5 text-sm font-medium focus:outline-none focus:bg-white focus:border-[#6FCF97]"
                          />
                        </label>
                      </div>
                      <label className="block space-y-1.5 text-xs font-bold text-slate-700">
                        Titre
                        <input
                          required
                          value={form.title}
                          onChange={(e) =>
                            setForm({ ...form, title: e.target.value })
                          }
                          className="w-full rounded-xl border border-[#F2F2F2] bg-[#FAFAFA] px-3 py-2.5 text-sm font-medium focus:outline-none focus:bg-white focus:border-[#6FCF97]"
                        />
                      </label>
                      <label className="block space-y-1.5 text-xs font-bold text-slate-700">
                        Description
                        <textarea
                          required
                          rows={4}
                          value={form.description}
                          onChange={(e) =>
                            setForm({ ...form, description: e.target.value })
                          }
                          className="w-full resize-y rounded-xl border border-[#F2F2F2] bg-[#FAFAFA] px-3 py-2.5 text-sm font-medium focus:outline-none focus:bg-white focus:border-[#6FCF97]"
                        />
                      </label>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <label className="space-y-1.5 text-xs font-bold text-slate-700">
                          Localisation
                          <input
                            value={form.specificLocation}
                            onChange={(e) =>
                              setForm({
                                ...form,
                                specificLocation: e.target.value,
                              })
                            }
                            className="w-full rounded-xl border border-[#F2F2F2] bg-[#FAFAFA] px-3 py-2.5 text-sm font-medium focus:outline-none focus:bg-white focus:border-[#6FCF97]"
                          />
                        </label>
                        <label className="space-y-1.5 text-xs font-bold text-slate-700">
                          Date limite
                          <input
                            type="date"
                            value={form.deadline}
                            onChange={(e) =>
                              setForm({ ...form, deadline: e.target.value })
                            }
                            className="w-full rounded-xl border border-[#F2F2F2] bg-[#FAFAFA] px-3 py-2.5 text-sm font-medium focus:outline-none focus:bg-white focus:border-[#6FCF97]"
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
