"use client";

import { useEffect, useState } from "react";
import { getApiRoot, type AuthUser } from "../../lib/auth";
import { useAuth } from "../../providers/AuthProvider";

type ApiError = { message?: string | string[] };

async function getErrorMessage(response: Response, fallback: string) {
  const body = (await response.json()) as ApiError;
  return Array.isArray(body.message)
    ? body.message.join(", ")
    : body.message || fallback;
}

export default function AccountSettingsPage() {
  const { user, setUser } = useAuth();
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [photoSuccess, setPhotoSuccess] = useState<string | null>(null);
  const [photoSaving, setPhotoSaving] = useState(false);
  const [password, setPassword] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordSaving, setPasswordSaving] = useState(false);

  useEffect(() => {
    if (!photo) {
      setPhotoPreview(null);
      return;
    }
    const preview = URL.createObjectURL(photo);
    setPhotoPreview(preview);
    return () => URL.revokeObjectURL(preview);
  }, [photo]);

  const handlePhotoChange = (file?: File) => {
    setPhotoError(null);
    setPhotoSuccess(null);
    if (!file) {
      setPhoto(null);
      return;
    }
    if (
      !["image/jpeg", "image/png", "image/webp", "image/gif"].includes(
        file.type,
      )
    ) {
      setPhotoError("Choisissez une image JPEG, PNG, WebP ou GIF.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setPhotoError("La photo ne doit pas dépasser 5 Mo.");
      return;
    }
    setPhoto(file);
  };

  const handlePhotoSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!photo) return;
    setPhotoSaving(true);
    setPhotoError(null);
    setPhotoSuccess(null);

    try {
      const formData = new FormData();
      formData.append("photo", photo);
      const response = await fetch(`${getApiRoot()}/auth/profile-photo`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      if (!response.ok) {
        throw new Error(
          await getErrorMessage(
            response,
            "La mise à jour de la photo a échoué.",
          ),
        );
      }
      const result = (await response.json()) as { avatarUrl: string };
      if (!user) throw new Error("Votre session n'est plus disponible.");
      setUser({ ...user, avatarUrl: result.avatarUrl } satisfies AuthUser);
      setPhoto(null);
      setPhotoSuccess("Votre photo de profil a été mise à jour.");
    } catch (cause) {
      setPhotoError(
        cause instanceof Error
          ? cause.message
          : "La mise à jour de la photo a échoué.",
      );
    } finally {
      setPhotoSaving(false);
    }
  };

  const handlePasswordSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);
    if (password.newPassword !== password.confirmPassword) {
      setPasswordError(
        "La confirmation du nouveau mot de passe ne correspond pas.",
      );
      return;
    }
    setPasswordSaving(true);

    try {
      const response = await fetch(`${getApiRoot()}/auth/change-password`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          currentPassword: password.currentPassword,
          newPassword: password.newPassword,
        }),
      });
      if (!response.ok) {
        throw new Error(
          await getErrorMessage(
            response,
            "La modification du mot de passe a échoué.",
          ),
        );
      }
      setPassword({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setPasswordSuccess("Votre mot de passe a été modifié.");
    } catch (cause) {
      setPasswordError(
        cause instanceof Error
          ? cause.message
          : "La modification du mot de passe a échoué.",
      );
    } finally {
      setPasswordSaving(false);
    }
  };

  const company = user?.company;
  const companyFields = [
    ["Entreprise", company?.companyName],
    ["E-mail du compte", user?.email],
    ["Type d'entreprise", company?.companyType],
    ["Secteur d'activité", company?.sectorOther || company?.sector],
    ["NIF", company?.nif],
    ["STAT", company?.stat],
    ["Adresse", company?.address],
    ["Responsable", company?.managerName],
    ["Fonction", company?.managerRole],
    ["Téléphone", company?.phone],
    ["Site web", company?.website],
    ["Vérification", company?.verificationStatus],
  ] as const;

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 pb-12 pt-4 sm:px-6">
      <header data-actor-card className="rounded-3xl border border-slate-100 bg-white p-6 shadow-xs">
        <h1 className="text-xl font-extrabold tracking-tight text-slate-900">
          Paramètres du compte
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Consultez vos informations et gérez votre photo de profil et votre mot
          de passe.
        </p>
      </header>

      <section data-actor-card className="rounded-3xl border border-slate-100 bg-white p-6 shadow-xs">
        <h2 className="text-base font-bold text-slate-900">
          Informations du compte
        </h2>
        <dl className="mt-5 grid gap-x-8 gap-y-4 sm:grid-cols-2">
          {companyFields.map(([label, value]) => (
            <div key={label} className="min-w-0 border-b border-slate-100 pb-3">
              <dt className="text-xs font-semibold text-slate-400">{label}</dt>
              <dd className="mt-1 break-words text-sm font-medium text-slate-800">
                {value || "Non renseigné"}
              </dd>
            </div>
          ))}
        </dl>
        <p className="mt-4 text-xs text-slate-500">
          Les informations de l&apos;entreprise sont consultables ici, mais ne
          peuvent pas être modifiées depuis cette page.
        </p>
      </section>

      <section data-actor-card className="rounded-3xl border border-slate-100 bg-white p-6 shadow-xs">
        <h2 className="text-base font-bold text-slate-900">Photo de profil</h2>
        <form
          onSubmit={handlePhotoSubmit}
          className="mt-4 flex flex-col gap-5 sm:flex-row sm:items-center"
        >
          <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-emerald-100 text-xl font-bold text-emerald-700">
            {photoPreview || user?.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={photoPreview || user?.avatarUrl || ""}
                alt="Photo de profil"
                className="h-full w-full object-cover"
              />
            ) : (
              (company?.companyName || user?.email || "CC")
                .slice(0, 2)
                .toUpperCase()
            )}
          </div>
          <div className="flex-1 space-y-3">
            <label className="block text-sm font-medium text-slate-700">
              Choisir une photo (JPEG, PNG, WebP ou GIF, 5 Mo maximum)
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={(event) => handlePhotoChange(event.target.files?.[0])}
                className="mt-2 block w-full text-sm text-slate-600 file:mr-4 file:rounded-xl file:border-0 file:bg-emerald-50 file:px-4 file:py-2 file:font-semibold file:text-emerald-700 hover:file:bg-emerald-100"
              />
            </label>
            {photoError && (
              <p role="alert" className="text-sm text-rose-700">
                {photoError}
              </p>
            )}
            {photoSuccess && (
              <p role="status" className="text-sm text-emerald-700">
                {photoSuccess}
              </p>
            )}
            <button
              type="submit"
              disabled={!photo || photoSaving}
              className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {photoSaving ? "Enregistrement..." : "Enregistrer la photo"}
            </button>
          </div>
        </form>
      </section>

      <section data-actor-card className="rounded-3xl border border-slate-100 bg-white p-6 shadow-xs">
        <h2 className="text-base font-bold text-slate-900">
          Modifier le mot de passe
        </h2>
        <form
          onSubmit={handlePasswordSubmit}
          className="mt-4 max-w-xl space-y-4"
        >
          <label className="block text-sm font-medium text-slate-700">
            Mot de passe actuel
            <input
              type="password"
              autoComplete="current-password"
              minLength={6}
              required
              value={password.currentPassword}
              onChange={(event) =>
                setPassword({
                  ...password,
                  currentPassword: event.target.value,
                })
              }
              className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Nouveau mot de passe
            <input
              type="password"
              autoComplete="new-password"
              minLength={6}
              required
              value={password.newPassword}
              onChange={(event) =>
                setPassword({ ...password, newPassword: event.target.value })
              }
              className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Confirmer le nouveau mot de passe
            <input
              type="password"
              autoComplete="new-password"
              minLength={6}
              required
              value={password.confirmPassword}
              onChange={(event) =>
                setPassword({
                  ...password,
                  confirmPassword: event.target.value,
                })
              }
              className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </label>
          {passwordError && (
            <p role="alert" className="text-sm text-rose-700">
              {passwordError}
            </p>
          )}
          {passwordSuccess && (
            <p role="status" className="text-sm text-emerald-700">
              {passwordSuccess}
            </p>
          )}
          <button
            type="submit"
            disabled={passwordSaving}
            className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {passwordSaving ? "Modification..." : "Modifier le mot de passe"}
          </button>
        </form>
      </section>
    </div>
  );
}
