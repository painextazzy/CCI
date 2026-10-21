"use client";

import Link from "next/link";
import type { FormEvent } from "react";

type StepEmailFormProps = {
  email: string;
  setEmail: (email: string) => void;
  isLoading: boolean;
  onSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
};

export default function StepEmailForm({
  email,
  setEmail,
  isLoading,
  onSubmit,
}: StepEmailFormProps) {
  return (
    <form className="max-w-md mx-auto w-full space-y-5" onSubmit={onSubmit}>
      <div>
        <label className="sr-only" htmlFor="email">
          E-mail professionnel
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="E-mail professionnel"
          className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200/90 rounded-xl text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0d9488]/20 focus:border-[#0d9488] transition-all text-sm font-medium"
        />
      </div>
      <button
        type="submit"
        disabled={isLoading}
        className="w-full text-white font-semibold py-3.5 px-4 rounded-xl transition-all text-sm tracking-wide mt-2 bg-[#0d9488] hover:bg-[#0f766e] shadow-[0_10px_25px_-5px_rgba(13,148,136,0.4)] active:scale-[0.99] disabled:opacity-50"
      >
        {isLoading ? "Envoi en cours..." : "Envoyer le code"}
      </button>
      <div className="text-center pt-2">
        <Link
          href="/login"
          className="text-sm font-semibold text-[#0d9488] hover:underline transition-colors"
        >
          Retour à la connexion
        </Link>
      </div>
    </form>
  );
}
