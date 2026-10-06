"use client";

import { useState } from "react";

export default function PageOpportunites() {
  const [activeCategory, setActiveCategory] = useState("Toutes les opportunités");

  const categories = [
    "Toutes les opportunités",
    "Agro-business",
    "Export & Commerce",
    "Artisanat & Création",
    "Tourisme & Hôtellerie",
    "Industrie & Manufacture",
    "Énergie & Tech",
  ];

  const opportunities = [
    {
      id: 1,
      company: "AgriBio Madagascar",
      role: "Producteur Certifié | Thé d'altitude",
      location: "BP 1420, Fianarantsoa",
      email: "contact@agribio.mg",
      category: "Agro-business",
      timeAgo: "Il y a 2h",
      status: "Ouvert",
      match: "98% Recommandé",
      title: "Recherche sous-traitant transformation de thé",
      description: "Mise en place d'un partenariat industriel pour l'usinage, le séchage contrôlé et le conditionnement hermétique de nos récoltes de thé d'altitude aux normes internationales d'exportation.",
      tags: ["#AgroIndustrie", "#NormesBio", "#Séchage", "#Exportation"],
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80",
    },
    {
      id: 2,
      company: "Bourbon Exporters S.A.",
      role: "Négoce & Export International | Café d'origine",
      location: "RN7 Ambalavao, Madagascar",
      phone: "+261 34 12 345 67",
      category: "Export & Commerce",
      timeAgo: "Il y a 5h",
      status: "En cours",
      match: "95% Recommandé",
      title: "Partenaire distribution café Bourbon – Europe",
      description: "Recherche d'un distributeur B2B spécialisé dans l'épicerie fine et torréfacteurs en France et Allemagne pour l'écoulement annuel de 120 tonnes de café bourbon pointu labellisé.",
      tags: ["#ExportEurope", "#CaféBourbon", "#DistributionB2B"],
      avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&q=80",
    },
    {
      id: 3,
      company: "Coopérative Tsara Artisans",
      role: "Groupement d'Artisans Régionaux | Fibres végétales",
      location: "Village artisanal, Isandra",
      email: "contact@tsara-artisans.mg",
      category: "Artisanat & Création",
      timeAgo: "Hier",
      status: "Ouvert",
      match: "90% Recommandé",
      title: "Fournisseur vannerie pour boutique Antananarivo",
      description: "Recherche d'artisans vanniers capables d'assurer un approvisionnement régulier en paniers, sets de table et luminaires en fibres de raphia naturelles pour notre enseigne de la capitale.",
      tags: ["#Vannerie", "#RaphiaNaturel", "#Approvisionnement"],
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80",
    },
    {
      id: 4,
      company: "Ranomafana EcoTours",
      role: "Opérateur Tourisme Durable | Hébergement éco",
      location: "Entrée Parc National, Vohibato",
      phone: "+261 32 45 789 01",
      category: "Tourisme & Hôtellerie",
      timeAgo: "Il y a 1j",
      status: "En cours",
      match: "88% Recommandé",
      title: "Prestataire écotourisme – Parc Ranomafana",
      description: "Sélection d'opérateurs réceptifs certifiés pour la création de circuits guidés nocturnes et séjours d'immersion écologique responsables dans la réserve de Ranomafana.",
      tags: ["#Écotourisme", "#CircuitsGuidés", "#TourismeDurable"],
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    },
    {
      id: 5,
      company: "MecaPrecision Océan Indien",
      role: "Atelier Industriel Homologué | Découpe & mécano-soudure",
      location: "Zone Industrielle, Antsirabe",
      email: "contact@mecaprecision.mg",
      category: "Industrie & Manufacture",
      timeAgo: "Il y a 2j",
      status: "Ouvert",
      match: "92% Recommandé",
      title: "Sous-traitant usinage de précision & découpe laser",
      description: "Recherche d'un atelier partenaire équipé de machines CNC et laser fibre pour la prise en charge d'un surplus de commandes de pièces en acier inoxydable et aluminium industriel.",
      tags: ["#UsinageCNC", "#DécoupeLaser", "#SousTraitance", "#Métallurgie"],
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
    },
    {
      id: 6,
      company: "GreenPack Solutions",
      role: "Fabricant Éco-responsable | Emballages biosourcés",
      location: "Port Fluvial, Toamasina",
      email: "contact@greenpack.mg",
      category: "Énergie & Tech",
      timeAgo: "Il y a 3j",
      status: "Ouvert",
      match: "96% Recommandé",
      title: "Groupement d'achats emballages écologiques biodégradables",
      description: "Création d'un consortium inter-entreprises pour l'approvisionnement massif et mutualisé en bioplastiques compostables à base d'amidon de manioc avec tarification dégressive.",
      tags: ["#Bioplastiques", "#Consortium", "#AchatsGroupés", "#Biodégradable"],
      avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&q=80",
    },
  ];

  return (
    <main className="max-w-[1320px] mx-auto px-6 pt-6 pb-20 bg-[#EEEEEE] text-[#232931] font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Intégration des polices et symboles Google Material Icons */}
      <link
        href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
        rel="stylesheet"
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        rel="stylesheet"
      />

      {/* Barre de Filtres par Catégories */}
      <section className="border-b border-gray-300 pb-3 mb-6 overflow-x-auto flex items-center gap-2 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 rounded-3xl text-xs whitespace-nowrap transition-colors ${
              activeCategory === cat
                ? "bg-[#232931] text-[#EEEEEE] font-bold shadow-sm"
                : "bg-white border border-gray-300 hover:border-[#4ECCA3] text-[#232931] font-semibold"
            }`}
          >
            {cat}
          </button>
        ))}
      </section>

      {/* Grille des Cartes d'Annonces */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {opportunities.map((item) => (
          <article
            key={item.id}
            className="bg-white rounded-3xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
          >
            <div className="flex flex-col gap-3">
              {/* En-tête de la carte : Fond blanc, photo w-10 h-10, nom, statut et % de recommandation */}
              <div className="p-2.5 flex flex-col gap-2 border border-gray-100 rounded-3xl bg-white">
                <div className="flex items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    {/* Photo de profil w-10 h-10 */}
                    <img
                      alt={item.company}
                      className="w-10 h-10 rounded-full object-cover border border-[#4ECCA3]/40 shadow-sm shrink-0"
                      src={item.avatar}
                    />
                    <div className="flex items-center gap-1.5 min-w-0">
                      <h3 className="text-sm font-bold text-[#232931] truncate">{item.company}</h3>
                      <span className="material-symbols-outlined text-[16px] text-[#4ECCA3] shrink-0" title="Certifié CCI">
                        verified
                      </span>
                    </div>
                  </div>
                  {/* Durée / Temps écoulé + Statut */}
                  <div className="shrink-0 flex items-center gap-2 text-[11px] font-medium text-gray-400">
                    <span className="flex items-center gap-0.5">
                      <span className="material-symbols-outlined text-[13px]">schedule</span>
                      <span>{item.timeAgo}</span>
                    </span>
                    <span className="text-gray-300">•</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                        item.status === "Ouvert"
                          ? "bg-[#4ECCA3]/15 text-[#4ECCA3]"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                </div>

                {/* Badge de Recommandation selon le secteur */}
                <div className="flex items-center justify-between pt-1 border-t border-gray-50 text-[11px]">
                  <span className="text-gray-500 font-medium">Adéquation secteur :</span>
                  <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#4ECCA3]/10 text-[#232931] font-bold text-[10px]">
                    <span className="material-symbols-outlined text-[13px] text-[#4ECCA3]">auto_awesome</span>
                    {item.match}
                  </span>
                </div>
              </div>

              {/* Corps de l'annonce */}
              <div className="p-3 rounded-3xl bg-white border border-gray-100 flex flex-col gap-2">
                <h2 className="text-sm font-bold text-[#232931] tracking-tight leading-snug hover:text-[#4ECCA3] transition-colors cursor-pointer">
                  {item.title}
                </h2>
                <p className="text-[11px] text-gray-600 leading-relaxed line-clamp-2">{item.description}</p>
                <div className="flex items-center gap-1 flex-wrap pt-1">
                  {item.tags.map((tag, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded-3xl text-[10px] bg-[#EEEEEE] text-[#232931] font-medium">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions de bas de carte */}
            <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
              {/* Bouton d'information avec Tooltip au survol */}
              <div className="relative group/tooltip">
                <button
                  aria-label="Plus d'informations"
                  className="p-1.5 rounded-3xl border border-gray-200 hover:border-[#4ECCA3] hover:text-[#4ECCA3] text-gray-400 transition-colors flex items-center justify-center bg-white"
                >
                  <span className="material-symbols-outlined text-[16px]">info</span>
                </button>
                {/* Tooltip */}
                <div className="absolute bottom-full right-0 mb-1.5 hidden group-hover/tooltip:flex px-2 py-1 bg-[#232931] text-white text-[10px] rounded-md whitespace-nowrap shadow-md z-10 font-medium">
                  Plus d'informations
                </div>
              </div>

              {/* Bouton d'action émeraude et texte blanc avec l'icône de flèche style Next */}
              <button className="px-3.5 py-1.5 rounded-3xl bg-[#4ECCA3] hover:bg-[#3db38f] text-white font-extrabold text-[11px] shadow-sm transition-all flex items-center gap-1">
                <span>Postuler</span>
                <span className="material-symbols-outlined text-[14px]">east</span>
              </button>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}