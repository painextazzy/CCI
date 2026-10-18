"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Search,
  Clock,
  MapPin,
  ArrowRight,
  Info,
  CheckCircle2,
  ChevronDown,
  Building2,
  Globe,
  Star,
  Download,
  FileSignature,
  LoaderCircle,
  X,
} from "lucide-react";
import { getApiRoot } from "../../lib/auth";
import { useAuth } from "../../providers/AuthProvider";

interface ContractRecord {
  id: string;
  reference: string;
  status: "ACCEPTED";
  title: string;
  description: string;
  amount: string;
  startDate: string;
  endDate: string;
  senderCompanyName: string;
  receiverCompanyName: string;
  senderCompanyId: string;
  receiverCompanyId: string;
  receiverSignerName: string;
  acceptedAt: string;
}

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Date inconnue"
    : new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" }).format(date);
}

function formatAmount(value: string) {
  try {
    return `${new Intl.NumberFormat("fr-FR").format(BigInt(value))} Ar`;
  } catch {
    return "Montant indisponible";
  }
}

interface Partner {
  id: number;
  company: string;
  role: string;
  location: string;
  email?: string;
  phone?: string;
  category: string;
  type: "INTERNAL" | "EXTERNAL";
  partnerType: string;
  timeAgo: string;
  rating: number;
  status: "Actif" | "En pause";
  title: string;
  description: string;
  tags: string[];
  avatar: string;
}

export default function PartenairesPage() {
  const { user } = useAuth();
  const [contracts, setContracts] = useState<ContractRecord[]>([]);
  const [contractsLoading, setContractsLoading] = useState(true);
  const [contractsError, setContractsError] = useState<string | null>(null);
  const [selectedContract, setSelectedContract] =
    useState<ContractRecord | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedType, setSelectedType] = useState("ALL");
  const [selectedLocation, setSelectedLocation] = useState("ALL");

  useEffect(() => {
    let active = true;

    async function loadContracts() {
      setContractsLoading(true);
      setContractsError(null);
      try {
        const response = await fetch(`${getApiRoot()}/messages/contracts`, {
          credentials: "include",
          cache: "no-store",
        });
        if (!response.ok) {
          const result = (await response.json().catch(() => null)) as {
            message?: string;
          } | null;
          throw new Error(
            result?.message || "Impossible de charger les contrats.",
          );
        }
        const result = (await response.json()) as ContractRecord[];
        if (active) setContracts(Array.isArray(result) ? result : []);
      } catch (cause) {
        if (active) {
          setContractsError(
            cause instanceof Error
              ? cause.message
              : "Impossible de charger les contrats.",
          );
        }
      } finally {
        if (active) setContractsLoading(false);
      }
    }

    void loadContracts();
    return () => {
      active = false;
    };
  }, []);

  const downloadContract = async (contract: ContractRecord) => {
    try {
      const response = await fetch(
        `${getApiRoot()}/messages/contracts/${contract.id}/pdf`,
        { credentials: "include" },
      );
      if (!response.ok) {
        throw new Error("Le PDF du contrat n’a pas pu être téléchargé.");
      }
      const url = URL.createObjectURL(await response.blob());
      const link = document.createElement("a");
      link.href = url;
      link.download = `${contract.reference}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (cause) {
      setContractsError(
        cause instanceof Error
          ? cause.message
          : "Le PDF du contrat n’a pas pu être téléchargé.",
      );
    }
  };

  const categories = [
    "Agro-business",
    "Export & Commerce",
    "Artisanat & Création",
    "Tourisme & Hôtellerie",
    "Industrie & Manufacture",
    "Énergie & Tech",
  ];

  const partners: Partner[] = [
    {
      id: 1,
      company: "AgriBio Madagascar",
      role: "Producteur Certifié | Thé d'altitude",
      location: "BP 1420, Fianarantsoa",
      email: "contact@agribio.mg",
      category: "Agro-business",
      type: "INTERNAL",
      partnerType: "Fournisseur",
      timeAgo: "Actif depuis 2023",
      rating: 5.0,
      status: "Actif",
      title: "Partenaire historique pour la filière thé",
      description:
        "Producteur certifié de thé d'altitude de la région Haute Matsiatra. Partenariat industriel solide pour la transformation et l'exportation vers l'Europe.",
      tags: ["#Thé", "#Bio", "#Export", "#AgroIndustrie"],
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
      type: "INTERNAL",
      partnerType: "Distributeur",
      timeAgo: "Actif depuis 2022",
      rating: 4.8,
      status: "Actif",
      title: "Partenaire export café Bourbon – Europe",
      description:
        "Négoce et export international de café Bourbon pointu labellisé. Réseau de distributeurs en France et en Allemagne.",
      tags: ["#CaféBourbon", "#ExportEurope", "#Distribution"],
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
      type: "INTERNAL",
      partnerType: "Fournisseur",
      timeAgo: "Actif depuis 2024",
      rating: 4.9,
      status: "Actif",
      title: "Fournisseur vannerie et raphia naturel",
      description:
        "Groupement d'artisans spécialisés dans les fibres végétales : paniers, sets de table et luminaires en raphia naturel.",
      tags: ["#Vannerie", "#RaphiaNaturel", "#Artisanat"],
      avatar:
        "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80",
    },
    {
      id: 4,
      company: "MecaPrecision Océan Indien",
      role: "Atelier Industriel Homologué | Découpe & mécano-soudure",
      location: "Zone Industrielle, Antsirabe",
      email: "contact@mecaprecision.mg",
      category: "Industrie & Manufacture",
      type: "EXTERNAL",
      partnerType: "Sous-traitant",
      timeAgo: "Actif depuis 2023",
      rating: 4.7,
      status: "Actif",
      title: "Sous-traitant usinage de précision",
      description:
        "Atelier équipé de machines CNC et laser fibre pour la production de pièces en acier inoxydable et aluminium industriel.",
      tags: ["#UsinageCNC", "#DécoupeLaser", "#Métallurgie"],
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
    },
    {
      id: 5,
      company: "GreenPack Solutions",
      role: "Fabricant Éco-responsable | Emballages biosourcés",
      location: "Port Fluvial, Toamasina",
      email: "contact@greenpack.mg",
      category: "Énergie & Tech",
      type: "EXTERNAL",
      partnerType: "Fournisseur",
      timeAgo: "Actif depuis 2024",
      rating: 4.6,
      status: "Actif",
      title: "Fournisseur emballages biodégradables",
      description:
        "Fabricant d'emballages biosourcés et biodégradables à base d'amidon de manioc pour l'agroalimentaire.",
      tags: ["#Bioplastiques", "#Écologie", "#Emballages"],
      avatar:
        "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&q=80",
    },
    {
      id: 6,
      company: "Ranomafana EcoTours",
      role: "Opérateur Tourisme Durable | Hébergement éco",
      location: "Entrée Parc National, Vohibato",
      phone: "+261 32 45 789 01",
      category: "Tourisme & Hôtellerie",
      type: "INTERNAL",
      partnerType: "Partenaire",
      timeAgo: "Actif depuis 2023",
      rating: 4.9,
      status: "Actif",
      title: "Partenaire écotourisme – Parc Ranomafana",
      description:
        "Opérateur de tourisme durable proposant des circuits guidés et séjours d'immersion écologique dans la réserve.",
      tags: ["#Écotourisme", "#CircuitsGuidés", "#TourismeDurable"],
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    },
  ];

  const types = [...new Set(partners.map((p) => p.partnerType))].sort();

  const locations = [
    "Fianarantsoa",
    "Ambalavao",
    "Isandra",
    "Antsirabe",
    "Toamasina",
    "Vohibato",
  ];

  const filteredPartners = partners.filter((partner) => {
    const matchesCategory =
      selectedCategory === "ALL" || partner.category === selectedCategory;

    const matchesSearch =
      partner.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      partner.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      partner.company.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType =
      selectedType === "ALL" || partner.partnerType === selectedType;

    const matchesLocation =
      selectedLocation === "ALL" || partner.location.includes(selectedLocation);

    return matchesCategory && matchesSearch && matchesType && matchesLocation;
  });

  return (
    <div className="space-y-4">
      <section
        data-actor-card
        className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-[0_4px_25px_-4px_rgba(15,23,42,0.06)]"
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h2 className="flex items-center gap-2 text-sm font-extrabold text-slate-900">
              <FileSignature className="h-4 w-4 text-emerald-600" />
              Contrats avec vos partenaires
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Retrouvez vos contrats acceptés et leurs détails.
            </p>
          </div>
          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
            {contracts.length}
          </span>
        </div>
        {contractsError && (
          <p role="alert" className="px-5 py-3 text-xs text-rose-700">
            {contractsError}
          </p>
        )}
        {contractsLoading ? (
          <div className="flex items-center justify-center gap-2 px-5 py-10 text-xs font-medium text-slate-500">
            <LoaderCircle className="h-4 w-4 animate-spin text-emerald-600" />
            Chargement des contrats...
          </div>
        ) : contracts.length === 0 ? (
          <p className="px-5 py-8 text-center text-xs text-slate-500">
            Aucun contrat accepté pour le moment.
          </p>
        ) : (
          <div className="divide-y divide-slate-100">
            {contracts.map((contract) => (
              <article
                key={contract.id}
                className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <h3 className="truncate text-sm font-bold text-slate-900">
                    {contract.title}
                  </h3>
                  <p className="mt-1 text-xs text-slate-500">
                    {contract.senderCompanyName} ·{" "}
                    {contract.receiverCompanyName}
                  </p>
                  <p className="mt-1 text-[11px] text-slate-400">
                    {contract.reference} · Accepté le{" "}
                    {formatDate(contract.acceptedAt)}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="mr-1 text-xs font-extrabold text-emerald-700">
                    {formatAmount(contract.amount)}
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedContract(contract)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
                  >
                    <Info className="h-3.5 w-3.5" />
                    Détails
                  </button>
                  <button
                    type="button"
                    onClick={() => void downloadContract(contract)}
                    aria-label={`Télécharger le contrat ${contract.reference}`}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-emerald-700"
                  >
                    <Download className="h-3.5 w-3.5" />
                    PDF
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {selectedContract && (
        <div
          role="presentation"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelectedContract(null);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="partner-contract-title"
            className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                  {selectedContract.reference}
                </p>
                <h2
                  id="partner-contract-title"
                  className="mt-1 text-lg font-extrabold text-slate-900"
                >
                  {selectedContract.title}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedContract(null)}
                aria-label="Fermer les détails du contrat"
                className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-5 space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  selectedContract.senderCompanyName,
                  selectedContract.receiverCompanyName,
                ].map((companyName, index) => (
                  <div
                    key={`${companyName}-${index}`}
                    className="rounded-2xl bg-slate-50 p-4"
                  >
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {index === 0 ? "Émetteur" : "Destinataire"}
                    </p>
                    <p className="mt-1 text-sm font-bold text-slate-800">
                      {companyName}
                    </p>
                  </div>
                ))}
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Description
                </p>
                <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                  {selectedContract.description}
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-slate-100 p-3">
                  <p className="text-[10px] font-bold uppercase text-slate-400">
                    Montant
                  </p>
                  <p className="mt-1 text-sm font-extrabold text-emerald-700">
                    {formatAmount(selectedContract.amount)}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-100 p-3">
                  <p className="text-[10px] font-bold uppercase text-slate-400">
                    Début
                  </p>
                  <p className="mt-1 text-sm font-bold text-slate-800">
                    {formatDate(selectedContract.startDate)}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-100 p-3">
                  <p className="text-[10px] font-bold uppercase text-slate-400">
                    Fin
                  </p>
                  <p className="mt-1 text-sm font-bold text-slate-800">
                    {formatDate(selectedContract.endDate)}
                  </p>
                </div>
              </div>
              <p className="text-xs text-slate-500">
                Accepté le {formatDate(selectedContract.acceptedAt)} par{" "}
                {selectedContract.receiverSignerName}
              </p>
              <div className="flex flex-wrap justify-between gap-2 border-t border-slate-100 pt-4">
                <Link
                  href={`/acteur/entreprises/${selectedContract.senderCompanyId === user?.company?.id ? selectedContract.receiverCompanyId : selectedContract.senderCompanyId}`}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 px-4 py-2.5 text-xs font-bold text-emerald-700 transition hover:bg-emerald-50"
                >
                  Profil du partenaire
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <button
                  type="button"
                  onClick={() => void downloadContract(selectedContract)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-emerald-700"
                >
                  <Download className="h-3.5 w-3.5" />
                  Télécharger le PDF
                </button>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* Barre de recherche + filtres */}
      <div
        data-actor-card
        className="bg-white rounded-3xl border border-slate-100 shadow-[0_4px_25px_-4px_rgba(15,23,42,0.06)] p-1.5 flex flex-col sm:flex-row items-stretch sm:items-center gap-1.5"
      >
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
              placeholder="Nom, spécialité..."
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

        {/* Filtre Type de partenaire */}
        <div className="relative flex-1 flex flex-col px-4 py-2 sm:border-r sm:border-slate-100">
          <label className="text-[9px] uppercase tracking-wider font-bold text-slate-400 mb-0.5">
            Type
          </label>
          <div className="relative">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full bg-transparent text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer appearance-none pr-6"
            >
              <option value="ALL">Tous les types</option>
              {types.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            <ChevronDown
              className="w-3.5 h-3.5 absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400"
              strokeWidth={2.5}
            />
          </div>
        </div>

        {/* Filtre Localisation */}
        <div className="relative flex-1 flex flex-col px-4 py-2">
          <label className="text-[9px] uppercase tracking-wider font-bold text-slate-400 mb-0.5">
            Localisation
          </label>
          <div className="relative">
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full bg-transparent text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer appearance-none pr-6"
            >
              <option value="ALL">Toutes les villes</option>
              {locations.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
            <ChevronDown
              className="w-3.5 h-3.5 absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400"
              strokeWidth={2.5}
            />
          </div>
        </div>
      </div>

      {/* Compteur de résultats */}
      <div className="flex items-center gap-2 px-2">
        <p className="text-xs text-slate-500 font-medium">
          <span className="font-bold text-slate-900">
            {filteredPartners.length}
          </span>{" "}
          partenaire{filteredPartners.length > 1 ? "s" : ""} trouvé
          {filteredPartners.length > 1 ? "s" : ""}
        </p>
      </div>

      {/* Grille des partenaires */}
      {filteredPartners.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filteredPartners.map((item) => {
            const isInternal = item.type === "INTERNAL";

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
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${
                        item.status === "Actif"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-amber-50 text-amber-700 border-amber-200"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          item.status === "Actif"
                            ? "bg-emerald-500"
                            : "bg-amber-500"
                        }`}
                      />
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
                  <h2 className="text-base font-bold text-slate-900 tracking-tight leading-snug group-hover:text-emerald-700 transition-colors cursor-pointer line-clamp-2">
                    {item.title}
                  </h2>

                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">
                    {item.description}
                  </p>

                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    {item.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-slate-50 text-slate-600 border border-slate-100"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Pied */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 mt-auto">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-bold text-[10px] text-white ${
                        item.rating >= 4.5
                          ? "bg-emerald-500"
                          : item.rating >= 4
                            ? "bg-amber-500"
                            : "bg-rose-500"
                      }`}
                    >
                      <Star className="w-2.5 h-2.5" />
                      {item.rating.toFixed(1)}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        isInternal
                          ? "bg-sky-50 text-sky-700 border-sky-200"
                          : "bg-violet-50 text-violet-700 border-violet-200"
                      }`}
                    >
                      {isInternal ? (
                        <Building2 className="w-2.5 h-2.5" strokeWidth={2.2} />
                      ) : (
                        <Globe className="w-2.5 h-2.5" strokeWidth={2.2} />
                      )}
                      {isInternal ? "Interne" : "Externe"}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-50 text-slate-500 border border-slate-100">
                      {item.partnerType}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      aria-label="Plus d'informations"
                      className="w-8 h-8 rounded-xl border border-slate-200 hover:border-emerald-300 hover:text-emerald-600 hover:bg-emerald-50 text-slate-400 transition-all flex items-center justify-center"
                      title="Plus d'informations"
                    >
                      <Info className="w-3.5 h-3.5" strokeWidth={2.2} />
                    </button>

                    <button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all">
                      Contacter
                      <ArrowRight className="w-3.5 h-3.5" strokeWidth={2.5} />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div
          data-actor-card
          className="bg-white rounded-3xl border border-slate-100 p-12 text-center"
        >
          <p className="text-slate-400 text-sm font-medium">
            Aucun partenaire ne correspond à votre recherche.
          </p>
        </div>
      )}
    </div>
  );
}
