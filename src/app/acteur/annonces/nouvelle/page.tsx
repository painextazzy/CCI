"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  HiOutlineArrowLeft,
  HiOutlineMagnifyingGlass,
  HiOutlineMegaphone,
  HiOutlineMapPin,
  HiOutlineCalendarDays,
  HiOutlineTag,
  HiOutlineCheckCircle,
  HiOutlineDocumentText,
  HiOutlineUsers,
} from "react-icons/hi2";

type AnnonceType = "demande" | "offre";

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

  // Formes de collaboration
  const collaborationTypes = [
    "Sous-traitance",
    "Partenariat commercial",
    "Achat groupé",
    "Distribution / Revente",
    "Prestation de service",
    "Co-investissement",
    "Échange de compétences",
    "Autre",
  ];

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // TODO: envoyer à l'API
    setTimeout(() => {
      setIsSubmitting(false);
      router.push("/acteur/annonces");
    }, 1000);
  };

  const config = {
    demande: {
      label: "Demande",
      icon: HiOutlineMagnifyingGlass,
      tagline: "Recherchez un partenaire, un fournisseur ou un service",
      titlePlaceholder: "Ex. Recherche sous-traitant transformation de thé",
      descriptionPlaceholder:
        "Décrivez précisément ce que vous recherchez : produits, services, capacités requises...",
      publishLabel: "Publier la demande",
    },
    offre: {
      label: "Offre",
      icon: HiOutlineMegaphone,
      tagline: "Proposez un produit, un service ou une capacité de production",
      titlePlaceholder: "Ex. Offre de service : développement web pour PME",
      descriptionPlaceholder:
        "Décrivez précisément ce que vous proposez : produits, services, avantages, conditions...",
      publishLabel: "Publier l'offre",
    },
  };

  const currentConfig = config[type];

  return (
    <div className="fixed inset-x-0 top-20 bottom-0 bg-slate-100 p-4 sm:p-6 overflow-hidden">
      <div className="w-full h-full bg-white rounded-2xl border border-slate-200 shadow-lg flex flex-col overflow-hidden">
        {/* En-tête fixe */}
        <div className="px-6 sm:px-8 py-5 border-b border-slate-100 flex items-center justify-between gap-4 shrink-0 bg-white">
          <div className="flex items-center gap-4">
            <Link
              href="/acteur/opportunites"
              aria-label="Retour"
              className="w-10 h-10 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-700 transition shrink-0"
            >
              <HiOutlineArrowLeft className="w-5 h-5" />
            </Link>

            <div>
              <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                Publier une {currentConfig.label.toLowerCase()}
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                {currentConfig.tagline}
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-5 py-2.5 rounded-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition"
            >
              Annuler
            </button>
            <button
              type="submit"
              form="annonce-form"
              disabled={isSubmitting}
              className={`px-6 py-2.5 rounded-full text-white text-xs font-bold shadow-md transition disabled:opacity-50 cursor-pointer ${
                type === "demande"
                  ? "bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 shadow-sky-500/30"
                  : "bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 shadow-emerald-600/30"
              }`}
            >
              {isSubmitting ? "Publication..." : currentConfig.publishLabel}
            </button>
          </div>
        </div>

        {/* Contenu scrollable */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-6 sm:px-8 py-8 space-y-6">
            {/* Sélecteur Demande / Offre */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-3">
                Type d&apos;annonce <span className="text-emerald-600">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setType("demande")}
                  className={`p-4 rounded-2xl border-2 text-left transition-all ${
                    type === "demande"
                      ? "border-sky-500 bg-sky-50/60 shadow-sm"
                      : "border-slate-200 bg-slate-50/50 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                        type === "demande"
                          ? "bg-sky-500 text-white"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      <HiOutlineMagnifyingGlass className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <p className="text-sm font-bold text-slate-800">
                          Demande
                        </p>
                        {type === "demande" && (
                          <HiOutlineCheckCircle className="w-4 h-4 text-sky-500" />
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 leading-snug">
                        Vous recherchez un partenaire, un fournisseur ou un
                        service.
                      </p>
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setType("offre")}
                  className={`p-4 rounded-2xl border-2 text-left transition-all ${
                    type === "offre"
                      ? "border-emerald-600 bg-emerald-50/60 shadow-sm"
                      : "border-slate-200 bg-slate-50/50 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                        type === "offre"
                          ? "bg-emerald-600 text-white"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      <HiOutlineMegaphone className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <p className="text-sm font-bold text-slate-800">
                          Offre
                        </p>
                        {type === "offre" && (
                          <HiOutlineCheckCircle className="w-4 h-4 text-emerald-600" />
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 leading-snug">
                        Vous proposez un produit, un service ou une capacité.
                      </p>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Formulaire */}
            <form
              id="annonce-form"
              onSubmit={handleSubmit}
              className="space-y-5"
            >
              {/* Titre */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                  Titre <span className="text-emerald-600">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  placeholder={currentConfig.titlePlaceholder}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition"
                />
              </div>

              {/* Forme de la collaboration */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                  Forme de la collaboration{" "}
                  <span className="text-emerald-600">*</span>
                </label>
                <div className="relative">
                  <HiOutlineUsers className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
                  <select
                    name="collaboration"
                    required
                    value={formData.collaboration}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition appearance-none cursor-pointer"
                  >
                    <option value="">
                      Sélectionnez une forme de collaboration...
                    </option>
                    {collaborationTypes.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                  Description <span className="text-emerald-600">*</span>
                </label>
                <div className="relative">
                  <HiOutlineDocumentText className="w-4 h-4 absolute left-4 top-4 pointer-events-none text-slate-400" />
                  <textarea
                    name="description"
                    required
                    rows={5}
                    value={formData.description}
                    onChange={handleChange}
                    placeholder={currentConfig.descriptionPlaceholder}
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition resize-none"
                  />
                </div>
              </div>

              {/* Date limite + Localisation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                    Date limite de réponse{" "}
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
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition"
                    />
                  </div>
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
                      required
                      value={formData.location}
                      onChange={handleChange}
                      placeholder="Ex. Fianarantsoa"
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition"
                    />
                  </div>
                </div>
              </div>

              {/* Boutons mobile */}
              <div className="sm:hidden flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-6 py-3 rounded-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-bold transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-8 py-3 rounded-full text-white text-sm font-bold shadow-lg transition disabled:opacity-50 cursor-pointer ${
                    type === "demande"
                      ? "bg-gradient-to-r from-sky-500 to-sky-600 shadow-sky-500/30"
                      : "bg-gradient-to-r from-emerald-600 to-emerald-500 shadow-emerald-600/30"
                  }`}
                >
                  {isSubmitting ? "Publication..." : "Publier"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}