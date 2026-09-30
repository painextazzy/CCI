"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Step1, Step2, Step3, Step4, Step5, Step6 } from "./RegisterSteps";

export default function RegisterPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [companyType, setCompanyType] = useState<"internal" | "external">("internal");
  const [isLoading, setIsLoading] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    companyType: "internal",
    companyName: "",
    nif: "",
    stat: "",
    rcs: "",
    cityZip: "Fianarantsoa (301)",
    address: "",
    managerName: "",
    managerRole: "Gérant",
    phone: "",
    website: "",
    email: "",
    password: "",
    confirmPassword: "",
    kbisFile: null as File | null,
    cinFile: null as File | null,
    sector: "AGRO",
    sectorOther: "",
    needsDescription: "",
    agreedTerms: false,
  });

  useEffect(() => {
    if (!isRegistered) return;

    const redirectTimer = window.setTimeout(() => router.push("/login"), 5000);
    return () => window.clearTimeout(redirectTimer);
  }, [isRegistered, router]);

  const steps = [
    { id: 1, label: "Étape 1", title: "Identité de l'entreprise" },
    { id: 2, label: "Étape 2", title: "Dirigeant & Contact" },
    { id: 3, label: "Étape 3", title: "Sécurité du compte" },
    { id: 4, label: "Étape 4", title: "Pièces & Justificatifs" },
    { id: 5, label: "Étape 5", title: "Secteur & Activités" },
    { id: 6, label: "Étape 6", title: "Validation Consulaire" },
  ];

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((current) => ({ ...current, [name]: checked }));
      return;
    }

    let cleanValue = value;
    if (name === "nif" || name === "stat") {
      cleanValue = value.replace(/\D/g, "").slice(0, 10);
    } else if (name === "phone") {
      const digits = value.replace(/\D/g, "").slice(0, 12);
      cleanValue = digits ? `+${digits}` : "";
    } else if (name === "companyName" || name === "managerName") {
      cleanValue = value.replace(/[^\p{L}\s]/gu, "").replace(/\s+/g, " ");
    }

    setFormData((current) => ({ ...current, [name]: cleanValue }));
  };

  const handleTypeSelect = (type: "internal" | "external") => {
    setCompanyType(type);
    setFormData((current) => ({ ...current, companyType: type }));
  };

  const handleFileSelect = (name: "kbisFile" | "cinFile", file: File | null) => {
    setFormData((current) => ({ ...current, [name]: file }));
  };

  const handleNextStep = () => {
    if (currentStep < 6) setCurrentStep((prev) => prev + 1);
  };

  const handlePrevStep = () => {
    if (currentStep > 1) setCurrentStep((prev) => prev - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep < 6) {
      setError(null);
      handleNextStep();
      return;
    }

    const namePattern = /^[\p{L} ]+$/u;
    if (!namePattern.test(formData.companyName.trim())) {
      setCurrentStep(1);
      setError("Le nom de l'entreprise doit contenir uniquement des lettres et des espaces.");
      return;
    }
    if (!/^\d{10}$/.test(formData.nif) || !/^\d{10}$/.test(formData.stat)) {
      setCurrentStep(1);
      setError("Le NIF et le STAT doivent contenir exactement 10 chiffres chacun.");
      return;
    }
    if (!namePattern.test(formData.managerName.trim())) {
      setCurrentStep(2);
      setError("Le nom du responsable doit contenir uniquement des lettres et des espaces.");
      return;
    }
    if (!/^\+\d{12}$/.test(formData.phone)) {
      setCurrentStep(2);
      setError("Le numéro doit commencer par + et contenir exactement 12 chiffres.");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(formData.email.trim())) {
      setCurrentStep(3);
      setError("Veuillez saisir une adresse e-mail valide.");
      return;
    }
    if (formData.password.length < 6 || formData.password !== formData.confirmPassword) {
      setCurrentStep(3);
      setError(
        formData.password.length < 6
          ? "Le mot de passe doit contenir au moins 6 caractères."
          : "Les mots de passe ne correspondent pas."
      );
      return;
    }
    if (companyType === "external" && !formData.kbisFile) {
      setCurrentStep(4);
      setError("Veuillez ajouter l'extrait Kbis de votre entreprise.");
      return;
    }
    if (formData.sector === "AUTRE" && !formData.sectorOther.trim()) {
      setCurrentStep(5);
      setError("Veuillez préciser votre secteur d'activité.");
      return;
    }
    if (!formData.needsDescription.trim()) {
      setCurrentStep(5);
      setError("Veuillez décrire votre activité.");
      return;
    }
    if (!formData.agreedTerms) {
      setError("Veuillez accepter la charte d'éthique pour soumettre votre dossier.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const payload = new FormData();
      const registrationData: Record<string, string> = {
        companyType: companyType === "internal" ? "HAUTE_MATSIATRA" : "OTHER_REGION",
        companyName: formData.companyName.trim(),
        nif: formData.nif,
        stat: formData.stat,
        address: formData.address.trim(),
        managerName: formData.managerName.trim(),
        managerRole: formData.managerRole,
        phone: formData.phone,
        email: formData.email.trim(),
        password: formData.password,
        sector: formData.sector,
        needsDescription: formData.needsDescription.trim(),
        agreedTerms: "true",
      };
      if (formData.rcs.trim()) registrationData.rcs = formData.rcs.trim();
      if (formData.website.trim()) registrationData.website = formData.website.trim();
      if (formData.sector === "AUTRE" && formData.sectorOther.trim()) {
        registrationData.sectorOther = formData.sectorOther.trim();
      }
      Object.entries(registrationData).forEach(([key, value]) => payload.append(key, value));
      if (formData.kbisFile) payload.append("kbisFile", formData.kbisFile);

      const configuredApiUrl = process.env.NEXT_PUBLIC_API_URL?.trim().replace(/\/+$/, "");
      if (!configuredApiUrl) {
        throw new Error("La variable NEXT_PUBLIC_API_URL n'est pas configurée.");
      }

      const apiRoot = /\/api$/i.test(configuredApiUrl)
        ? configuredApiUrl
        : `${configuredApiUrl}/api`;
      const res = await fetch(`${apiRoot}/auth/register`, {
        method: "POST",
        body: payload,
      });

      const responseData = await res.json().catch(() => null);
      if (!res.ok) {
        const message = responseData?.message;
        throw new Error(
          Array.isArray(message)
            ? message.join(" ")
            : typeof message === "string"
              ? message
              : "Erreur lors de la création du compte."
        );
      }

      setIsRegistered(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue lors de l'inscription.");
    } finally {
      setIsLoading(false);
    }
  };

  const progressPercentage = Math.round((currentStep / 6) * 100);

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <Step1
            formData={formData}
            handleInputChange={handleInputChange}
            handleTypeSelect={handleTypeSelect}
            companyType={companyType}
          />
        );
      case 2:
        return <Step2 formData={formData} handleInputChange={handleInputChange} />;
      case 3:
        return <Step3 formData={formData} handleInputChange={handleInputChange} />;
      case 4:
        return (
          <Step4
            formData={formData}
            handleInputChange={handleInputChange}
            companyType={companyType}
            handleFileSelect={handleFileSelect}
          />
        );
      case 5:
        return <Step5 formData={formData} handleInputChange={handleInputChange} />;
      case 6:
        return <Step6 formData={formData} handleInputChange={handleInputChange} />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-[#f1f8f7] font-sans antialiased text-slate-700 min-h-screen flex items-center justify-center p-3 sm:p-6 lg:p-8 relative">
      <div
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='120' height='120' viewBox='0 0 120 120' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0 L120 120 M120 0 L0 120' stroke='%230d9488' stroke-width='0.4' stroke-opacity='0.15'/%3E%3C/svg%3E")`,
        }}
      />

      <main className="w-full max-w-5xl bg-white rounded-3xl shadow-[0_20px_60px_-15px_rgba(13,148,136,0.15),0_0_1px_1px_rgba(13,148,136,0.06)] border border-teal-100/60 overflow-hidden relative z-10 transition-all duration-300">
        <header className="flex items-center justify-between px-6 sm:px-10 py-5 border-b border-slate-100 bg-white">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-600/10 flex items-center justify-center text-teal-600 font-bold">
              <svg
                className="w-5 h-5 text-teal-600"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.2"
                viewBox="0 0 24 24"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="m9 12 2 2 4-4" />
              </svg>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-extrabold tracking-tight text-slate-800">
                CCI
              </span>
              <span className="text-sm font-semibold text-teal-600 tracking-wide">
                B2B CONNECT
              </span>
            </div>
          </Link>

          <div className="text-right">
            <h1 className="text-base sm:text-lg font-extrabold text-slate-800 tracking-tight">
              Créer un compte Entreprise
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Vérification consulaire certifiée
            </p>
          </div>
        </header>

        <div className="text-center pt-8 pb-7 px-4">
          <p className="text-sm sm:text-base text-slate-500 font-medium">
            Complétez les 6 étapes pour débuter la vérification consulaire certifiée
          </p>
        </div>

        <div className="px-6 sm:px-10 pb-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Stepper Side Navigation */}
            <aside className="lg:col-span-4 bg-slate-50/70 border border-slate-300 rounded-2xl p-5 shadow-sm h-full flex flex-col justify-between">
              <div className="relative flex-1">
                <div className="absolute left-4.75 top-5 bottom-5 w-0.5 bg-slate-200 z-0" />
                <ul className="relative z-10 flex flex-col justify-between h-full space-y-4" role="list">
                  {steps.map((step) => {
                    const isActive = currentStep === step.id;
                    const isCompleted = currentStep > step.id;

                    return (
                      <li
                        key={step.id}
                        onClick={() => setCurrentStep(step.id)}
                        className={`flex items-center gap-3.5 cursor-pointer transition-opacity ${
                          isActive ? "opacity-100" : "opacity-75 hover:opacity-100"
                        }`}
                      >
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center ring-4 ring-white transition-all ${
                            isActive
                              ? "bg-teal-600 text-white shadow-md shadow-teal-600/30"
                              : isCompleted
                              ? "bg-teal-600 text-white"
                              : "bg-white border-2 border-slate-200 text-slate-400"
                          }`}
                        >
                          {isCompleted ? (
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2.5"
                              viewBox="0 0 24 24"
                            >
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          ) : (
                            <span className="text-xs font-bold">{step.id}</span>
                          )}
                        </div>
                        <div className="flex-1">
                          <span
                            className={`text-xs uppercase tracking-wider block leading-tight font-bold ${
                              isActive || isCompleted ? "text-teal-600" : "text-slate-400"
                            }`}
                          >
                            {step.label}
                          </span>
                          <span
                            className={`text-sm ${
                              isActive
                                ? "font-bold text-slate-800"
                                : isCompleted
                                ? "font-semibold text-slate-700"
                                : "font-medium text-slate-600"
                            }`}
                          >
                            {step.title}
                          </span>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </aside>

            {/* Form Section */}
            <section className="lg:col-span-8 bg-white rounded-2xl border border-slate-100 pt-5 pb-6 px-6 sm:pt-5 sm:pb-7 sm:px-7 shadow-sm h-full flex flex-col justify-between">
              <div>
                <div className="pb-5 border-b border-slate-100">
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-linear-to-r from-teal-500 to-teal-400 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-end text-xs font-semibold text-slate-500 mt-2">
                    <span className="text-teal-600 font-bold">{progressPercentage}% complété</span>
                  </div>
                </div>

                <div className="pt-6 pb-5">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-teal-100 text-teal-700 text-[11px] font-bold">
                      {currentStep}
                    </span>
                    <span className="text-[11px] uppercase tracking-wider font-bold text-teal-600">
                      Étape {currentStep} sur 6
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight">
                    {steps[currentStep - 1].title}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    Informations officielles pour le registre consulaire de la Haute Matsiatra
                  </p>
                </div>

                {isRegistered ? (
                  <div
                    role="status"
                    aria-live="polite"
                    className="mt-6 border border-teal-200 bg-teal-50 p-5 rounded-xl text-center"
                  >
                    <h3 className="text-base font-bold text-teal-800">Inscription transmise</h3>
                    <p className="mt-2 text-sm text-teal-700">
                      Votre dossier est en cours de vérification. Un e-mail sera envoyé à{" "}
                      <strong>{formData.email.trim()}</strong> dès que la vérification sera terminée.
                    </p>
                    <p className="mt-2 text-xs text-teal-700">
                      Vous serez redirigé vers la connexion dans 5 secondes.
                    </p>
                  </div>
                ) : (
                  <>
                    {error && (
                      <div className="p-3 mb-4 text-xs font-medium text-red-700 bg-red-100 border border-red-200 rounded-xl text-center">
                        {error}
                      </div>
                    )}

                    <form className="space-y-4" onSubmit={handleSubmit}>
                      {renderStepContent()}

                      <div className="flex items-center justify-between pt-6 border-t border-slate-100 mt-6">
                        <button
                          type="button"
                          onClick={handlePrevStep}
                          disabled={currentStep === 1 || isLoading}
                          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                            currentStep === 1
                              ? "opacity-0 cursor-default"
                              : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                          }`}
                        >
                          Précédent
                        </button>

                        <button
                          type="submit"
                          disabled={isLoading}
                          className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 shadow-md shadow-teal-600/20 transition-all flex items-center gap-2"
                        >
                          {isLoading ? (
                            <span>Traitement...</span>
                          ) : currentStep === 6 ? (
                            <span>Soumettre le dossier</span>
                          ) : (
                            <span>Étape suivante</span>
                          )}
                        </button>
                      </div>
                    </form>
                  </>
                )}
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}