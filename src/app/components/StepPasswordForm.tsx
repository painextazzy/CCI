"use client";

import type { FormEvent } from "react";

type StepPasswordFormProps = {
  newPassword: string;
  setNewPassword: (password: string) => void;
  confirmPassword: string;
  setConfirmPassword: (password: string) => void;
  isLoading: boolean;
  onSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  onBackToCode: () => void;
};

export default function StepPasswordForm({
  newPassword,
  setNewPassword,
  confirmPassword,
  setConfirmPassword,
  isLoading,
  onSubmit,
  onBackToCode,
}: StepPasswordFormProps) {
  return (
    <form className="max-w-md mx-auto w-full space-y-5" onSubmit={onSubmit}>
      <div>
        <label className="sr-only" htmlFor="newPassword">
          Nouveau mot de passe
        </label>
        <input
          id="newPassword"
          name="newPassword"
          type="password"
          autoComplete="new-password"
          minLength={6}
          required
          value={newPassword}
          onChange={(event) => setNewPassword(event.target.value)}
          placeholder="Nouveau mot de passe"
          className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200/90 rounded-xl text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0d9488]/20 focus:border-[#0d9488] transition-all text-sm font-medium"
        />
      </div>
      <div>
        <label className="sr-only" htmlFor="confirmPassword">
          Confirmer le nouveau mot de passe
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          minLength={6}
          required
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          placeholder="Confirmer le nouveau mot de passe"
          className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200/90 rounded-xl text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0d9488]/20 focus:border-[#0d9488] transition-all text-sm font-medium"
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full text-white font-semibold py-3.5 px-4 rounded-xl transition-all text-sm tracking-wide mt-2 bg-[#0d9488] hover:bg-[#0f766e] shadow-[0_10px_25px_-5px_rgba(13,148,136,0.4)] active:scale-[0.99] disabled:opacity-50"
      >
        {isLoading ? "Mise à jour..." : "Réinitialiser le mot de passe"}
      </button>

      <div className="text-center pt-2">
        <button
          type="button"
          disabled={isLoading}
          onClick={onBackToCode}
          className="text-xs font-semibold text-slate-400 hover:text-[#0d9488] transition-colors disabled:opacity-50"
        >
          Retour à la saisie du code
        </button>
      </div>
    </form>
  );
}
