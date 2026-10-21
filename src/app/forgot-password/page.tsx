"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { getApiRoot } from "../lib/auth";
import StepEmailForm from "../components/StepEmailForm";
import StepCodeForm from "../components/StepCodeForm";
import StepPasswordForm from "../components/StepPasswordForm";

type ApiError = { message?: string | string[] };
type Step = "EMAIL" | "CODE" | "PASSWORD" | "SUCCESS";

async function getResponseMessage(response: Response, fallback: string) {
  let body: ApiError = {};
  try {
    body = (await response.json()) as ApiError;
  } catch {
    return fallback;
  }

  return Array.isArray(body.message)
    ? body.message.join(", ")
    : body.message || fallback;
}

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>("EMAIL");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const requestCode = async () => {
    setIsLoading(true);
    setError(null);
    setNotice(null);

    try {
      const response = await fetch(`${getApiRoot()}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error(
          await getResponseMessage(
            response,
            "Impossible d'envoyer le code. Veuillez réessayer.",
          ),
        );
      }

      const body = (await response.json()) as { message?: string };
      setStep("CODE");
      setNotice(
        body.message ||
          "Si un compte est associé à cette adresse, un code lui a été envoyé.",
      );
    } catch (cause: unknown) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Une erreur est survenue lors de l'envoi du code.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestCode = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await requestCode();
  };

  const handleVerifyCode = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setNotice(null);

    if (code.length !== 6) {
      setError("Le code doit contenir exactement 6 chiffres.");
      return;
    }

    // Passage à l'étape suivante (Saisie du nouveau mot de passe)
    setStep("PASSWORD");
  };

  const handleResetPassword = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    setError(null);
    setNotice(null);

    if (newPassword !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${getApiRoot()}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, newPassword }),
      });

      if (!response.ok) {
        throw new Error(
          await getResponseMessage(
            response,
            "Impossible de réinitialiser le mot de passe. Veuillez réessayer.",
          ),
        );
      }

      setStep("SUCCESS");
    } catch (cause: unknown) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Une erreur est survenue lors de la réinitialisation.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-10 bg-[#e9ebf2] text-slate-800 antialiased font-sans">
      <main className="w-full max-w-[1040px] bg-white rounded-[36px] p-6 sm:p-8 lg:p-9 shadow-[0_25px_70px_-15px_rgba(45,55,90,0.12)] relative overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute -top-12 -right-12 w-80 h-80 rounded-full pointer-events-none bg-[radial-gradient(circle,_rgba(168,142,255,0.3)_0%,_rgba(255,255,255,0)_70%)] blur-[40px]"
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch relative z-10">
          <section className="lg:col-span-5 rounded-[32px] p-8 sm:p-10 flex flex-col justify-between text-white relative overflow-hidden min-h-[520px]">
            <div className="absolute inset-0 z-0">
              <Image
                src="/images/b2b-hero.jpg"
                alt="Chambre de Commerce et d'Industrie Haute Matsiatra B2B"
                fill
                priority
                className="object-cover object-center"
                sizes="(max-width: 1024px) 100vw, 40vw"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-[#0d9488]/90 via-[#005f56]/85 to-[#042f2e]/95" />
            </div>

            <div className="relative z-10 space-y-4 max-w-sm">
              <span className="inline-block px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-[11px] font-semibold uppercase tracking-wider text-teal-100 border border-white/20">
                CCI Haute Matsiatra
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-[1.2]">
                Retrouvez
                <br />
                l&apos;accès à votre
                <br />
                espace sécurisé
              </h1>
              <p className="text-white/85 text-xs sm:text-[13px] leading-relaxed font-normal pt-1">
                Un code de vérification vous permet de choisir un nouveau mot de
                passe en toute sécurité.
              </p>
            </div>

            <div className="relative z-10 pt-6">
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/15">
                <div className="w-8 h-8 rounded-xl bg-teal-400/20 flex items-center justify-center shrink-0 border border-teal-300/30">
                  <svg
                    className="w-4 h-4 text-teal-200"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-bold text-white">
                    Plateforme Consulaire Officielle
                  </p>
                  <p className="text-[11px] text-teal-100/80">
                    Entreprises vérifiées NIF / STAT
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="lg:col-span-7 flex flex-col justify-center px-2 sm:px-6 lg:px-8 py-4 sm:py-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {step === "SUCCESS"
                  ? "Mot de passe modifié"
                  : step === "PASSWORD"
                    ? "Nouveau mot de passe"
                    : step === "CODE"
                      ? "Vérifiez votre e-mail"
                      : "Mot de passe oublié ?"}
              </h2>
              <p className="text-slate-400 text-sm mt-1.5 font-medium">
                {step === "SUCCESS"
                  ? "Vous pouvez maintenant vous connecter à votre compte."
                  : step === "PASSWORD"
                    ? `Code validé avec succès. Choisissez votre nouveau mot de passe.`
                    : step === "CODE"
                      ? `Saisissez le code à 6 chiffres reçu à l'adresse ${email}.`
                      : "Saisissez votre adresse e-mail pour recevoir un code de vérification."}
              </p>
            </div>

            {error && (
              <div
                role="alert"
                className="max-w-md mx-auto mb-4 w-full p-3 text-xs text-red-700 bg-red-100 border border-red-200 rounded-xl text-center font-medium"
              >
                {error}
              </div>
            )}
            {notice && step !== "SUCCESS" && (
              <div
                role="status"
                className="max-w-md mx-auto mb-4 w-full p-3 text-xs text-teal-800 bg-teal-50 border border-teal-200 rounded-xl text-center font-medium"
              >
                {notice}
              </div>
            )}

            {step === "SUCCESS" && (
              <div className="max-w-md mx-auto w-full text-center">
                <Link
                  href="/login"
                  className="block w-full text-white font-semibold py-3.5 px-4 rounded-xl transition-all text-sm tracking-wide bg-[#0d9488] hover:bg-[#0f766e] shadow-[0_10px_25px_-5px_rgba(13,148,136,0.4)]"
                >
                  Revenir à la connexion
                </Link>
              </div>
            )}

            {step === "CODE" && (
              <StepCodeForm
                code={code}
                setCode={setCode}
                isLoading={isLoading}
                onSubmit={handleVerifyCode}
                onBackToEmail={() => {
                  setStep("EMAIL");
                  setCode("");
                  setError(null);
                  setNotice(null);
                }}
                onResendCode={requestCode}
              />
            )}

            {step === "PASSWORD" && (
              <StepPasswordForm
                newPassword={newPassword}
                setNewPassword={setNewPassword}
                confirmPassword={confirmPassword}
                setConfirmPassword={setConfirmPassword}
                isLoading={isLoading}
                onSubmit={handleResetPassword}
                onBackToCode={() => setStep("CODE")}
              />
            )}

            {step === "EMAIL" && (
              <StepEmailForm
                email={email}
                setEmail={setEmail}
                isLoading={isLoading}
                onSubmit={handleRequestCode}
              />
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
