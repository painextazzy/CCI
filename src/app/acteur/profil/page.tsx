"use client";

import { useCallback, useEffect, useState } from "react";
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

export default function ActorProfilePage() {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<AnnouncementForm>(emptyForm);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

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
        current.map((announcement) =>
          announcement.id === updated.id ? updated : announcement,
        ),
      );
      setEditingId(null);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "La modification a échoué.",
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

  const publishedCount = announcements.filter(
    (announcement) => announcement.status === "OPEN",
  ).length;
  const inProgressCount = announcements.filter(
    (announcement) => announcement.status === "IN_PROGRESS",
  ).length;
  const closedCount = announcements.filter(
    (announcement) => announcement.status === "CLOSED",
  ).length;
  const companyName = user?.company?.companyName || "Mon entreprise";

  return (
    <div className="mx-auto max-w-5xl space-y-8 py-4">
      <section className="overflow-hidden rounded-3xl border border-emerald-100 bg-white shadow-sm">
        <div className="bg-linear-to-r from-emerald-700 to-teal-600 px-6 py-8 text-white sm:px-9">
          <div className="flex items-center gap-3 text-emerald-100">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15">
              <BriefcaseBusiness className="h-5 w-5" />
            </div>
            <span className="text-xs font-bold uppercase tracking-[0.18em]">
              Espace entreprise
            </span>
          </div>
          <h1 className="mt-5 text-2xl font-extrabold sm:text-3xl">
            Bonjour, {companyName}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-emerald-50">
            Retrouvez les statistiques de vos annonces et gérez leur contenu
            depuis votre profil.
          </p>
          <p className="mt-3 text-xs text-emerald-100">{user?.email}</p>
        </div>

        <div className="grid grid-cols-2 divide-x divide-y divide-slate-100 sm:grid-cols-4 sm:divide-y-0">
          {[
            {
              label: "Toutes les annonces",
              value: announcements.length,
              icon: BarChart3,
              color: "text-slate-700",
            },
            {
              label: "Publiées",
              value: publishedCount,
              icon: Check,
              color: "text-emerald-600",
            },
            {
              label: "En cours",
              value: inProgressCount,
              icon: Clock3,
              color: "text-amber-600",
            },
            {
              label: "Clôturées",
              value: closedCount,
              icon: CalendarDays,
              color: "text-slate-500",
            },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="flex items-center gap-3 px-5 py-5">
              <div className={`rounded-xl bg-slate-50 p-2.5 ${color}`}>
                <Icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xl font-extrabold text-slate-900">{value}</p>
                <p className="text-[11px] font-semibold text-slate-500">
                  {label}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">
              Gestion des annonces
            </p>
            <h2 className="mt-1 text-xl font-extrabold text-slate-900">
              Mes annonces
            </h2>
          </div>
          <Link
            href="/acteur/annonces/nouvelle"
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-700"
          >
            <Plus className="h-4 w-4" />
            Nouvelle annonce
          </Link>
        </div>

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
              Vous n’avez pas encore d’annonce
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
        ) : (
          <div className="space-y-4">
            {announcements.map((announcement) => {
              const isEditing = editingId === announcement.id;
              const isDeleting = deletingId === announcement.id;
              const statusLabel =
                statusLabels[announcement.status] || announcement.status;

              return (
                <article
                  key={announcement.id}
                  className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6"
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
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-600">
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
                      <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-600">
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
                        aria-label="Supprimer l’annonce"
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
                          Type d’annonce
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
