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
    >,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

      const res = await fetch(`${apiUrl}/announcements`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
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
          errData.message || "Erreur lors de la création de l'annonce",
        );
      }

      router.push("/acteur/opportunites");
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue sur le serveur");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pt-4 pb-12 px-4 sm:px-6">
      {/* ─── Bouton retour ─── */}
      <div>
        <Link
          href="/acteur/opportunites"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-emerald-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Retour aux opportunités</span>
        </Link>
      </div>

      {/* ─── En-tête ─── */}
      <div data-actor-card className="bg-white p-6 sm:p-8 rounded-[32px] border border-[#F2F2F2] space-y-2">
        <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
          <Megaphone className="w-5 h-5" />
        </div>
        <h1 className="text-xl font-extrabold text-slate-950 tracking-tight">
          Publier une nouvelle opportunité B2B
        </h1>
        <p className="text-xs text-slate-400">
          Proposez une offre ou exprimez un besoin de collaboration auprès du
          réseau d&apos;entreprises CCI.
        </p>
      </div>

      {/* ─── Formulaire ─── */}
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 sm:p-8 rounded-[32px] border border-[#F2F2F2] space-y-5"
      >
        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-[#F2F2F2] text-xs font-semibold text-rose-700">
            {error}
          </div>
        )}

        {/* ─── Type d'annonce : Offre ou Demande ─── */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Type d&apos;annonce
          </label>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: "OFFRE" })}
              className={`py-3 px-4 rounded-2xl text-xs font-bold border transition-colors ${
                formData.type === "OFFRE"
                  ? "bg-emerald-50 border-[#6FCF97] text-emerald-800"
                  : "bg-[#FAFAFA] border-[#F2F2F2] text-slate-500 hover:bg-[#F5F5F5]"
              }`}
            >
              OFFRE (Je propose)
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: "DEMANDE" })}
              className={`py-3 px-4 rounded-2xl text-xs font-bold border transition-colors ${
                formData.type === "DEMANDE"
                  ? "bg-amber-50 border-amber-400 text-amber-800"
                  : "bg-[#FAFAFA] border-[#F2F2F2] text-slate-500 hover:bg-[#F5F5F5]"
              }`}
            >
              DEMANDE (Je recherche)
            </button>
          </div>
        </div>

        {/* ─── Titre ─── */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-slate-400" />
            Titre de l&apos;opportunité *
          </label>
          <input
            type="text"
            name="title"
            required
            placeholder="Ex: Recherche sous-traitant transformation de thé..."
            value={formData.title}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-2xl bg-[#FAFAFA] border border-[#F2F2F2] text-xs font-medium text-slate-800 placeholder-slate-300 focus:outline-none focus:bg-white focus:border-[#6FCF97] transition-colors"
          />
        </div>

        {/* ─── Catégorie ─── */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-slate-400" />
            Format de collaboration *
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-2xl bg-[#FAFAFA] border border-[#F2F2F2] text-xs font-semibold text-slate-700 focus:outline-none focus:bg-white focus:border-[#6FCF97] transition-colors cursor-pointer"
          >
            {categoriesList.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* ─── Description ─── */}
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
            className="w-full px-4 py-3 rounded-2xl bg-[#FAFAFA] border border-[#F2F2F2] text-xs font-medium text-slate-800 placeholder-slate-300 focus:outline-none focus:bg-white focus:border-[#6FCF97] transition-colors resize-none"
          />
        </div>

        {/* ─── Localisation & Date limite ─── */}
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
              className="w-full px-4 py-3 rounded-2xl bg-[#FAFAFA] border border-[#F2F2F2] text-xs font-medium text-slate-800 placeholder-slate-300 focus:outline-none focus:bg-white focus:border-[#6FCF97] transition-colors"
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
              className="w-full px-4 py-3 rounded-2xl bg-[#FAFAFA] border border-[#F2F2F2] text-xs font-semibold text-slate-700 focus:outline-none focus:bg-white focus:border-[#6FCF97] transition-colors"
            />
          </div>
        </div>

        {/* ─── Boutons d'action ─── */}
        <div className="pt-4 flex flex-col-reverse items-stretch justify-end gap-3 sm:flex-row sm:items-center">
          <Link
            href="/acteur/opportunites"
            className="rounded-2xl border border-[#F2F2F2] px-5 py-3 text-center text-xs font-bold text-slate-500 transition-colors hover:bg-[#FAFAFA] sm:text-left"
          >
            Annuler
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-6 py-3 text-xs font-bold text-white transition hover:bg-emerald-700 active:scale-95 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Publication...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Publier l&apos;annonce</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
