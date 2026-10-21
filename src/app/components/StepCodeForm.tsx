"use client";

import type { FormEvent } from "react";

type StepCodeFormProps = {
  code: string;
  setCode: (code: string) => void;
  isLoading: boolean;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onBackToEmail: () => void;
  onResendCode: () => Promise<void>;
};

export default function StepCodeForm({
  code,
  setCode,
  isLoading,
  onSubmit,
  onBackToEmail,
  onResendCode,
}: StepCodeFormProps) {
  return (
    <form className="max-w-md mx-auto w-full space-y-5" onSubmit={onSubmit}>
      <div>
        <label className="sr-only" htmlFor="code">
          Code de vérification
        </label>
        <input
          id="code"
          name="code"
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="[0-9]{6}"
          maxLength={6}
          required
          value={code}
          onChange={(event) =>
            setCode(event.target.value.replace(/\D/g, "").slice(0, 6))
          }
          placeholder="Code à 6 chiffres"
          className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200/90 rounded-xl text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0d9488]/20 focus:border-[#0d9488] transition-all text-sm font-medium text-center tracking-[0.4em]"
        />
      </div>

      <button
        type="submit"
        disabled={isLoading || code.length !== 6}
        className="w-full text-white font-semibold py-3.5 px-4 rounded-xl transition-all text-sm tracking-wide mt-2 bg-[#0d9488] hover:bg-[#0f766e] shadow-[0_10px_25px_-5px_rgba(13,148,136,0.4)] active:scale-[0.99] disabled:opacity-50"
      >
        Valider le code
      </button>

      <div className="flex items-center justify-between text-xs font-semibold">
        <button
          type="button"
          disabled={isLoading}
          onClick={onBackToEmail}
          className="text-slate-400 hover:text-[#0d9488] transition-colors disabled:opacity-50"
        >
          Modifier l&apos;e-mail
        </button>
        <button
          type="button"
          disabled={isLoading}
          onClick={() => void onResendCode()}
          className="text-[#0d9488] hover:text-[#0f766e] transition-colors disabled:opacity-50"
        >
          Renvoyer le code
        </button>
      </div>
    </form>
  );
}
