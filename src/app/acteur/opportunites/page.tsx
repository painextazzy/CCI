"use client";

import { useState } from "react";
import {
  Search,
  Clock,
  MapPin,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Megaphone,
  Search as SearchIcon,
} from "lucide-react";

type AnnonceType = "Offre" | "Demande";

interface Opportunity {
  id: number;
  company: string;
  role: string;
  location: string;
  email?: string;
  phone?: string;
  category: string;
  type: string;
  annonceType: AnnonceType;
  timeAgo: string;
  createdAt: string;
  status: string;
  title: string;
  description: string;
  avatar: string;
}

export default function PageOpportunites() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedType, setSelectedType] = useState("ALL");
  const [selectedAnnonceType, setSelectedAnnonceType] = useState<
    "Offre" | "Demande" | "RECENT"
  >("RECENT");
  const [selectedStatus, setSelectedStatus] = useState("ALL");

  const categories = [
    "Agro-business",
    "Export & Commerce",
    "Artisanat & Création",
    "Tourisme & Hôtellerie",
    "Industrie & Manufacture",
    "Énergie & Tech",
  ];

  const opportunities: Opportunity[] = [
    {
      id: 1,
      company: "AgriBio Madagascar",
      role: "Producteur Certifié | Thé d'altitude",
      location: "BP 1420, Fianarantsoa",
      email: "contact@agribio.mg",
      category: "Agro-business",
      type: "Sous-traitance",
      annonceType: "Demande",
      timeAgo: "Il y a 2h",
      createdAt: "2025-06-16T10:00:00Z",
      status: "Ouvert",
      title: "Recherche sous-traitant transformation de thé",
      description:
        "Mise en place d'un partenariat industriel pour l'usinage, le séchage contrôlé et le conditionnement hermétique de nos récoltes de thé d'altitude aux normes internationales d'exportation.",
      avatar:
        "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80",
    },
    {
      id: 2,
      company: "Bourbon Exporters S.A.",
      role: "Négoce & Export International | Café d'origine",
      location: "RN7 Ambalavao, Madagascar",
      phone: "+261 34 12 345 67",
      category: "Export & Commerce",
      type: "Partenariat export",
      annonceType: "Offre",
      timeAgo: "Il y a 5h",
      createdAt: "2025-06-16T07:00:00Z",
      status: "En cours",
      title: "Partenaire distribution café Bourbon – Europe",
      description:
        "Recherche d'un distributeur B2B spécialisé dans l'épicerie fine et torréfacteurs en France et Allemagne pour l'écoulement annuel de 120 tonnes de café bourbon pointu labellisé.",
      avatar:
        "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&q=80",
    },
    {
      id: 3,
      company: "Coopérative Tsara Artisans",
      role: "Groupement d'Artisans Régionaux | Fibres végétales",
      location: "Village artisanal, Isandra",
      email: "contact@tsara-artisans.mg",
      category: "Artisanat & Création",
      type: "Achat groupé",
      annonceType: "Demande",
      timeAgo: "Hier",
      createdAt: "2025-06-15T14:00:00Z",
      status: "Ouvert",
      title: "Fournisseur vannerie pour boutique Antananarivo",
      description:
        "Recherche d'artisans vanniers capables d'assurer un approvisionnement régulier en paniers, sets de table et luminaires en fibres de raphia naturelles pour notre enseigne de la capitale.",
      avatar:
        "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80",
    },
    {
      id: 4,
      company: "Ranomafana EcoTours",
      role: "Opérateur Tourisme Durable | Hébergement éco",
      location: "Entrée Parc National, Vohibato",
      phone: "+261 32 45 789 01",
      category: "Tourisme & Hôtellerie",
      type: "Appel d'offres",
      annonceType: "Offre",
      timeAgo: "Il y a 1j",
      createdAt: "2025-06-15T08:00:00Z",
      status: "En cours",
      title: "Prestataire écotourisme – Parc Ranomafana",
      description:
        "Sélection d'opérateurs réceptifs certifiés pour la création de circuits guidés nocturnes et séjours d'immersion écologique responsables dans la réserve de Ranomafana.",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    },
    {
      id: 5,
      company: "MecaPrecision Océan Indien",
      role: "Atelier Industriel Homologué | Découpe & mécano-soudure",
      location: "Zone Industrielle, Antsirabe",
      email: "contact@mecaprecision.mg",
      category: "Industrie & Manufacture",
      type: "Sous-traitance",
      annonceType: "Offre",
      timeAgo: "Il y a 2j",
      createdAt: "2025-06-14T09:00:00Z",
      status: "Ouvert",
      title: "Sous-traitant usinage de précision & découpe laser",
      description:
        "Recherche d'un atelier partenaire équipé de machines CNC et laser fibre pour la prise en charge d'un surplus de commandes de pièces en acier inoxydable et aluminium industriel.",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
    },
    {
      id: 6,
      company: "GreenPack Solutions",
      role: "Fabricant Éco-responsable | Emballages biosourcés",
      location: "Port Fluvial, Toamasina",
      email: "contact@greenpack.mg",
      category: "Énergie & Tech",
      type: "Achat groupé",
      annonceType: "Demande",
      timeAgo: "Il y a 3j",
      createdAt: "2025-06-13T11:00:00Z",
      status: "Ouvert",
      title: "Groupement d'achats emballages écologiques biodégradables",
      description:
        "Création d'un consortium inter-entreprises pour l'approvisionnement massif et mutualisé en bioplastiques compostables à base d'amidon de manioc avec tarification dégressive.",
      avatar:
        "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&q=80",
    },
  ];

  const types = [...new Set(opportunities.map((o) => o.type))].sort();

  const filteredOpportunities = opportunities
    .filter((opp) => {
      const matchesCategory =
        selectedCategory === "ALL" || opp.category === selectedCategory;

      const matchesSearch =
        opp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        opp.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        opp.company.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesType = selectedType === "ALL" || opp.type === selectedType;
      const matchesStatus =
        selectedStatus === "ALL" || opp.status === selectedStatus;

      let matchesAnnonceType = true;
      if (selectedAnnonceType === "Offre")
        matchesAnnonceType = opp.annonceType === "Offre";
      else if (selectedAnnonceType === "Demande")
        matchesAnnonceType = opp.annonceType === "Demande";
      // "RECENT" → pas de filtre, juste un tri

      return (
        matchesCategory &&
        matchesSearch &&
        matchesType &&
        matchesStatus &&
        matchesAnnonceType
      );
    })
    .sort((a, b) => {
      if (selectedAnnonceType === "RECENT") {
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      }
      return 0;
    });

  return (
    <div className="space-y-5 pt-4">
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
            placeholder="Rechercher une opportunité..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-full bg-white border border-slate-200 text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition shadow-sm"
          />
        </div>

        {/* Filtres */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Filtre Annonce */}
          <div className="relative">
            <select
              value={selectedAnnonceType}
              onChange={(e) =>
                setSelectedAnnonceType(
                  e.target.value as "Offre" | "Demande" | "RECENT"
                )
              }
              className="pl-4 pr-9 py-3 rounded-full bg-white border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 appearance-none cursor-pointer transition shadow-sm"
            >
              <option value="RECENT">Les plus récents</option>
              <option value="Demande">Demandes</option>
              <option value="Offre">Offres</option>
            </select>
            <ChevronDown
              className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400"
              strokeWidth={2.5}
            />
          </div>

          {/* Filtre Secteur */}
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="pl-4 pr-9 py-3 rounded-full bg-white border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 appearance-none cursor-pointer transition shadow-sm"
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

          {/* Filtre Type */}
          <div className="relative">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="pl-4 pr-9 py-3 rounded-full bg-white border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 appearance-none cursor-pointer transition shadow-sm"
            >
              <option value="ALL">Tous les types</option>
              {types.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            <ChevronDown
              className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400"
              strokeWidth={2.5}
            />
          </div>

          {/* Filtre Statut */}
          <div className="relative">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="pl-4 pr-9 py-3 rounded-full bg-white border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 appearance-none cursor-pointer transition shadow-sm"
            >
              <option value="ALL">Tous les statuts</option>
              <option value="Ouvert">Ouvert</option>
              <option value="En cours">En cours</option>
            </select>
            <ChevronDown
              className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400"
              strokeWidth={2.5}
            />
          </div>
        </div>
      </div>

      {/* Compteur */}
      <div className="flex items-center gap-2 px-2">
        <p className="text-xs text-slate-500 font-medium">
          <span className="font-bold text-slate-900">
            {filteredOpportunities.length}
          </span>{" "}
          opportunité{filteredOpportunities.length > 1 ? "s" : ""} trouvée
          {filteredOpportunities.length > 1 ? "s" : ""}
        </p>
      </div>

      {/* Grille */}
      {filteredOpportunities.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filteredOpportunities.map((item) => {
            const isDemande = item.annonceType === "Demande";

            return (
              <article
                key={item.id}
                className="bg-white rounded-[24px] border border-slate-100 p-5 shadow-[0_4px_20px_-8px_rgba(15,23,42,0.06)] hover:shadow-lg hover:border-emerald-200 transition-all duration-300 flex flex-col group"
              >
                {/* En-tête */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <img
                      alt={item.company}
                      className="w-11 h-11 rounded-full object-cover ring-2 ring-white shadow-md shrink-0"
                      src={item.avatar}
                    />

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <h3 className="text-sm font-bold text-slate-900 truncate">
                          {item.company}
                        </h3>
                        <CheckCircle2
                          className="w-3.5 h-3.5 text-emerald-500 shrink-0"
                          strokeWidth={2.5}
                          aria-label="Certifié CCI"
                        />
                      </div>

                      <p className="text-[11px] text-slate-500 truncate">
                        {item.role}
                      </p>

                      <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-400">
                        <MapPin className="w-3 h-3 shrink-0" strokeWidth={2} />
                        <span className="truncate">{item.location}</span>
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 flex flex-col items-end gap-1">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                        item.status === "Ouvert"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}
                    >
                      {item.status}
                    </span>
                    <span className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                      <Clock className="w-3 h-3" strokeWidth={2} />
                      {item.timeAgo}
                    </span>
                  </div>
                </div>

                {/* Corps */}
                <div className="flex-1 space-y-3 mb-4">
                  <div className="flex items-start gap-2.5">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 bg-slate-100 text-slate-500">
                      {isDemande ? (
                        <SearchIcon className="w-4 h-4" strokeWidth={2.5} />
                      ) : (
                        <Megaphone className="w-4 h-4" strokeWidth={2.5} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          {item.annonceType}
                        </span>
                      </div>
                      <h2 className="text-base font-bold text-slate-900 tracking-tight leading-snug group-hover:text-emerald-700 transition-colors cursor-pointer line-clamp-2">
                        {item.title}
                      </h2>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">
                    {item.description}
                  </p>
                </div>

                {/* Pied */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2 mt-auto">
                  <button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all">
                    Manifester mon intérêt
                    <ArrowRight className="w-3.5 h-3.5" strokeWidth={2.5} />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center">
          <p className="text-slate-400 text-sm font-medium">
            Aucune opportunité ne correspond à votre recherche.
          </p>
        </div>
      )}
    </div>
  );
}