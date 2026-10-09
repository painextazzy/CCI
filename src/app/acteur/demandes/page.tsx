"use client";

import { useState } from "react";
import {
  Search,
  Clock,
  MapPin,
  ArrowRight,
  Info,
  CheckCircle2,
  ChevronDown,
  Inbox,
  Send,
  DollarSign,
  Calendar,
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
  const [activeTab, setActiveTab] = useState<"ALL" | "RECEIVED" | "SENT">(
    "ALL"
  );
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
      id: 3,
      type: "SENT",
      company: "Coopérative Tsara Artisans",
      role: "Groupement d'Artisans Régionaux | Fibres végétales",
      location: "Village artisanal, Isandra",
      email: "contact@tsara-artisans.mg",
      category: "Artisanat & Création",
      demandeType: "Achat groupé",
      timeAgo: "Hier",
      budget: "15 – 30 M Ar",
      deadline: "20 juin 2025",
      status: "En cours",
      title: "Fournisseur vannerie pour boutique Antananarivo",
      description:
        "Recherche d'artisans vanniers capables d'assurer un approvisionnement régulier en paniers, sets de table et luminaires en fibres de raphia naturelles.",
      tags: ["#Vannerie", "#RaphiaNaturel", "#Approvisionnement"],
      avatar:
        "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80",
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
      type: "SENT",
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
    {
      id: 6,
      type: "SENT",
      company: "GreenPack Solutions",
      role: "Fabricant Éco-responsable | Emballages biosourcés",
      location: "Port Fluvial, Toamasina",
      email: "contact@greenpack.mg",
      category: "Énergie & Tech",
      demandeType: "Achat groupé",
      timeAgo: "Il y a 3j",
      budget: "30 – 80 M Ar",
      deadline: "15 août 2025",
      status: "En cours",
      title: "Groupement d'achats emballages écologiques biodégradables",
      description:
        "Création d'un consortium inter-entreprises pour l'approvisionnement massif et mutualisé en bioplastiques compostables à base d'amidon de manioc.",
      tags: ["#Bioplastiques", "#Consortium", "#Biodégradable"],
      avatar:
        "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&q=80",
    },
  ];

  const countByType = (type: string) => {
    if (type === "ALL") return demandes.length;
    return demandes.filter((d) => d.type === type).length;
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<
      string,
      { color: string; dot: string }
    > = {
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

    const matchesTab = activeTab === "ALL" || demande.type === activeTab;

    const matchesStatus =
      selectedStatus === "ALL" || demande.status === selectedStatus;

    return matchesCategory && matchesSearch && matchesTab && matchesStatus;
  });

  return (
    <div className="space-y-4">
      {/* Onglets Toutes / Reçues / Envoyées */}
      <div className="flex items-center gap-1 bg-white p-1.5 rounded-3xl border border-slate-100 shadow-[0_4px_25px_-4px_rgba(15,23,42,0.06)] w-fit">
        {[
          { label: "Toutes", value: "ALL" as const, icon: null },
          {
            label: "Reçues",
            value: "RECEIVED" as const,
            icon: Inbox,
          },
          {
            label: "Envoyées",
            value: "SENT" as const,
            icon: Send,
          },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.value;
          return (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-bold transition ${
                active
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              {Icon && <Icon className="w-3.5 h-3.5" strokeWidth={2.2} />}
              {tab.label} ({countByType(tab.value)})
            </button>
          );
        })}
      </div>

      {/* Barre de recherche + filtres */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_4px_25px_-4px_rgba(15,23,42,0.06)] p-1.5 flex flex-col sm:flex-row items-stretch sm:items-center gap-1.5">
        {/* Recherche */}
        <div className="flex-1 flex flex-col px-4 py-2 sm:border-r sm:border-slate-100">
          <label className="text-[9px] uppercase tracking-wider font-bold text-slate-400 mb-0.5">
            Recherche
          </label>
          <div className="relative">
            <Search
              className="w-3.5 h-3.5 absolute left-0 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400"
              strokeWidth={2.2}
            />
            <input
              type="text"
              placeholder="Titre, entreprise..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-xs font-semibold text-slate-800 placeholder-slate-300 focus:outline-none pl-5"
            />
          </div>
        </div>

        {/* Filtre Secteur */}
        <div className="relative flex-1 flex flex-col px-4 py-2 sm:border-r sm:border-slate-100">
          <label className="text-[9px] uppercase tracking-wider font-bold text-slate-400 mb-0.5">
            Secteur
          </label>
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-transparent text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer appearance-none pr-6"
            >
              <option value="ALL">Tous les secteurs</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <ChevronDown
              className="w-3.5 h-3.5 absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400"
              strokeWidth={2.5}
            />
          </div>
        </div>

        {/* Filtre Statut */}
        <div className="relative flex-1 flex flex-col px-4 py-2">
          <label className="text-[9px] uppercase tracking-wider font-bold text-slate-400 mb-0.5">
            Statut
          </label>
          <div className="relative">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full bg-transparent text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer appearance-none pr-6"
            >
              <option value="ALL">Tous les statuts</option>
              <option value="En attente">En attente</option>
              <option value="Acceptée">Acceptée</option>
              <option value="En cours">En cours</option>
              <option value="Refusée">Refusée</option>
            </select>
            <ChevronDown
              className="w-3.5 h-3.5 absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400"
              strokeWidth={2.5}
            />
          </div>
        </div>
      </div>

      {/* Compteur */}
      <div className="flex items-center gap-2 px-2">
        <p className="text-xs text-slate-500 font-medium">
          <span className="font-bold text-slate-900">
            {filteredDemandes.length}
          </span>{" "}
          demande{filteredDemandes.length > 1 ? "s" : ""} trouvée
          {filteredDemandes.length > 1 ? "s" : ""}
        </p>
      </div>

      {/* Liste des demandes */}
      {filteredDemandes.length > 0 ? (
        <div className="space-y-4">
          {filteredDemandes.map((item) => {
            const isReceived = item.type === "RECEIVED";
            const statusBadge = getStatusBadge(item.status);

            return (
              <article
                key={item.id}
                className="bg-white rounded-[24px] border border-slate-100 p-5 shadow-[0_4px_20px_-8px_rgba(15,23,42,0.06)] hover:shadow-lg hover:border-emerald-200 transition-all duration-300"
              >
                <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                  {/* Zone gauche */}
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <img
                      alt={item.company}
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-white shadow-md shrink-0"
                      src={item.avatar}
                    />

                    <div className="flex-1 min-w-0">
                      {/* Ligne 1 : company + badges */}
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-slate-900 truncate">
                          {item.company}
                        </span>
                        <CheckCircle2
                          className="w-3.5 h-3.5 text-emerald-500 shrink-0"
                          strokeWidth={2.5}
                        />
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            isReceived
                              ? "bg-sky-50 text-sky-700 border-sky-200"
                              : "bg-violet-50 text-violet-700 border-violet-200"
                          }`}
                        >
                          {isReceived ? "Reçue" : "Envoyée"}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusBadge.color}`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${statusBadge.dot}`}
                          />
                          {item.status}
                        </span>
                      </div>

                      {/* Titre */}
                      <h3 className="text-base font-bold text-slate-900 leading-snug mb-2 line-clamp-2">
                        {item.title}
                      </h3>

                      {/* Description */}
                      <p className="text-xs text-slate-500 leading-relaxed mb-3 line-clamp-2">
                        {item.description}
                      </p>

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
                  </div>

                  {/* Zone droite : détails + action */}
                  <div className="lg:w-[260px] shrink-0 flex flex-col gap-3 lg:border-l lg:border-slate-100 lg:pl-4">
                    {/* Détails */}
                    <div className="space-y-1.5 text-[11px]">
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <Info
                          className="w-3.5 h-3.5 shrink-0 text-slate-400"
                          strokeWidth={2}
                        />
                        <span className="font-semibold truncate">
                          {item.demandeType}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <DollarSign
                          className="w-3.5 h-3.5 shrink-0 text-slate-400"
                          strokeWidth={2}
                        />
                        <span className="font-semibold truncate">
                          {item.budget}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <Calendar
                          className="w-3.5 h-3.5 shrink-0 text-slate-400"
                          strokeWidth={2}
                        />
                        <span className="truncate">{item.deadline}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <MapPin
                          className="w-3.5 h-3.5 shrink-0 text-slate-400"
                          strokeWidth={2}
                        />
                        <span className="truncate">{item.location}</span>
                      </div>
                    </div>

                    {/* Temps + Action */}
                    <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-100">
                      <span className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                        <Clock className="w-3 h-3" strokeWidth={2} />
                        {item.timeAgo}
                      </span>

                      <button className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-sm">
                        Voir
                        <ArrowRight className="w-3 h-3" strokeWidth={2.5} />
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center">
          <Inbox className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-400 text-sm font-medium">
            Aucune demande ne correspond à votre recherche.
          </p>
        </div>
      )}
    </div>
  );
}