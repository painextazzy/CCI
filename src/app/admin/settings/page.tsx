"use client";

import { useState } from "react";
import { getApiRoot } from "../../lib/auth";
import { useAuth } from "../../providers/AuthProvider";

type ApiError = { message?: string | string[] };

async function getErrorMessage(response: Response, fallback: string) {
  const body = (await response.json()) as ApiError;
  return Array.isArray(body.message)
    ? body.message.join(", ")
    : body.message || fallback;
}

const inputClassName =
  "mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20";

export default function AdminSettingsPage() {
  const { user } = useAuth();
  const [password, setPassword] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [adminAccount, setAdminAccount] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [adminError, setAdminError] = useState<string | null>(null);
  const [adminSuccess, setAdminSuccess] = useState<string | null>(null);
  const [adminSaving, setAdminSaving] = useState(false);

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

  const handleAdminSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    setAdminError(null);
    setAdminSuccess(null);
    if (adminAccount.password !== adminAccount.confirmPassword) {
      setAdminError("La confirmation du mot de passe ne correspond pas.");
      return;
    }

    setAdminSaving(true);
    try {
      const response = await fetch(`${getApiRoot()}/users/admins`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: adminAccount.email,
          password: adminAccount.password,
        }),
      });
      if (!response.ok) {
        throw new Error(
          await getErrorMessage(
            response,
            "La création du compte administrateur a échoué.",
          ),
        );
      }
      const createdAdmin = (await response.json()) as { email: string };
      setAdminAccount({ email: "", password: "", confirmPassword: "" });
      setAdminSuccess(
        `Le compte administrateur ${createdAdmin.email} a été créé.`,
      );
    } catch (cause) {
      setAdminError(
        cause instanceof Error
          ? cause.message
          : "La création du compte administrateur a échoué.",
      );
    } finally {
      setAdminSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-10">
      <header>
        <p className="text-sm font-semibold text-emerald-700">
          Administration
        </p>
        <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900">
          Paramètres du compte
        </h1>
      </header>

      <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
        <h2 className="text-base font-bold text-slate-900">
          Informations du compte
        </h2>
        <dl className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="border-b border-slate-100 pb-3">
            <dt className="text-xs font-semibold text-slate-400">E-mail</dt>
            <dd className="mt-1 break-all text-sm font-medium text-slate-800">
              {user?.email || "Chargement..."}
            </dd>
          </div>
          <div className="border-b border-slate-100 pb-3">
            <dt className="text-xs font-semibold text-slate-400">Rôle</dt>
            <dd className="mt-1 text-sm font-medium text-slate-800">
              {user?.role === "ADMIN" ? "Administrateur" : "Agent CCI"}
            </dd>
          </div>
        </dl>
      </section>

      <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
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
                setPassword({ ...password, currentPassword: event.target.value })
              }
              className={inputClassName}
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
              className={inputClassName}
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
              className={inputClassName}
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

      {user?.role === "ADMIN" && (
        <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
          <h2 className="text-base font-bold text-slate-900">
            Créer un compte administrateur
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Le nouvel administrateur pourra se connecter avec l&apos;e-mail et le
            mot de passe définis ci-dessous.
          </p>
          <form
            onSubmit={handleAdminSubmit}
            className="mt-4 max-w-xl space-y-4"
          >
            <label className="block text-sm font-medium text-slate-700">
              Adresse e-mail
              <input
                type="email"
                autoComplete="email"
                required
                value={adminAccount.email}
                onChange={(event) =>
                  setAdminAccount({
                    ...adminAccount,
                    email: event.target.value,
                  })
                }
                className={inputClassName}
              />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Mot de passe (6 caractères minimum)
              <input
                type="password"
                autoComplete="new-password"
                minLength={6}
                required
                value={adminAccount.password}
                onChange={(event) =>
                  setAdminAccount({
                    ...adminAccount,
                    password: event.target.value,
                  })
                }
                className={inputClassName}
              />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Confirmer le mot de passe
              <input
                type="password"
                autoComplete="new-password"
                minLength={6}
                required
                value={adminAccount.confirmPassword}
                onChange={(event) =>
                  setAdminAccount({
                    ...adminAccount,
                    confirmPassword: event.target.value,
                  })
                }
                className={inputClassName}
              />
            </label>
            {adminError && (
              <p role="alert" className="text-sm text-rose-700">
                {adminError}
              </p>
            )}
            {adminSuccess && (
              <p role="status" className="text-sm text-emerald-700">
                {adminSuccess}
              </p>
            )}
            <button
              type="submit"
              disabled={adminSaving}
              className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {adminSaving ? "Création..." : "Créer le compte administrateur"}
            </button>
          </form>
        </section>
      )}
    </div>
  );
}
