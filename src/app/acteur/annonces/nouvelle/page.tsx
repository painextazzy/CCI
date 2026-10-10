"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Megaphone,
  Send,
  Loader2,
  Calendar,
  MapPin,
  Tag,
  FileText,
} from "lucide-react";

export default function NouvelleAnnoncePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    type: "OFFRE",
    title: "",
    category: "Sous-traitance",
    description: "",
    specificLocation: "",
    deadline: "",
  });

  const categoriesList = [
    "Sous-traitance",
    "Partenariat commercial",
    "Achat groupé",
    "Distribution",
    "Appel d'offres",
    "Co-développement",
  ];

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Utilisation de la variable d'environnement du fichier .env.local
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

      const res = await fetch(`${apiUrl}/announcements`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Indispensable pour transmettre automatiquement le cookie HttpOnly
        body: JSON.stringify({
          ...formData,
          deadline: formData.deadline
            ? new Date(formData.deadline).toISOString()
            : undefined,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(
          errData.message || "Erreur lors de la création de l'annonce"
        );
      }

      // Redirection vers le fil d'actualité après succès
      router.push("/acteur/opportunites");
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue sur le serveur");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pt-4 pb-12 px-4 sm:px-6">
      {/* Bouton retour */}
      <div>
        <Link
          href="/acteur/opportunites"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-emerald-600 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Retour aux opportunités</span>
        </Link>
      </div>

      {/* En-tête */}
      <div className="bg-white p-6 sm:p-8 rounded-[32px] border border-slate-100 shadow-xs space-y-2">
        <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
          <Megaphone className="w-5 h-5" />
        </div>
        <h1 className="text-xl font-extrabold text-slate-950 tracking-tight">
          Publier une nouvelle opportunité B2B
        </h1>
        <p className="text-xs text-slate-500">
          Proposez une offre ou exprimez un besoin de collaboration auprès du
          réseau d'entreprises CCI.
        </p>
      </div>

      {/* Formulaire */}
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 sm:p-8 rounded-[32px] border border-slate-100 shadow-xs space-y-5"
      >
        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700">
            {error}
          </div>
        )}

        {/* Type d'annonce : Offre ou Demande */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Type d'annonce
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: "OFFRE" })}
              className={`py-3 px-4 rounded-2xl text-xs font-bold border transition ${
                formData.type === "OFFRE"
                  ? "bg-emerald-50 border-emerald-500 text-emerald-800 shadow-xs"
                  : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
              }`}
            >
              OFFRE (Je propose)
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: "DEMANDE" })}
              className={`py-3 px-4 rounded-2xl text-xs font-bold border transition ${
                formData.type === "DEMANDE"
                  ? "bg-amber-50 border-amber-500 text-amber-800 shadow-xs"
                  : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
              }`}
            >
              DEMANDE (Je recherche)
            </button>
          </div>
        </div>

        {/* Titre */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-slate-400" />
            Titre de l'opportunité *
          </label>
          <input
            type="text"
            name="title"
            required
            placeholder="Ex: Recherche sous-traitant transformation de thé..."
            value={formData.title}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white transition"
          />
        </div>

        {/* Catégorie */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-slate-400" />
            Format de collaboration *
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:border-emerald-500 focus:bg-white transition cursor-pointer"
          >
            {categoriesList.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Description détaillée *
          </label>
          <textarea
            name="description"
            required
            rows={4}
            placeholder="Décrivez précisément votre besoin, vos critères et vos attentes..."
            value={formData.description}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white transition resize-none"
          />
        </div>

        {/* Localisation & Date limite */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              Localisation spécifique
            </label>
            <input
              type="text"
              name="specificLocation"
              placeholder="Ex: Fianarantsoa, Antsirabe..."
              value={formData.specificLocation}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white transition"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              Date limite de validité
            </label>
            <input
              type="date"
              name="deadline"
              value={formData.deadline}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:border-emerald-500 focus:bg-white transition"
            />
          </div>
        </div>

        {/* Boutons d'action */}
        <div className="pt-4 flex items-center justify-end gap-3">
          <Link
            href="/acteur/opportunites"
            className="px-5 py-3 rounded-2xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
          >
            Annuler
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition active:scale-95 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Publication...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Publier l'annonce</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}