"use client";

import { use } from "react";
import Link from "next/link";
import {
  HiOutlineArrowLeft,
  HiOutlineMapPin,
  HiOutlineCheckBadge,
  HiOutlineEnvelope,
  HiOutlinePhone,
  HiOutlineGlobeAlt,
  HiOutlineBuildingOffice2,
} from "react-icons/hi2";

export default function PartnerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  // Simulation d'une récupération
  const partner = {
    id,
    name: "AgriBio Madagascar",
    sector: "Agro-business",
    location: "BP 1420, Fianarantsoa",
    description:
      "Producteur certifié de thé d'altitude. Partenariats industriels pour la transformation et l'export.",
    email: "contact@agribio.mg",
    phone: "+261 34 12 345 67",
    website: "https://agribio.mg",
    specialties: ["Thé", "Bio", "Export", "Transformation"],
    initials: "AB",
    color: "from-emerald-500 to-emerald-700",
  };

  return (
    <div className="space-y-6">
      {/* Retour */}
      <Link
        href="/acteur/partenaires"
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-emerald-600 transition"
      >
        <HiOutlineArrowLeft className="w-4 h-4" />
        Retour aux partenaires
      </Link>

      {/* Carte principale */}
      <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 shadow-[0_4px_25px_-4px_rgba(15,23,42,0.06)]">
        {/* En-tête */}
        <div className="flex items-start gap-4 mb-6">
          <div
            className={`w-16 h-16 rounded-full bg-gradient-to-br ${partner.color} flex items-center justify-center text-white font-bold text-lg shadow-md shrink-0`}
          >
            {partner.initials}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-xl font-extrabold text-slate-900">
                {partner.name}
              </h1>
              <HiOutlineCheckBadge className="w-5 h-5 text-emerald-500" />
            </div>
            <p className="text-sm text-slate-500 mb-2">{partner.sector}</p>
            <div className="flex items-center gap-1 text-xs text-slate-400">
              <HiOutlineMapPin className="w-3.5 h-3.5" />
              {partner.location}
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-slate-600 leading-relaxed mb-6">
          {partner.description}
        </p>

        {/* Spécialités */}
        <div className="mb-6">
          <h3 className="text-[11px] uppercase tracking-wider font-bold text-slate-400 mb-2">
            Spécialités
          </h3>
          <div className="flex flex-wrap gap-2">
            {partner.specialties.map((spec) => (
              <span
                key={spec}
                className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-50 text-slate-600 border border-slate-100"
              >
                {spec}
              </span>
            ))}
          </div>
        </div>

        {/* Contact */}
        <div className="pt-4 border-t border-slate-100 space-y-3">
          <h3 className="text-[11px] uppercase tracking-wider font-bold text-slate-400">
            Contact
          </h3>
          <a
            href={`mailto:${partner.email}`}
            className="flex items-center gap-2 text-sm text-slate-700 hover:text-emerald-600 transition"
          >
            <HiOutlineEnvelope className="w-4 h-4 text-slate-400" />
            {partner.email}
          </a>
          <a
            href={`tel:${partner.phone}`}
            className="flex items-center gap-2 text-sm text-slate-700 hover:text-emerald-600 transition"
          >
            <HiOutlinePhone className="w-4 h-4 text-slate-400" />
            {partner.phone}
          </a>
          <a
            href={partner.website}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-slate-700 hover:text-emerald-600 transition"
          >
            <HiOutlineGlobeAlt className="w-4 h-4 text-slate-400" />
            {partner.website}
          </a>
        </div>

        {/* Actions */}
        <div className="pt-6 mt-6 border-t border-slate-100 flex gap-2">
          <button className="flex-1 px-4 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold transition shadow-md shadow-emerald-600/20">
            Contacter
          </button>
          <button className="px-4 py-3 rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-bold transition">
            Ajouter aux favoris
          </button>
        </div>
      </div>
    </div>
  );
}