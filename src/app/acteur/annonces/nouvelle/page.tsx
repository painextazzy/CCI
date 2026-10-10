"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  HiOutlineArrowLeft,
  HiOutlineMagnifyingGlass,
  HiOutlineMegaphone,
  HiOutlineMapPin,
  HiOutlineCalendarDays,
  HiOutlineCheckCircle,
  HiOutlineDocumentText,
  HiOutlineUsers,
  HiOutlineSparkles,
  HiOutlineXMark,
} from "react-icons/hi2";

type AnnonceType = "demande" | "offre";

// ─────────────────────────────────────────────────────────
// 🛡️ Utilitaires de nettoyage & validation
// ─────────────────────────────────────────────────────────

/** Supprime les balises HTML/scripts et caractères dangereux */
const sanitizeInput = (value: string): string => {
  return value
    // Supprime les balises HTML
    .replace(/<[^>]*>/g, "")
    // Supprime les entités HTML encodées
    .replace(/&[a-z]+;/gi, "")
    // Supprime les caractères de contrôle (sauf \n et \t pour la description)
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    // Supprime les scripts inline
    .replace(/javascript:/gi, "")
    .replace(/on\w+\s*=/gi, "")
    // Normalise les espaces multiples
    .replace(/\s+/g, " ")
    // Trim
    .trim();
};

/** Nettoyage spécifique pour la description (conserve les sauts de ligne) */
const sanitizeMultiline = (value: string): string => {
  return value
    .replace(/<[^>]*>/g, "")
    .replace(/&[a-z]+;/gi, "")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .replace(/javascript:/gi, "")
    .replace(/on\w+\s*=/gi, "")
    // Limite à 2 sauts de ligne consécutifs
    .replace(/\n{3,}/g, "\n\n")
    // Supprime les espaces en début/fin de ligne
    .split("\n")
    .map((line) => line.trim())
    .join("\n")
    .trim();
};

/** Détecte les tentatives d'injection (patterns suspects) */
const containsSuspiciousPatterns = (value: string): boolean => {
  const patterns = [
    /<script/i,
    /<iframe/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /data:text\/html/i,
    /vbscript:/i,
    /\.\.\//, // path traversal
    /select\s+.*\s+from/i, // SQL injection basique
    /drop\s+table/i,
    /union\s+select/i,
  ];
  return patterns.some((p) => p.test(value));
};

// ─────────────────────────────────────────────────────────

export default function NouvelleAnnoncePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialType = (searchParams.get("type") as AnnonceType) || "demande";

  const [type, setType] = useState<AnnonceType>(initialType);
  const [formData, setFormData] = useState({
    title: "",
    collaboration: "",
    description: "",
    deadline: "",
    location: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitError, setSubmitError] = useState<string>("");

  const collaborationTypes = [
    { value: "Sous-traitance", label: "Sous-traitance", desc: "Production déléguée" },
    { value: "Partenariat commercial", label: "Partenariat commercial", desc: "Alliance stratégique" },
    { value: "Achat groupé", label: "Achat groupé", desc: "Mutualisation des achats" },
    { value: "Distribution / Revente", label: "Distribution / Revente", desc: "Mise sur le marché" },
    { value: "Prestation de service", label: "Prestation de service", desc: "Mission ponctuelle" },
    { value: "Co-investissement", label: "Co-investissement", desc: "Financement partagé" },
    { value: "Échange de compétences", label: "Échange de compétences", desc: "Savoir-faire croisé" },
    { value: "Autre", label: "Autre", desc: "Précisez dans la description" },
  ];

  // ✅ Nettoyage en temps réel à la saisie
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setSubmitError("");

    let cleaned = value;
    if (name === "description") {
      cleaned = sanitizeMultiline(value);
    } else if (name === "title" || name === "location") {
      cleaned = sanitizeInput(value);
    } else if (name === "collaboration") {
      // Vérifie que la valeur fait partie des options autorisées
      const allowed = collaborationTypes.map((c) => c.value);
      cleaned = allowed.includes(value) ? value : "";
    } else if (name === "deadline") {
      // Format date YYYY-MM-DD uniquement
      cleaned = /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : "";
    }

    setFormData((prev) => ({ ...prev, [name]: cleaned }));
  };

  const handleBlur = (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));

    // Nettoyage final au blur (trim plus agressif)
    if (name === "title" || name === "location") {
      setFormData((prev) => ({ ...prev, [name]: sanitizeInput(value) }));
    } else if (name === "description") {
      setFormData((prev) => ({ ...prev, [name]: sanitizeMultiline(value) }));
    }
  };

  // ─────────────────────────────────────────────────────────
  // 🛡️ Validation avancée
  // ─────────────────────────────────────────────────────────
  const validate = useCallback((): Record<string, string> => {
    const errs: Record<string, string> = {};

    // Titre
    const title = formData.title.trim();
    if (!title) {
      errs.title = "Le titre est requis";
    } else if (title.length < 10) {
      errs.title = "Le titre doit contenir au moins 10 caractères";
    } else if (title.length > 100) {
      errs.title = "Le titre ne doit pas dépasser 100 caractères";
    } else if (containsSuspiciousPatterns(title)) {
      errs.title = "Le titre contient des caractères non autorisés";
    } else if (!/[a-zA-ZÀ-ÿ0-9]/.test(title)) {
      errs.title = "Le titre doit contenir au moins une lettre ou un chiffre";
    }

    // Collaboration
    const allowedCollaborations = collaborationTypes.map((c) => c.value);
    if (!formData.collaboration) {
      errs.collaboration = "Veuillez sélectionner une forme de collaboration";
    } else if (!allowedCollaborations.includes(formData.collaboration)) {
      errs.collaboration = "Forme de collaboration invalide";
    }

    // Description
    const desc = formData.description.trim();
    if (!desc) {
      errs.description = "La description est requise";
    } else if (desc.length < 30) {
      errs.description = "La description doit contenir au moins 30 caractères";
    } else if (desc.length > 500) {
      errs.description = "La description ne doit pas dépasser 500 caractères";
    } else if (containsSuspiciousPatterns(desc)) {
      errs.description = "La description contient des caractères non autorisés";
    }

    // Localisation
    const location = formData.location.trim();
    if (!location) {
      errs.location = "La localisation est requise";
    } else if (location.length < 2) {
      errs.location = "La localisation est trop courte";
    } else if (location.length > 100) {
      errs.location = "La localisation ne doit pas dépasser 100 caractères";
    } else if (containsSuspiciousPatterns(location)) {
      errs.location = "La localisation contient des caractères non autorisés";
    } else if (!/^[a-zA-ZÀ-ÿ0-9\s\-',.()]+$/.test(location)) {
      errs.location = "La localisation contient des caractères invalides";
    }

    // Date limite (si renseignée)
    if (formData.deadline) {
      const deadlineDate = new Date(formData.deadline);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (isNaN(deadlineDate.getTime())) {
        errs.deadline = "Date invalide";
      } else if (deadlineDate < today) {
        errs.deadline = "La date limite doit être dans le futur";
      }
    }

    return errs;
  }, [formData]);

  const allErrors = validate();

  // ✅ Affichage conditionnel : erreurs seulement si le champ a été touché OU tentative submit
  const visibleErrors = {
    title: touched.title ? allErrors.title : "",
    collaboration: touched.collaboration ? allErrors.collaboration : "",
    description: touched.description ? allErrors.description : "",
    location: touched.location ? allErrors.location : "",
    deadline: touched.deadline ? allErrors.deadline : "",
  };

  // ✅ Formulaire valide ?
  const isFormValid = Object.keys(allErrors).length === 0;

  // ─────────────────────────────────────────────────────────
  // 🚀 Soumission avec contrôle final
  // ─────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");

    // Marque tous les champs comme touchés pour afficher les erreurs
    setTouched({
      title: true,
      collaboration: true,
      description: true,
      location: true,
      deadline: true,
    });

    // Validation finale
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setSubmitError("Veuillez corriger les erreurs avant de publier.");
      // Scroll vers le premier champ en erreur
      const firstErrorField = Object.keys(errs)[0];
      const el = document.querySelector(`[name="${firstErrorField}"]`);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
      (el as HTMLElement)?.focus();
      return;
    }

    // ✅ Double nettoyage avant envoi (ceinture + bretelles)
    const payload = {
      type,
      title: sanitizeInput(formData.title),
      collaboration: formData.collaboration,
      description: sanitizeMultiline(formData.description),
      deadline: formData.deadline || null,
      location: sanitizeInput(formData.location),
      createdAt: new Date().toISOString(),
    };

    setIsSubmitting(true);
    try {
      // TODO: remplacer par un vrai appel API
      // await fetch("/api/annonces", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify(payload),
      // });

      console.log("📤 Payload nettoyé :", payload);
      await new Promise((r) => setTimeout(r, 1000));
      router.push("/acteur/annonces");
    } catch (err) {
      setSubmitError("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─────────────────────────────────────────────────────────
  // 🎨 Config
  // ─────────────────────────────────────────────────────────
  const config = {
    demande: {
      label: "Demande",
      icon: HiOutlineMagnifyingGlass,
      tagline: "Recherchez un partenaire, un fournisseur ou un service",
      titlePlaceholder: "Ex. Recherche sous-traitant transformation de thé",
      descriptionPlaceholder:
        "Décrivez précisément ce que vous recherchez : produits, services, capacités requises...",
      publishLabel: "Publier la demande",
      ring: "focus:ring-emerald-500/20 focus:border-emerald-500",
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      border: "border-emerald-200",
    },
    offre: {
      label: "Offre",
      icon: HiOutlineMegaphone,
      tagline: "Proposez un produit, un service ou une capacité de production",
      titlePlaceholder: "Ex. Offre de service : développement web pour PME",
      descriptionPlaceholder:
        "Décrivez précisément ce que vous proposez : produits, services, avantages, conditions...",
      publishLabel: "Publier l'offre",
      ring: "focus:ring-emerald-500/20 focus:border-emerald-500",
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      border: "border-emerald-200",
    },
  };

  const currentConfig = config[type];

  const progress = useMemo(() => {
    const fields = ["title", "collaboration", "description", "location"];
    const filled = fields.filter((f) => formData[f as keyof typeof formData]).length;
    return Math.round((filled / fields.length) * 100);
  }, [formData]);

  // ─────────────────────────────────────────────────────────
  // 🖼️ Rendu
  // ─────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-x-0 top-20 bottom-0 bg-gradient-to-br from-slate-50 to-slate-100 p-4 sm:p-6 overflow-hidden">
      <div className="w-full h-full bg-white rounded-2xl border border-slate-200 shadow-lg flex flex-col overflow-hidden">
        {/* ── En-tête ─────────────────────────────────────── */}
        <div className="relative px-6 sm:px-8 py-5 border-b border-slate-100 shrink-0 bg-white overflow-hidden">
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-100">
            <div
              className={`h-full transition-all duration-500 ease-out ${
                isFormValid
                  ? "bg-gradient-to-r from-emerald-400 to-emerald-600"
                  : "bg-gradient-to-r from-emerald-300 to-emerald-500"
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
              <Link
                href="/acteur/opportunites"
                aria-label="Retour"
                className="w-10 h-10 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-700 transition shrink-0 active:scale-95"
              >
                <HiOutlineArrowLeft className="w-5 h-5" />
              </Link>

              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${currentConfig.bg} ${currentConfig.text} ${currentConfig.border} border`}
                  >
                    <currentConfig.icon className="w-3 h-3" />
                    {currentConfig.label}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {progress}% complété
                  </span>
                  {isFormValid && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600">
                      <HiOutlineCheckCircle className="w-3 h-3" />
                      Prêt
                    </span>
                  )}
                </div>
                <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight truncate">
                  Publier une {currentConfig.label.toLowerCase()}
                </h1>
                <p className="text-xs text-slate-500 mt-0.5 truncate">
                  {currentConfig.tagline}
                </p>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-5 py-2.5 rounded-full bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-700 text-xs font-bold transition active:scale-95"
              >
                Annuler
              </button>
              <button
                type="submit"
                form="annonce-form"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-white text-xs font-bold shadow-lg shadow-emerald-600/30 transition disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Publication...
                  </>
                ) : (
                  <>
                    <HiOutlineSparkles className="w-4 h-4" />
                    {currentConfig.publishLabel}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* ── Contenu ─────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-6 sm:px-8 py-8 space-y-8">
            {/* Bandeau d'erreur global */}
            {submitError && (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-4 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center shrink-0 text-red-600">
                  <HiOutlineXMark className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-red-700 mb-0.5">
                    Impossible de publier
                  </p>
                  <p className="text-[11px] text-red-600">{submitError}</p>
                </div>
              </div>
            )}

            {/* Sélecteur Type */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <span className="w-1 h-5 rounded-full bg-emerald-600" />
                <h2 className="text-sm font-bold text-slate-900">
                  Type d&apos;annonce
                </h2>
                <span className="text-emerald-600 text-sm">*</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(["demande", "offre"] as AnnonceType[]).map((t) => {
                  const Icon =
                    t === "demande"
                      ? HiOutlineMagnifyingGlass
                      : HiOutlineMegaphone;
                  const isActive = type === t;

                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setType(t)}
                      className={`relative p-4 rounded-2xl border-2 text-left transition-all duration-200 active:scale-[0.98] ${
                        isActive
                          ? "border-emerald-600 bg-emerald-50/70 shadow-md shadow-emerald-600/10"
                          : "border-slate-200 bg-slate-50/50 hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200 ${
                            isActive
                              ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 mb-1">
                            <p className="text-sm font-bold text-slate-800">
                              {t === "demande" ? "Demande" : "Offre"}
                            </p>
                            {isActive && (
                              <HiOutlineCheckCircle className="w-4 h-4 text-emerald-600" />
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 leading-snug">
                            {t === "demande"
                              ? "Vous recherchez un partenaire, un fournisseur ou un service."
                              : "Vous proposez un produit, un service ou une capacité."}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Formulaire */}
            <form id="annonce-form" onSubmit={handleSubmit} className="space-y-8" noValidate>
              {/* Informations principales */}
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-1 h-5 rounded-full bg-emerald-600" />
                  <h2 className="text-sm font-bold text-slate-900">
                    Informations principales
                  </h2>
                </div>

                <div className="space-y-5">
                  {/* Titre */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                        Titre <span className="text-emerald-600">*</span>
                      </label>
                      <span
                        className={`text-[10px] font-medium ${
                          formData.title.length > 80
                            ? "text-amber-600"
                            : "text-slate-400"
                        }`}
                      >
                        {formData.title.length}/100
                      </span>
                    </div>
                    <input
                      type="text"
                      name="title"
                      maxLength={100}
                      value={formData.title}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder={currentConfig.titlePlaceholder}
                      autoComplete="off"
                      spellCheck
                      className={`w-full px-4 py-3 rounded-xl border bg-slate-50 text-slate-800 text-sm transition outline-none focus:bg-white focus:ring-2 ${currentConfig.ring} ${
                        visibleErrors.title
                          ? "border-red-300 bg-red-50/50"
                          : "border-slate-200"
                      }`}
                    />
                    {visibleErrors.title && (
                      <p className="mt-1.5 text-[11px] text-red-600 font-medium flex items-center gap-1">
                        <HiOutlineXMark className="w-3 h-3" />
                        {visibleErrors.title}
                      </p>
                    )}
                  </div>

                  {/* Forme de collaboration */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                      Forme de la collaboration{" "}
                      <span className="text-emerald-600">*</span>
                    </label>
                    <div className="relative">
                      <HiOutlineUsers className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
                      <select
                        name="collaboration"
                        value={formData.collaboration}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`w-full pl-11 pr-10 py-3 rounded-xl border bg-slate-50 text-slate-800 text-sm transition outline-none focus:bg-white focus:ring-2 appearance-none cursor-pointer ${currentConfig.ring} ${
                          visibleErrors.collaboration
                            ? "border-red-300 bg-red-50/50"
                            : "border-slate-200"
                        }`}
                      >
                        <option value="">
                          Sélectionnez une forme de collaboration...
                        </option>
                        {collaborationTypes.map((c) => (
                          <option key={c.value} value={c.value}>
                            {c.label}
                          </option>
                        ))}
                      </select>
                      <svg
                        className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                    {formData.collaboration && !visibleErrors.collaboration && (
                      <p className="mt-2 text-[11px] text-slate-500 italic flex items-center gap-1.5">
                        <HiOutlineSparkles className="w-3 h-3 text-emerald-500" />
                        {
                          collaborationTypes.find(
                            (c) => c.value === formData.collaboration
                          )?.desc
                        }
                      </p>
                    )}
                    {visibleErrors.collaboration && (
                      <p className="mt-1.5 text-[11px] text-red-600 font-medium flex items-center gap-1">
                        <HiOutlineXMark className="w-3 h-3" />
                        {visibleErrors.collaboration}
                      </p>
                    )}
                  </div>

                  {/* Description */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                        Description <span className="text-emerald-600">*</span>
                      </label>
                      <span
                        className={`text-[10px] font-medium ${
                          formData.description.length > 450
                            ? "text-amber-600"
                            : "text-slate-400"
                        }`}
                      >
                        {formData.description.length}/500
                      </span>
                    </div>
                    <div className="relative">
                      <HiOutlineDocumentText className="w-4 h-4 absolute left-4 top-4 pointer-events-none text-slate-400" />
                      <textarea
                        name="description"
                        rows={5}
                        maxLength={500}
                        value={formData.description}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder={currentConfig.descriptionPlaceholder}
                        spellCheck
                        className={`w-full pl-11 pr-4 py-3 rounded-xl border bg-slate-50 text-slate-800 text-sm transition outline-none focus:bg-white focus:ring-2 resize-none ${currentConfig.ring} ${
                          visibleErrors.description
                            ? "border-red-300 bg-red-50/50"
                            : "border-slate-200"
                        }`}
                      />
                    </div>
                    {visibleErrors.description && (
                      <p className="mt-1.5 text-[11px] text-red-600 font-medium flex items-center gap-1">
                        <HiOutlineXMark className="w-3 h-3" />
                        {visibleErrors.description}
                      </p>
                    )}
                  </div>
                </div>
              </section>

              {/* Détails pratiques */}
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-1 h-5 rounded-full bg-emerald-600" />
                  <h2 className="text-sm font-bold text-slate-900">
                    Détails pratiques
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                      Date limite{" "}
                      <span className="text-slate-400 font-medium normal-case">
                        (facultative)
                      </span>
                    </label>
                    <div className="relative">
                      <HiOutlineCalendarDays className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
                      <input
                        type="date"
                        name="deadline"
                        value={formData.deadline}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        min={new Date().toISOString().split("T")[0]}
                        className={`w-full pl-11 pr-4 py-3 rounded-xl border bg-slate-50 text-slate-800 text-sm transition outline-none focus:bg-white focus:ring-2 ${currentConfig.ring} ${
                          visibleErrors.deadline
                            ? "border-red-300 bg-red-50/50"
                            : "border-slate-200"
                        }`}
                      />
                    </div>
                    {visibleErrors.deadline && (
                      <p className="mt-1.5 text-[11px] text-red-600 font-medium flex items-center gap-1">
                        <HiOutlineXMark className="w-3 h-3" />
                        {visibleErrors.deadline}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                      Localisation <span className="text-emerald-600">*</span>
                    </label>
                    <div className="relative">
                      <HiOutlineMapPin className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
                      <input
                        type="text"
                        name="location"
                        maxLength={100}
                        value={formData.location}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="Ex. Fianarantsoa"
                        autoComplete="off"
                        className={`w-full pl-11 pr-4 py-3 rounded-xl border bg-slate-50 text-slate-800 text-sm transition outline-none focus:bg-white focus:ring-2 ${currentConfig.ring} ${
                          visibleErrors.location
                            ? "border-red-300 bg-red-50/50"
                            : "border-slate-200"
                        }`}
                      />
                    </div>
                    {visibleErrors.location && (
                      <p className="mt-1.5 text-[11px] text-red-600 font-medium flex items-center gap-1">
                        <HiOutlineXMark className="w-3 h-3" />
                        {visibleErrors.location}
                      </p>
                    )}
                  </div>
                </div>
              </section>

              {/* Boutons mobile */}
              <div className="sm:hidden flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-6 py-3 rounded-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-bold transition active:scale-95"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 px-8 py-3 rounded-full text-white text-sm font-bold shadow-lg shadow-emerald-600/30 transition disabled:opacity-50 active:scale-95 bg-gradient-to-r from-emerald-600 to-emerald-500"
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      Publication...
                    </>
                  ) : (
                    <>
                      <HiOutlineSparkles className="w-4 h-4" />
                      Publier
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}