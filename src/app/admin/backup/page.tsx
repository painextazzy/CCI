"use client";

import { useState } from "react";
import { DatabaseBackup, Download, LoaderCircle, ShieldAlert, Upload } from "lucide-react";
import { useAuth } from "../../providers/AuthProvider";
import { getApiRoot } from "../../lib/auth";

type RestoreResult = { restoredRows: Record<string, number> };

async function getResponseError(response: Response, fallback: string) {
  const result = await response.json().catch(() => null);
  const message = result?.message;
  return Array.isArray(message)
    ? message.join(" ")
    : typeof message === "string"
      ? message
      : fallback;
}

export default function AdminBackupPage() {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  function selectBackupFile(selectedFile: File | undefined) {
    if (!selectedFile) return;
    if (
      !selectedFile.name.toLowerCase().endsWith(".json") ||
      selectedFile.size > 100 * 1024 * 1024
    ) {
      setFile(null);
      setError(
        selectedFile.size > 100 * 1024 * 1024
          ? "Le fichier ne peut pas dépasser 100 Mo."
          : "Veuillez sélectionner un fichier JSON.",
      );
      return;
    }

    setFile(selectedFile);
    setError(null);
    setMessage(null);
  }

  async function downloadBackup() {
    setIsDownloading(true);
    setError(null);
    setMessage(null);
    try {
      const response = await fetch(`${getApiRoot()}/admin/data/backup`, {
        credentials: "include",
        cache: "no-store",
      });
      if (!response.ok) {
        throw new Error(
          await getResponseError(response, "La création de la sauvegarde a échoué."),
        );
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `cci-b2b-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 0);
      setMessage("La sauvegarde a été téléchargée.");
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "La création de la sauvegarde a échoué.",
      );
    } finally {
      setIsDownloading(false);
    }
  }

  async function restoreBackup(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    if (!file) {
      setError("Veuillez sélectionner un fichier de sauvegarde.");
      return;
    }
    if (
      !window.confirm(
        "Cette opération remplacera toutes les données actuelles par celles de la sauvegarde. Voulez-vous continuer ?",
      )
    ) {
      return;
    }

    setIsRestoring(true);
    setError(null);
    setMessage(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch(`${getApiRoot()}/admin/data/restore`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      if (!response.ok) {
        throw new Error(
          await getResponseError(response, "La restauration des données a échoué."),
        );
      }

      const result: RestoreResult = await response.json();
      const rowCount = Object.values(result.restoredRows).reduce(
        (total, count) => total + count,
        0,
      );
      setMessage(
        `Restauration terminée : ${rowCount} enregistrement${rowCount > 1 ? "s" : ""} restauré${rowCount > 1 ? "s" : ""}.`,
      );
      setFile(null);
      form.reset();
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "La restauration des données a échoué.",
      );
    } finally {
      setIsRestoring(false);
    }
  }

  if (user?.role !== "ADMIN") {
    return (
      <section className="mx-auto max-w-3xl rounded-3xl bg-white p-8 text-center shadow-sm">
        <ShieldAlert className="mx-auto h-10 w-10 text-amber-600" />
        <h1 className="mt-4 text-2xl font-black text-slate-900">
          Accès réservé aux administrateurs
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Seul un compte administrateur peut sauvegarder ou restaurer les données.
        </p>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-4xl space-y-6 pb-12">
      <header className="rounded-3xl bg-white p-6 shadow-sm sm:p-8">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-700">
            <DatabaseBackup className="h-6 w-6" aria-hidden="true" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">
              Administration
            </p>
            <h1 className="mt-1 text-2xl font-black text-slate-900 sm:text-3xl">
              Sauvegarde et restauration
            </h1>
          </div>
        </div>
        <p className="mt-4 text-sm leading-6 text-slate-600">
          Téléchargez une copie complète des données de l’application ou restaurez
          une sauvegarde JSON créée ici.
        </p>
      </header>

      {error && (
        <p role="alert" className="rounded-2xl bg-rose-50 p-4 text-sm text-rose-700">
          {error}
        </p>
      )}
      {message && (
        <p role="status" className="rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-800">
          {message}
        </p>
      )}

      <div className="grid gap-5 md:grid-cols-2">
        <article className="rounded-3xl bg-white p-6 shadow-sm sm:p-7">
          <h2 className="text-lg font-bold text-slate-900">Créer une sauvegarde</h2>
          <p className="mt-2 min-h-12 text-sm leading-6 text-slate-600">
            Exporter les comptes, entreprises, annonces, échanges, contrats et
            visites du site dans un fichier JSON.
          </p>
          <button
            type="button"
            onClick={downloadBackup}
            disabled={isDownloading || isRestoring}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-3 text-sm font-bold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isDownloading ? (
              <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Download className="h-4 w-4" aria-hidden="true" />
            )}
            Télécharger la sauvegarde
          </button>
        </article>

        <article className="rounded-3xl bg-white p-6 shadow-sm sm:p-7">
          <h2 className="text-lg font-bold text-slate-900">Restaurer une sauvegarde</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            La restauration remplace les données actuelles. Seuls les fichiers
            JSON compatibles de 100 Mo maximum sont acceptés.
          </p>
          <form onSubmit={restoreBackup} className="mt-5 space-y-4">
            <label
              aria-label="Fichier de sauvegarde"
              onDragOver={(event) => {
                event.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={(event) => {
                if (
                  !event.currentTarget.contains(event.relatedTarget as Node | null)
                ) {
                  setIsDragging(false);
                }
              }}
              onDrop={(event) => {
                event.preventDefault();
                setIsDragging(false);
                selectBackupFile(event.dataTransfer.files[0]);
              }}
              className={`block cursor-pointer rounded-2xl border-2 border-dashed p-5 text-sm font-semibold transition ${
                isDragging
                  ? "border-emerald-500 bg-emerald-50 text-emerald-800"
                  : "border-slate-300 bg-slate-50 text-slate-700 hover:border-emerald-400"
              }`}
            >
              <span className="flex flex-col items-center gap-2 text-center">
                <Upload className="h-6 w-6 text-emerald-700" aria-hidden="true" />
                <span>
                  {file
                    ? file.name
                    : "Glissez votre fichier JSON ici ou cliquez pour le choisir"}
                </span>
                <span className="text-xs font-normal text-slate-500">
                  Fichier JSON · 100 Mo maximum
                </span>
              </span>
              <input
                type="file"
                accept=".json,application/json"
                onChange={(event) => {
                  selectBackupFile(event.target.files?.[0]);
                }}
                className="sr-only"
              />
            </label>
            <button
              type="submit"
              disabled={!file || isRestoring || isDownloading}
              className="inline-flex items-center gap-2 rounded-xl bg-rose-700 px-4 py-3 text-sm font-bold text-white transition hover:bg-rose-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isRestoring ? (
                <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <Upload className="h-4 w-4" aria-hidden="true" />
              )}
              Restaurer les données
            </button>
          </form>
        </article>
      </div>

      <aside className="flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
        <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
        <p>
          Une sauvegarde contient des données confidentielles, notamment les
          comptes utilisateurs. Conservez le fichier dans un emplacement sécurisé.
          La restauration remplace intégralement les données présentes.
        </p>
      </aside>
    </section>
  );
}
