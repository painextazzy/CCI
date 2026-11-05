"use client";

import { useEffect, useState } from "react";
import { CalendarDays, Eye, MapPin, X } from "lucide-react";
import { getApiRoot } from "../../lib/auth";
import LoadingSkeleton from "../../components/LoadingSkeleton";

type Announcement = {
  id: string;
  type: "OFFRE" | "DEMANDE";
  title: string;
  category: string;
  description: string;
  status: "OPEN" | "IN_PROGRESS" | "CLOSED";
  specificLocation?: string | null;
  deadline?: string | null;
  createdAt: string;
  company?: {
    companyName?: string;
    sector?: string;
    address?: string;
    phone?: string;
    website?: string | null;
  } | null;
};

const statusLabels: Record<Announcement["status"], string> = {
  OPEN: "Ouverte",
  IN_PROGRESS: "En discussion",
  CLOSED: "Clôturée",
};

function formatDate(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" }).format(date);
}

export default function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [selectedAnnouncement, setSelectedAnnouncement] =
    useState<Announcement | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadAnnouncements() {
      try {
        const response = await fetch(
          `${getApiRoot()}/admin/dashboard/announcements`,
          {
            credentials: "include",
            cache: "no-store",
            signal: controller.signal,
          },
        );
        if (!response.ok) {
          throw new Error("Impossible de charger les annonces.");
        }
        const data: Announcement[] = await response.json();
        setAnnouncements(data);
        setError(null);
      } catch (cause) {
        if (controller.signal.aborted) return;
        setError(
          cause instanceof Error
            ? cause.message
            : "Impossible de charger les annonces.",
        );
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }

    void loadAnnouncements();
    return () => controller.abort();
  }, []);

  return (
    <section className="mx-auto max-w-6xl space-y-6 pb-12">
      <header className="rounded-3xl bg-white p-6 shadow-sm sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">
          Administration
        </p>
        <h1 className="mt-2 text-2xl font-black text-slate-900 sm:text-3xl">
          Toutes les annonces
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Consultez les annonces publiées, y compris celles clôturées, et leurs
          informations détaillées.
        </p>
        {!isLoading && !error && (
          <p className="mt-4 text-sm font-semibold text-slate-700">
            {announcements.length} annonce{announcements.length > 1 ? "s" : ""}
          </p>
        )}
      </header>

      {error && (
        <p
          role="alert"
          className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700"
        >
          {error}
        </p>
      )}

      {isLoading ? (
        <LoadingSkeleton variant="cards" count={4} columns={2} />
      ) : !error && announcements.length === 0 ? (
        <div className="rounded-3xl bg-white p-10 text-center text-sm text-slate-500">
          Aucune annonce n’a été publiée.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {announcements.map((announcement) => (
            <article
              key={announcement.id}
              className="flex flex-col rounded-3xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800">
                  {announcement.type === "OFFRE" ? "Offre" : "Demande"}
                </span>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    announcement.status === "CLOSED"
                      ? "bg-slate-100 text-slate-600"
                      : announcement.status === "IN_PROGRESS"
                        ? "bg-amber-50 text-amber-800"
                        : "bg-sky-50 text-sky-800"
                  }`}
                >
                  {statusLabels[announcement.status]}
                </span>
              </div>
              <h2 className="mt-4 text-lg font-bold text-slate-900">
                {announcement.title}
              </h2>
              <p className="mt-1 text-sm font-medium text-slate-600">
                {announcement.category}
              </p>
              <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">
                {announcement.description}
              </p>
              <div className="mt-4 space-y-2 text-xs text-slate-500">
                <p className="font-semibold text-slate-700">
                  {announcement.company?.companyName ?? "Entreprise inconnue"}
                </p>
                <p className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4" aria-hidden="true" />
                  Publiée le {formatDate(announcement.createdAt)}
                </p>
                {announcement.specificLocation && (
                  <p className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" aria-hidden="true" />
                    {announcement.specificLocation}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => setSelectedAnnouncement(announcement)}
                className="mt-5 inline-flex w-fit items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-800"
              >
                <Eye className="h-4 w-4" aria-hidden="true" />
                Voir les détails
              </button>
            </article>
          ))}
        </div>
      )}

      {selectedAnnouncement && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/50 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedAnnouncement(null);
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="announcement-detail-title"
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl sm:p-8"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                  {selectedAnnouncement.type === "OFFRE" ? "Offre" : "Demande"}{" "}
                  · {statusLabels[selectedAnnouncement.status]}
                </p>
                <h2
                  id="announcement-detail-title"
                  className="mt-2 text-2xl font-black text-slate-900"
                >
                  {selectedAnnouncement.title}
                </h2>
              </div>
              <button
                type="button"
                aria-label="Fermer les détails"
                onClick={() => setSelectedAnnouncement(null)}
                className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <dl className="mt-6 grid gap-4 rounded-2xl bg-slate-50 p-5 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-semibold uppercase text-slate-500">
                  Catégorie
                </dt>
                <dd className="mt-1 text-sm font-semibold text-slate-900">
                  {selectedAnnouncement.category}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase text-slate-500">
                  Entreprise
                </dt>
                <dd className="mt-1 text-sm font-semibold text-slate-900">
                  {selectedAnnouncement.company?.companyName ?? "—"}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase text-slate-500">
                  Secteur d’activité
                </dt>
                <dd className="mt-1 text-sm text-slate-900">
                  {selectedAnnouncement.company?.sector ?? "—"}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase text-slate-500">
                  Date de publication
                </dt>
                <dd className="mt-1 text-sm text-slate-900">
                  {formatDate(selectedAnnouncement.createdAt)}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase text-slate-500">
                  Échéance
                </dt>
                <dd className="mt-1 text-sm text-slate-900">
                  {formatDate(selectedAnnouncement.deadline)}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase text-slate-500">
                  Localisation
                </dt>
                <dd className="mt-1 text-sm text-slate-900">
                  {selectedAnnouncement.specificLocation ??
                    selectedAnnouncement.company?.address ??
                    "—"}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase text-slate-500">
                  Téléphone
                </dt>
                <dd className="mt-1 text-sm text-slate-900">
                  {selectedAnnouncement.company?.phone ?? "—"}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase text-slate-500">
                  Site web
                </dt>
                <dd className="mt-1 break-all text-sm text-slate-900">
                  {selectedAnnouncement.company?.website ?? "—"}
                </dd>
              </div>
            </dl>
            <div className="mt-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Description
              </h3>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-slate-700">
                {selectedAnnouncement.description}
              </p>
            </div>
          </section>
        </div>
      )}
    </section>
  );
}
