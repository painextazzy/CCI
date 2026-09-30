"use client";

import DragDropUpload from "../components/DragDropUpload";

interface StepProps {
  formData: any;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  handleTypeSelect?: (type: "internal" | "external") => void;
  handleFileSelect?: (name: "kbisFile" | "cinFile", file: File | null) => void;
  companyType?: "internal" | "external";
}

export function Step1({ formData, handleInputChange, handleTypeSelect, companyType }: StepProps) {
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
          onChange={handleInputChange}
          placeholder="Ex. Nexus Technologies SAS"
          className="w-full px-4 py-2.5 bg-slate-50/60 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:border-teal-500 outline-none"
        />
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
            value={formData.nif}
            onChange={handleInputChange}
            placeholder="Ex. 3000123456"
            className="w-full px-4 py-2.5 bg-slate-50/60 border border-slate-200 rounded-xl text-sm font-medium font-mono focus:bg-white focus:border-teal-500 outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
            Numéro STAT <span className="text-teal-600">*</span>
          </label>
          <input
            type="text"
            name="stat"
            required
            value={formData.stat}
            onChange={handleInputChange}
            placeholder="Ex. 62011 31 2023 0 00123"
            className="w-full px-4 py-2.5 bg-slate-50/60 border border-slate-200 rounded-xl text-sm font-medium font-mono focus:bg-white focus:border-teal-500 outline-none"
          />
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
          onChange={handleInputChange}
          placeholder="Ex. Lot II B 12 Ambalapaiso, Fianarantsoa"
          className="w-full px-4 py-2.5 bg-slate-50/60 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:border-teal-500 outline-none"
        />
      </div>
    </div>
  );
}

export function Step2({ formData, handleInputChange }: StepProps) {
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
          onChange={handleInputChange}
          placeholder="Ex. Jean RASOLOFOMANANA"
          className="w-full px-4 py-2.5 bg-slate-50/60 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:border-teal-500 outline-none"
        />
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
            onChange={handleInputChange}
            placeholder="Ex. +261 34 00 000 00"
            className="w-full px-4 py-2.5 bg-slate-50/60 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:border-teal-500 outline-none"
          />
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

export function Step3({ formData, handleInputChange }: StepProps) {
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
        </div>
      </div>
    </div>
  );
}

export function Step4({ companyType, handleFileSelect }: StepProps) {
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
        <>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Extrait Kbis / Registre du Commerce <span className="text-teal-600">*</span>
            </label>
            <DragDropUpload
              accept=".png,.jpg,.jpeg"
              onFileSelect={(file) => handleFileSelect?.("kbisFile", file)}
            />
          </div>


        </>
      )}
    </div>
  );
}

export function Step5({ formData, handleInputChange }: StepProps) {
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
            onChange={handleInputChange}
            placeholder="Ex. Énergies renouvelables, Transport & Logistique..."
            className="w-full px-4 py-2.5 bg-slate-50/60 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:border-teal-500 outline-none"
          />
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
          onChange={handleInputChange}
          placeholder="Décrivez brièvement vos activités principales..."
          className="w-full px-4 py-2.5 bg-slate-50/60 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:border-teal-500 outline-none resize-none"
        />
      </div>
    </div>
  );
}

export function Step6({ formData, handleInputChange }: StepProps) {
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
    </div>
  );
}