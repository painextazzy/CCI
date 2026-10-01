"use client";

import DragDropUpload from "../components/DragDropUpload";

// Nettoyage des caractères spéciaux autorisant lettres (avec accents), chiffres, espaces, apostrophes et tirets
export const sanitizeText = (val: string): string => {
  return val.replace(/[^a-zA-Z0-9àâäéèêëîïôöùûüçÀÂÄÉÈÊËÎÏÔÖÙÛÜÇ\s'\.-]/g, "");
};

// Validation Email strict
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

// Téléphone : Max 13 chiffres (accepte le + au début ou aucun +)
export const isValidPhone = (phone: string): boolean => {
  const cleanPhone = phone.trim();
  const phoneRegex = /^\+?[0-9]{1,13}$/;
  const digitsOnly = cleanPhone.replace(/\D/g, "");
  return phoneRegex.test(cleanPhone) && digitsOnly.length <= 13 && digitsOnly.length >= 8;
};

// NIF et STAT : Exactement 10 chiffres et valeur supérieure à 0
export const isValid10Digits = (val: string): boolean => {
  const clean = val.trim();
  if (!/^\d{10}$/.test(clean)) return false;
  return parseInt(clean, 10) > 0;
};

// Vérification globale de la validité d'une étape (À utiliser dans le composant Parent avant de passer à l'étape suivante)
export const validateStep = (
  step: number,
  formData: any,
  files?: { kbisFile?: File | null }
): { isValid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};

  if (step === 1) {
    if (!formData.companyType) errors.companyType = "Veuillez sélectionner un type d'établissement.";
    if (!formData.companyName?.trim()) errors.companyName = "La raison sociale est requise.";
    if (!isValid10Digits(formData.nif || "")) errors.nif = "Le NIF doit comporter exactement 10 chiffres et être > 0.";
    if (!isValid10Digits(formData.stat || "")) errors.stat = "Le STAT doit comporter exactement 10 chiffres et être > 0.";
    if (!formData.address?.trim()) errors.address = "L'adresse du siège social est requise.";
  }

  if (step === 2) {
    if (!formData.managerName?.trim()) errors.managerName = "Le nom du dirigeant est requis.";
    if (!formData.managerRole) errors.managerRole = "Le rôle est requis.";
    if (!isValidPhone(formData.phone || "")) errors.phone = "Numéro invalide (max 13 chiffres, + optionnel).";
  }

  if (step === 3) {
    if (!isValidEmail(formData.email || "")) errors.email = "Format d'adresse e-mail invalide.";
    if (!formData.password || formData.password.length < 6) errors.password = "Le mot de passe doit faire au moins 6 caractères.";
    if (formData.password !== formData.confirmPassword) errors.confirmPassword = "Les mots de passe ne correspondent pas.";
  }

  if (step === 4) {
    if (formData.companyType === "external" && !files?.kbisFile) {
      errors.kbisFile = "Le justificatif Kbis est obligatoire pour les entreprises externes.";
    }
  }

  if (step === 5) {
    if (!formData.sector) errors.sector = "Le secteur d'activité est requis.";
    if (formData.sector === "AUTRE" && !formData.sectorOther?.trim()) errors.sectorOther = "Veuillez préciser votre secteur.";
    if (!formData.needsDescription?.trim()) errors.needsDescription = "La description est requise.";
  }

  if (step === 6) {
    if (!formData.agreedTerms) errors.agreedTerms = "Vous devez accepter les conditions d'utilisation.";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// INTERFACES & PROPS
interface StepProps {
  formData: any;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  handleTypeSelect?: (type: "internal" | "external") => void;
  handleFileSelect?: (name: "kbisFile" | "cinFile", file: File | null) => void;
  companyType?: "internal" | "external";
  errors?: Record<string, string>;
}


// COMPOSANTS DES ÉTAPES DU FORMULAIRE
export function Step1({ formData, handleInputChange, handleTypeSelect, companyType, errors }: StepProps) {
  // Handler pour assainir la saisie texte et limiter les entrées numériques
  const onChangeWithSanitize = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let cleanValue = value;

    if (name === "companyName" || name === "address") {
      cleanValue = sanitizeText(value);
    } else if (name === "nif" || name === "stat") {
      cleanValue = value.replace(/\D/g, "").slice(0, 10);
    }

    e.target.value = cleanValue;
    handleInputChange(e);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
          Type d&apos;établissement <span className="text-teal-600">*</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div
            onClick={() => handleTypeSelect?.("internal")}
            className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-3 ${
              companyType === "internal"
                ? "border-teal-600 bg-teal-50/60 shadow-sm"
                : "border-slate-200 bg-slate-50/50 hover:border-slate-300"
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full border-2 mt-0.5 flex items-center justify-center shrink-0 ${
                companyType === "internal" ? "border-teal-600 bg-teal-600" : "border-slate-300"
              }`}
            >
              {companyType === "internal" && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">Entreprise Locale / Interne</p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Basée en Haute Matsiatra. Vérification directe via NIF &amp; STAT.
              </p>
            </div>
          </div>

          <div
            onClick={() => handleTypeSelect?.("external")}
            className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-3 ${
              companyType === "external"
                ? "border-teal-600 bg-teal-50/60 shadow-sm"
                : "border-slate-200 bg-slate-50/50 hover:border-slate-300"
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full border-2 mt-0.5 flex items-center justify-center shrink-0 ${
                companyType === "external" ? "border-teal-600 bg-teal-600" : "border-slate-300"
              }`}
            >
              {companyType === "external" && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">Entreprise Externe / Partenaire</p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Hors région ou internationale. Justificatif Kbis obligatoire.
              </p>
            </div>
          </div>
        </div>
        {errors?.companyType && <p className="text-[11px] text-red-500 mt-1">{errors.companyType}</p>}
      </div>

      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
          Raison sociale / Nom commercial <span className="text-teal-600">*</span>
        </label>
        <input
          type="text"
          name="companyName"
          required
          value={formData.companyName}
          onChange={onChangeWithSanitize}
          placeholder="Ex. Nexus Technologies SAS"
          className="w-full px-4 py-2.5 bg-slate-50/60 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:border-teal-500 outline-none"
        />
        {errors?.companyName && <p className="text-[11px] text-red-500 mt-1">{errors.companyName}</p>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
            Numéro NIF <span className="text-teal-600">*</span>
          </label>
          <input
            type="text"
            name="nif"
            required
            maxLength={10}
            value={formData.nif}
            onChange={onChangeWithSanitize}
            placeholder="Ex. 3000123456"
            className="w-full px-4 py-2.5 bg-slate-50/60 border border-slate-200 rounded-xl text-sm font-medium font-mono focus:bg-white focus:border-teal-500 outline-none"
          />
          {errors?.nif && <p className="text-[11px] text-red-500 mt-1">{errors.nif}</p>}
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
            Numéro STAT <span className="text-teal-600">*</span>
          </label>
          <input
            type="text"
            name="stat"
            required
            maxLength={10}
            value={formData.stat}
            onChange={onChangeWithSanitize}
            placeholder="Ex. 6201131202"
            className="w-full px-4 py-2.5 bg-slate-50/60 border border-slate-200 rounded-xl text-sm font-medium font-mono focus:bg-white focus:border-teal-500 outline-none"
          />
          {errors?.stat && <p className="text-[11px] text-red-500 mt-1">{errors.stat}</p>}
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
          Adresse du siège social <span className="text-teal-600">*</span>
        </label>
        <input
          type="text"
          name="address"
          required
          value={formData.address}
          onChange={onChangeWithSanitize}
          placeholder="Ex. Lot II B 12 Ambalapaiso, Fianarantsoa"
          className="w-full px-4 py-2.5 bg-slate-50/60 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:border-teal-500 outline-none"
        />
        {errors?.address && <p className="text-[11px] text-red-500 mt-1">{errors.address}</p>}
      </div>
    </div>
  );
}

export function Step2({ formData, handleInputChange, errors }: StepProps) {
  const onChangeWithSanitize = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let cleanValue = value;

    if (name === "managerName") {
      cleanValue = sanitizeText(value);
    } else if (name === "phone") {
      // Conserve uniquement le + initial et les chiffres (max 13 chiffres)
      const hasPlus = value.startsWith("+");
      const digits = value.replace(/\D/g, "").slice(0, 13);
      cleanValue = (hasPlus ? "+" : "") + digits;
    }

    e.target.value = cleanValue;
    handleInputChange(e);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
          Nom et Prénom(s) du Dirigeant / Représentant <span className="text-teal-600">*</span>
        </label>
        <input
          type="text"
          name="managerName"
          required
          value={formData.managerName}
          onChange={onChangeWithSanitize}
          placeholder="Ex. Jean RASOLOFOMANANA"
          className="w-full px-4 py-2.5 bg-slate-50/60 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:border-teal-500 outline-none"
        />
        {errors?.managerName && <p className="text-[11px] text-red-500 mt-1">{errors.managerName}</p>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
            Fonction / Rôle <span className="text-teal-600">*</span>
          </label>
          <select
            name="managerRole"
            value={formData.managerRole}
            onChange={handleInputChange}
            className="w-full px-4 py-2.5 bg-slate-50/60 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:border-teal-500 outline-none"
          >
            <option value="Gérant">Gérant / Fondateur</option>
            <option value="Directeur Général">Directeur Général</option>
            <option value="Président">Président / Administrateur</option>
            <option value="Représentant Légal">Représentant Légal</option>
          </select>
          {errors?.managerRole && <p className="text-[11px] text-red-500 mt-1">{errors.managerRole}</p>}
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
            Téléphone / Whatsapp <span className="text-teal-600">*</span>
          </label>
          <input
            type="tel"
            name="phone"
            required
            value={formData.phone}
            onChange={onChangeWithSanitize}
            placeholder="Ex. +261340000000"
            className="w-full px-4 py-2.5 bg-slate-50/60 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:border-teal-500 outline-none"
          />
          {errors?.phone && <p className="text-[11px] text-red-500 mt-1">{errors.phone}</p>}
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
          Site Web / Page Facebook Officielle
        </label>
        <input
          type="url"
          name="website"
          value={formData.website}
          onChange={handleInputChange}
          placeholder="Ex. https://mon-entreprise.mg"
          className="w-full px-4 py-2.5 bg-slate-50/60 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:border-teal-500 outline-none"
        />
      </div>
    </div>
  );
}

export function Step3({ formData, handleInputChange, errors }: StepProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
          Adresse e-mail professionnelle <span className="text-teal-600">*</span>
        </label>
        <input
          type="email"
          name="email"
          required
          value={formData.email}
          onChange={handleInputChange}
          placeholder="Ex. contact@mon-entreprise.mg"
          className="w-full px-4 py-2.5 bg-slate-50/60 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:border-teal-500 outline-none"
        />
        {errors?.email && <p className="text-[11px] text-red-500 mt-1">{errors.email}</p>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
            Mot de passe <span className="text-teal-600">*</span>
          </label>
          <input
            type="password"
            name="password"
            required
            value={formData.password}
            onChange={handleInputChange}
            placeholder="••••••••"
            className="w-full px-4 py-2.5 bg-slate-50/60 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:border-teal-500 outline-none"
          />
          {errors?.password && <p className="text-[11px] text-red-500 mt-1">{errors.password}</p>}
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
            Confirmer le mot de passe <span className="text-teal-600">*</span>
          </label>
          <input
            type="password"
            name="confirmPassword"
            required
            value={formData.confirmPassword}
            onChange={handleInputChange}
            placeholder="••••••••"
            className="w-full px-4 py-2.5 bg-slate-50/60 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:border-teal-500 outline-none"
          />
          {errors?.confirmPassword && <p className="text-[11px] text-red-500 mt-1">{errors.confirmPassword}</p>}
        </div>
      </div>
    </div>
  );
}

export function Step4({ companyType, handleFileSelect, errors }: StepProps) {
  return (
    <div className="space-y-4">
      {companyType === "internal" ? (
        <div className="p-4 bg-teal-50 border border-teal-200 rounded-2xl text-xs text-teal-800 space-y-2">
          <p className="font-bold flex items-center gap-2">
            <svg
              className="w-4 h-4 text-teal-600"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Dispense de pièces justificatives
          </p>
          <p>
            En tant qu&apos;entreprise immatriculée à la CCI Haute Matsiatra, vos informations seront vérifiées
            directement à partir des numéros NIF et STAT fournis.
          </p>
        </div>
      ) : (
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
            Extrait Kbis / Registre du Commerce <span className="text-teal-600">*</span>
          </label>
          <DragDropUpload
            accept=".png,.jpg,.jpeg"
            onFileSelect={(file) => handleFileSelect?.("kbisFile", file)}
          />
          {errors?.kbisFile && <p className="text-[11px] text-red-500 mt-1">{errors.kbisFile}</p>}
        </div>
      )}
    </div>
  );
}

export function Step5({ formData, handleInputChange, errors }: StepProps) {
  const onChangeWithSanitize = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    let cleanValue = sanitizeText(value);

    e.target.value = cleanValue;
    handleInputChange(e);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
          Secteur d&apos;activité principal <span className="text-teal-600">*</span>
        </label>
        <select
          name="sector"
          value={formData.sector}
          onChange={handleInputChange}
          className="w-full px-4 py-2.5 bg-slate-50/60 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:border-teal-500 outline-none"
        >
          <option value="AGRO">Agroalimentaire &amp; Agriculture</option>
          <option value="NTIC">NTIC, Web &amp; Services Digitaux</option>
          <option value="BTP">BTP, Construction &amp; Matériaux</option>
          <option value="TOURISM">Hôtellerie, Tourisme &amp; Artisanat</option>
          <option value="COMMERCE">Commerce de Gros &amp; Distribution</option>
          <option value="AUTRE">Autre (préciser)</option>
        </select>
        {errors?.sector && <p className="text-[11px] text-red-500 mt-1">{errors.sector}</p>}
      </div>

      {formData.sector === "AUTRE" && (
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
            Précisez votre secteur d&apos;activité <span className="text-teal-600">*</span>
          </label>
          <input
            type="text"
            name="sectorOther"
            value={formData.sectorOther}
            onChange={onChangeWithSanitize}
            placeholder="Ex. Énergies renouvelables, Transport & Logistique..."
            className="w-full px-4 py-2.5 bg-slate-50/60 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:border-teal-500 outline-none"
          />
          {errors?.sectorOther && <p className="text-[11px] text-red-500 mt-1">{errors.sectorOther}</p>}
        </div>
      )}

      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
          Description de votre activité <span className="text-teal-600">*</span>
        </label>
        <textarea
          name="needsDescription"
          rows={3}
          value={formData.needsDescription}
          onChange={onChangeWithSanitize}
          placeholder="Décrivez brièvement vos activités principales..."
          className="w-full px-4 py-2.5 bg-slate-50/60 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:border-teal-500 outline-none resize-none"
        />
        {errors?.needsDescription && <p className="text-[11px] text-red-500 mt-1">{errors.needsDescription}</p>}
      </div>
    </div>
  );
}

export function Step6({ formData, handleInputChange, errors }: StepProps) {
  return (
    <div className="space-y-4">
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-2">
        <p className="font-bold text-slate-800">Validation &amp; Charte Éthique</p>
        <p className="text-slate-600 leading-relaxed">
          En soumettant votre dossier à la CCI Haute Matsiatra, vous certifiez l&apos;exactitude des données transmises.
        </p>
      </div>

      <label className="flex items-start gap-3 cursor-pointer p-1">
        <input
          type="checkbox"
          name="agreedTerms"
          checked={formData.agreedTerms}
          onChange={handleInputChange}
          className="mt-0.5 w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
        />
        <span className="text-xs font-medium text-slate-600 leading-snug">
          J&apos;accepte les conditions d&apos;utilisation et atteste sur l&apos;honneur la véracité des informations fournie.
        </span>
      </label>
      {errors?.agreedTerms && <p className="text-[11px] text-red-500 mt-1">{errors.agreedTerms}</p>}
    </div>
  );
}