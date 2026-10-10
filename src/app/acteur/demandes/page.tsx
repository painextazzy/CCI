"use client";

import { useState } from "react";
import {
  Search,
  Clock,
  MapPin,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Inbox,
  XCircle,
} from "lucide-react";

interface Demande {
  id: number;
  type: "RECEIVED" | "SENT";
  company: string;
  role: string;
  location: string;
  email?: string;
  phone?: string;
  category: string;
  demandeType: string;
  timeAgo: string;
  budget: string;
  deadline: string;
  status: "En attente" | "Acceptée" | "En cours" | "Refusée";
  title: string;
  description: string;
  tags: string[];
  avatar: string;
}

export default function DemandesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");

  const categories = [
    "Agro-business",
    "Export & Commerce",
    "Artisanat & Création",
    "Tourisme & Hôtellerie",
    "Industrie & Manufacture",
    "Énergie & Tech",
  ];

  const demandes: Demande[] = [
    {
      id: 1,
      type: "RECEIVED",
      company: "AgriBio Madagascar",
      role: "Producteur Certifié | Thé d'altitude",
      location: "BP 1420, Fianarantsoa",
      email: "contact@agribio.mg",
      category: "Agro-business",
      demandeType: "Sous-traitance",
      timeAgo: "Il y a 2h",
      budget: "50 – 120 M Ar",
      deadline: "30 juin 2025",
      status: "En attente",
      title: "Recherche sous-traitant transformation de thé",
      description:
        "Mise en place d'un partenariat industriel pour l'usinage, le séchage contrôlé et le conditionnement hermétique de nos récoltes de thé d'altitude aux normes internationales.",
      tags: ["#AgroIndustrie", "#NormesBio", "#Séchage"],
      avatar:
        "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80",
    },
    {
      id: 2,
      type: "RECEIVED",
      company: "Bourbon Exporters S.A.",
      role: "Négoce & Export International | Café d'origine",
      location: "RN7 Ambalavao, Madagascar",
      phone: "+261 34 12 345 67",
      category: "Export & Commerce",
      demandeType: "Partenariat export",
      timeAgo: "Il y a 5h",
      budget: "Sur devis",
      deadline: "15 juillet 2025",
      status: "Acceptée",
      title: "Partenaire distribution café Bourbon – Europe",
      description:
        "Recherche d'un distributeur B2B spécialisé dans l'épicerie fine et torréfacteurs en France et Allemagne pour l'écoulement de 120 tonnes de café bourbon pointu.",
      tags: ["#ExportEurope", "#CaféBourbon", "#DistributionB2B"],
      avatar:
        "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&q=80",
    },
    {
      id: 4,
      type: "RECEIVED",
      company: "Ranomafana EcoTours",
      role: "Opérateur Tourisme Durable | Hébergement éco",
      location: "Entrée Parc National, Vohibato",
      phone: "+261 32 45 789 01",
      category: "Tourisme & Hôtellerie",
      demandeType: "Appel d'offres",
      timeAgo: "Il y a 1j",
      budget: "80 – 200 M Ar",
      deadline: "10 juillet 2025",
      status: "En attente",
      title: "Prestataire écotourisme – Parc Ranomafana",
      description:
        "Sélection d'opérateurs réceptifs certifiés pour la création de circuits guidés nocturnes et séjours d'immersion écologique responsables.",
      tags: ["#Écotourisme", "#CircuitsGuidés", "#TourismeDurable"],
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    },
    {
      id: 5,
      type: "RECEIVED",
      company: "MecaPrecision Océan Indien",
      role: "Atelier Industriel Homologué | Découpe & mécano-soudure",
      location: "Zone Industrielle, Antsirabe",
      email: "contact@mecaprecision.mg",
      category: "Industrie & Manufacture",
      demandeType: "Sous-traitance",
      timeAgo: "Il y a 2j",
      budget: "100 – 250 M Ar",
      deadline: "5 août 2025",
      status: "Refusée",
      title: "Sous-traitant usinage de précision & découpe laser",
      description:
        "Recherche d'un atelier partenaire équipé de machines CNC et laser fibre pour la prise en charge d'un surplus de commandes de pièces en acier inoxydable.",
      tags: ["#UsinageCNC", "#DécoupeLaser", "#Métallurgie"],
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
    },
  ];

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { color: string; dot: string }> = {
      "En attente": {
        color: "bg-amber-50 text-amber-700 border-amber-200",
        dot: "bg-amber-500",
      },
      Acceptée: {
        color: "bg-emerald-50 text-emerald-700 border-emerald-200",
        dot: "bg-emerald-500",
      },
      "En cours": {
        color: "bg-blue-50 text-blue-700 border-blue-200",
        dot: "bg-blue-500",
      },
      Refusée: {
        color: "bg-rose-50 text-rose-700 border-rose-200",
        dot: "bg-rose-500",
      },
    };
    return badges[status] || badges["En attente"];
  };

  const filteredDemandes = demandes.filter((demande) => {
    const matchesCategory =
      selectedCategory === "ALL" || demande.category === selectedCategory;

    const matchesSearch =
      demande.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      demande.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      demande.company.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      selectedStatus === "ALL" || demande.status === selectedStatus;

    return matchesCategory && matchesSearch && matchesStatus;
  });

  // Filtres rapides (segmented control)
  const quickFilters: {
    value: string;
    label: string;
    icon: any;
  }[] = [
    { value: "Acceptée", label: "Acceptées", icon: CheckCircle2 },
    { value: "Refusée", label: "Refusées", icon: XCircle },
  ];

  return (
    <div className="space-y-4">
      {/* Barre de recherche + filtres */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
        {/* Recherche */}
        <div className="relative flex-1 lg:max-w-md">
          <Search
            className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400"
            strokeWidth={2.2}
          />
          <input
            type="text"
            placeholder="Rechercher une demande..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-xl bg-white border border-slate-200 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
          />
        </div>

        {/* Filtres rapides (Acceptée / Refusée) */}
        <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200 shadow-sm w-fit">
          {quickFilters.map((f) => {
            const Icon = f.icon;
            const active = selectedStatus === f.value;
            const isAccept = f.value === "Acceptée";
            return (
              <button
                key={f.value}
                type="button"
                onClick={() =>
                  setSelectedStatus(active ? "ALL" : f.value)
                }
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition active:scale-95 ${
                  active
                    ? isAccept
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "bg-rose-600 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Icon className="w-3.5 h-3.5" strokeWidth={2.5} />
                {f.label}
              </button>
            );
          })}
        </div>

        {/* Filtre Secteur */}
        <div className="relative">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="pl-4 pr-9 py-3 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 appearance-none cursor-pointer transition"
          >
            <option value="ALL">Tous les secteurs</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          <ChevronDown
            className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400"
            strokeWidth={2.5}
          />
        </div>

        {/* Filtre Statut complet */}
        <div className="relative">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="pl-4 pr-9 py-3 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 appearance-none cursor-pointer transition"
          >
            <option value="ALL">Tous les statuts</option>
            <option value="En attente">En attente</option>
            <option value="Acceptée">Acceptée</option>
            <option value="En cours">En cours</option>
            <option value="Refusée">Refusée</option>
          </select>
          <ChevronDown
            className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400"
            strokeWidth={2.5}
          />
        </div>
      </div>

      {/* Compteur */}
      <div className="flex items-center gap-2 px-2">
        <p className="text-xs text-slate-500 font-medium">
          <span className="font-bold text-slate-900">
            {filteredDemandes.length}
          </span>{" "}
          demande{filteredDemandes.length > 1 ? "s" : ""} reçue
          {filteredDemandes.length > 1 ? "s" : ""}
        </p>
      </div>

      {/* Liste des demandes */}
      {filteredDemandes.length > 0 ? (
        <div className="space-y-3">
          {filteredDemandes.map((item) => {
            const statusBadge = getStatusBadge(item.status);

            return (
              <article
                key={item.id}
                className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all"
              >
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <img
                    alt={item.company}
                    className="w-11 h-11 rounded-full object-cover ring-2 ring-white shadow-sm shrink-0"
                    src={item.avatar}
                  />

                  {/* Contenu */}
                  <div className="flex-1 min-w-0">
                    {/* Ligne 1 : entreprise + badges */}
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-slate-900 truncate">
                        {item.company}
                      </span>
                      <CheckCircle2
                        className="w-3.5 h-3.5 text-emerald-500 shrink-0"
                        strokeWidth={2.5}
                      />
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusBadge.color}`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${statusBadge.dot}`}
                        />
                        {item.status}
                      </span>
                      <span className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                        <Clock className="w-3 h-3" strokeWidth={2} />
                        {item.timeAgo}
                      </span>
                    </div>

                    {/* Titre */}
                    <h3 className="text-sm font-bold text-slate-900 leading-snug mb-1 line-clamp-2">
                      {item.title}
                    </h3>

                    {/* Description */}
                    <p className="text-xs text-slate-500 leading-relaxed mb-2 line-clamp-2">
                      {item.description}
                    </p>

                    {/* Ligne infos */}
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-slate-400 font-medium mb-2">
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="w-3 h-3" strokeWidth={2} />
                        {item.location}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span>{item.demandeType}</span>
                      <span className="text-slate-300">•</span>
                      <span>{item.budget}</span>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5">
                      {item.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-50 text-slate-600 border border-slate-100"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Action */}
                  <button className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-sm active:scale-95 shrink-0">
                    Voir
                    <ArrowRight className="w-3.5 h-3.5" strokeWidth={2.5} />
                  </button>
                </div>

                {/* Action mobile */}
                <button className="sm:hidden mt-3 w-full inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-sm active:scale-95">
                  Voir la demande
                  <ArrowRight className="w-3.5 h-3.5" strokeWidth={2.5} />
                </button>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
          <Inbox className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-400 text-sm font-medium">
            Aucune demande reçue ne correspond à votre recherche.
          </p>
        </div>
      )}
    </div>
  );
}