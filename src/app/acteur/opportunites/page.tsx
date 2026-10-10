"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  Clock,
  MapPin,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Megaphone,
  Search as SearchIcon,
  PlusCircle,
  Loader2,
} from "lucide-react";

// Alignment exact avec votre backend NestJS / TypeORM
export type AnnonceType = "OFFRE" | "DEMANDE";

export interface Opportunity {
  id: string | number;
  title: string;
  category: string; // Ex: 'Sous-traitance', 'Distribution', 'Achat groupé'
  description: string;
  annonceType: AnnonceType;
  status: "OPEN" | "IN_PROGRESS" | "CLOSED";
  specificLocation?: string;
  deadline?: string;
  createdAt: string;
  timeAgo?: string;
  company: {
    id: string;
    name: string;
    activitySector?: string;
    address?: string;
    logoUrl?: string;
  };
}

// Données de secours (Mocks) pour le développement
const MOCK_OPPORTUNITIES: Opportunity[] = [
  {
    id: "1",
    title: "Recherche sous-traitant transformation de thé",
    category: "Sous-traitance",
    description:
      "Mise en place d'un partenariat industriel pour l'usinage, le séchage contrôlé et le conditionnement hermétique de nos récoltes de thé d'altitude aux normes internationales d'exportation.",
    annonceType: "DEMANDE",
    status: "OPEN",
    specificLocation: "Fianarantsoa",
    createdAt: "2026-10-10T08:00:00Z",
    timeAgo: "Il y a 2h",
    company: {
      id: "c1",
      name: "AgriBio Madagascar",
      activitySector: "Agro-business",
      address: "BP 1420, Fianarantsoa",
      logoUrl:
        "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80",
    },
  },
  {
    id: "2",
    title: "Partenaire distribution café Bourbon – Europe",
    category: "Distribution",
    description:
      "Recherche d'un distributeur B2B spécialisé dans l'épicerie fine et torréfacteurs en France et Allemagne pour l'écoulement annuel de 120 tonnes de café bourbon pointu labellisé.",
    annonceType: "OFFRE",
    status: "IN_PROGRESS",
    specificLocation: "RN7 Ambalavao",
    createdAt: "2026-10-10T05:00:00Z",
    timeAgo: "Il y a 5h",
    company: {
      id: "c2",
      name: "Bourbon Exporters S.A.",
      activitySector: "Export & Commerce",
      address: "Ambalavao, Madagascar",
      logoUrl:
        "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&q=80",
    },
  },
  {
    id: "3",
    title: "Fournisseur vannerie pour boutique Antananarivo",
    category: "Achat groupé",
    description:
      "Recherche d'artisans vanniers capables d'assurer un approvisionnement régulier en paniers, sets de table et luminaires en fibres de raphia naturelles pour notre enseigne de la capitale.",
    annonceType: "DEMANDE",
    status: "OPEN",
    createdAt: "2026-10-09T14:00:00Z",
    timeAgo: "Hier",
    company: {
      id: "c3",
      name: "Coopérative Tsara Artisans",
      activitySector: "Artisanat & Création",
      address: "Village artisanal, Isandra",
      logoUrl:
        "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80",
    },
  },
  {
    id: "4",
    title: "Sous-traitant usinage de précision & découpe laser",
    category: "Sous-traitance",
    description:
      "Recherche d'un atelier partenaire équipé de machines CNC et laser fibre pour la prise en charge d'un surplus de commandes de pièces en acier inoxydable et aluminium industriel.",
    annonceType: "OFFRE",
    status: "OPEN",
    specificLocation: "Zone Industrielle, Antsirabe",
    createdAt: "2026-10-08T09:00:00Z",
    timeAgo: "Il y a 2j",
    company: {
      id: "c4",
      name: "MecaPrecision Océan Indien",
      activitySector: "Industrie & Manufacture",
      address: "Antsirabe",
      logoUrl:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
    },
  },
];

export default function PageOpportunites() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtres
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedAnnonceType, setSelectedAnnonceType] = useState<
    "OFFRE" | "DEMANDE" | "ALL"
  >("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");

  // Formatage des catégories uniques (formats de collaboration)
  const categoriesList = [
    "Sous-traitance",
    "Partenariat commercial",
    "Achat groupé",
    "Distribution",
    "Appel d'offres",
    "Co-développement",
  ];

  // 🔄 Chargement depuis l'API NestJS
  useEffect(() => {
    async function fetchAnnouncements() {
      try {
        setLoading(true);
        const token = localStorage.getItem("access_token");

        const res = await fetch("http://localhost:3000/announcements", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Impossible de charger les annonces");

        const data = await res.json();
        
        // Formater les données de l'API NestJS
        const formattedData = data.map((item: any) => ({
          id: item.id,
          title: item.title,
          category: item.category,
          description: item.description,
          annonceType: item.type as AnnonceType,
          status: item.status,
          specificLocation: item.specificLocation,
          deadline: item.deadline,
          createdAt: item.createdAt,
          timeAgo: "Récemment",
          company: {
            id: item.company?.id || "",
            name: item.company?.name || "Entreprise CCI",
            activitySector: item.company?.activitySector || "Non spécifié",
            address: item.company?.address || "Madagascar",
            logoUrl:
              item.company?.logoUrl ||
              "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&q=80",
          },
        }));

        setOpportunities(formattedData);
      } catch (err) {
        console.warn("API NestJS indisponible, chargement des mocks:", err);
        setOpportunities(MOCK_OPPORTUNITIES);
      } finally {
        setLoading(false);
      }
    }

    fetchAnnouncements();
  }, []);

  // 🔍 Filtrage combiné
  const filteredOpportunities = opportunities.filter((opp) => {
    const matchesCategory =
      selectedCategory === "ALL" || opp.category === selectedCategory;

    const matchesSearch =
      opp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opp.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opp.company.name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      selectedStatus === "ALL" || opp.status === selectedStatus;

    const matchesAnnonceType =
      selectedAnnonceType === "ALL" || opp.annonceType === selectedAnnonceType;

    return (
      matchesCategory &&
      matchesSearch &&
      matchesStatus &&
      matchesAnnonceType
    );
  });

  return (
    <div className="space-y-6 pt-4 max-w-7xl mx-auto px-4 sm:px-6">
      {/* En-tête avec bouton de création */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-xs">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Opportunités B2B & Partenariats
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Explorez les offres et demandes de collaboration au sein du réseau CCI.
          </p>
        </div>

        <Link
          href="/acteur/annonces/nouvelle"
          className="inline-flex items-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold shadow-md shadow-emerald-600/20 transition active:scale-95 shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Publier une annonce</span>
        </Link>
      </div>

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
            placeholder="Rechercher une opportunité, un mot-clé..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-full bg-white border border-slate-200 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition shadow-xs"
          />
        </div>

        {/* Filtres */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Filtre Type (Offre / Demande) */}
          <div className="relative">
            <select
              value={selectedAnnonceType}
              onChange={(e) =>
                setSelectedAnnonceType(e.target.value as "OFFRE" | "DEMANDE" | "ALL")
              }
              className="pl-4 pr-9 py-3 rounded-full bg-white border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 appearance-none cursor-pointer transition shadow-xs"
            >
              <option value="ALL">Tous les types (Offres & Demandes)</option>
              <option value="DEMANDE">Demandes uniquement</option>
              <option value="OFFRE">Offres uniquement</option>
            </select>
            <ChevronDown
              className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400"
              strokeWidth={2.5}
            />
          </div>

          {/* Filtre Format de collaboration / Catégorie */}
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="pl-4 pr-9 py-3 rounded-full bg-white border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 appearance-none cursor-pointer transition shadow-xs"
            >
              <option value="ALL">Toutes les collaborations</option>
              {categoriesList.map((cat) => (
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

          {/* Filtre Statut */}
          <div className="relative">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="pl-4 pr-9 py-3 rounded-full bg-white border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 appearance-none cursor-pointer transition shadow-xs"
            >
              <option value="ALL">Tous les statuts</option>
              <option value="OPEN">Ouvert</option>
              <option value="IN_PROGRESS">En cours</option>
              <option value="CLOSED">Clôturé</option>
            </select>
            <ChevronDown
              className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400"
              strokeWidth={2.5}
            />
          </div>
        </div>
      </div>

      {/* Compteur d'opportunités */}
      <div className="flex items-center justify-between px-2">
        <p className="text-xs text-slate-500 font-medium">
          <span className="font-bold text-slate-900">
            {filteredOpportunities.length}
          </span>{" "}
          opportunité{filteredOpportunities.length > 1 ? "s" : ""} trouvée
          {filteredOpportunities.length > 1 ? "s" : ""}
        </p>
      </div>

      {/* État de chargement */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
          <p className="text-xs font-medium text-slate-500">
            Chargement des opportunités B2B...
          </p>
        </div>
      ) : filteredOpportunities.length > 0 ? (
        /* Grille des annonces */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filteredOpportunities.map((item) => {
            const isDemande = item.annonceType === "DEMANDE";
            const locationDisplay =
              item.specificLocation || item.company.address || "Madagascar";

            return (
              <article
                key={item.id}
                className="bg-white rounded-[24px] border border-slate-100 p-5 shadow-[0_4px_20px_-8px_rgba(15,23,42,0.06)] hover:shadow-lg hover:border-emerald-200 transition-all duration-300 flex flex-col group"
              >
                {/* En-tête : Info Entreprise & Statut */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <img
                      alt={item.company.name}
                      className="w-11 h-11 rounded-full object-cover ring-2 ring-white shadow-xs shrink-0"
                      src={item.company.logoUrl}
                    />

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <h3 className="text-sm font-bold text-slate-900 truncate">
                          {item.company.name}
                        </h3>
                        <CheckCircle2
                          className="w-3.5 h-3.5 text-emerald-500 shrink-0"
                          strokeWidth={2.5}
                          aria-label="Certifié CCI"
                        />
                      </div>

                      <p className="text-[11px] text-slate-500 truncate">
                        {item.company.activitySector}
                      </p>

                      <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-400">
                        <MapPin className="w-3 h-3 shrink-0" strokeWidth={2} />
                        <span className="truncate">{locationDisplay}</span>
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 flex flex-col items-end gap-1">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                        item.status === "OPEN"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}
                    >
                      {item.status === "OPEN" ? "Ouvert" : "En cours"}
                    </span>
                    <span className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                      <Clock className="w-3 h-3" strokeWidth={2} />
                      {item.timeAgo || "Récemment"}
                    </span>
                  </div>
                </div>

                {/* Corps de l'annonce */}
                <div className="flex-1 space-y-3 mb-4">
                  <div className="flex items-start gap-2.5">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 bg-slate-100 text-slate-600">
                      {isDemande ? (
                        <SearchIcon className="w-4 h-4" strokeWidth={2.5} />
                      ) : (
                        <Megaphone className="w-4 h-4" strokeWidth={2.5} />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* Integrated Badges: Type (Offre/Demande) + Collaboration Format */}
                      <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                        <span
                          className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                            isDemande
                              ? "bg-amber-100 text-amber-800"
                              : "bg-emerald-100 text-emerald-800"
                          }`}
                        >
                          {item.annonceType}
                        </span>

                        {/* Format de Collaboration / Catégorie */}
                        <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/60">
                          {item.category}
                        </span>
                      </div>

                      <h2 className="text-base font-bold text-slate-900 tracking-tight leading-snug group-hover:text-emerald-700 transition-colors cursor-pointer line-clamp-2">
                        {item.title}
                      </h2>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-3 pl-10">
                    {item.description}
                  </p>
                </div>

                {/* Pied de carte : CTA */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2 mt-auto">
                  <button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all active:scale-95">
                    <span>Manifester mon intérêt</span>
                    <ArrowRight className="w-3.5 h-3.5" strokeWidth={2.5} />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        /* État vide */
        <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center shadow-xs">
          <p className="text-slate-500 text-xs font-semibold">
            Aucune opportunité ne correspond à vos critères de recherche.
          </p>
        </div>
      )}
    </div>
  );
}