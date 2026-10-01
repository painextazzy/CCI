"use client";

import { useState } from "react";

interface Company {
  id: string;
  name: string;
  type: "Interne" | "Externe";
  siret: string;
  naf: string;
  contactName: string;
  phone: string;
  submittedAt: string; // Format YYYY-MM-DD
  submittedAtDisplay: string;
  time: string;
  documents: { label: string; warning?: boolean }[];
  status: "pending" | "validated" | "rejected";
  rejectionReason?: string;
}

const initialCompaniesData: Company[] = [
  {
    id: "#144826",
    name: "NovaTech Solutions SAS",
    type: "Externe",
    siret: "849 203 192 00024",
    naf: "NAF 6201Z",
    contactName: "Marc Delahaye",
    phone: "+33 6 12 45 78 90",
    submittedAt: "2025-06-18",
    submittedAtDisplay: "18 Juin 2025",
    time: "14:22",
    documents: [{ label: "Kbis.pdf" }, { label: "ID.jpg" }],
    status: "pending",
  },
  {
    id: "#144827",
    name: "CCI Filiale Services",
    type: "Interne",
    siret: "912 405 873 00018",
    naf: "NAF 1089Z",
    contactName: "Élodie Renard",
    phone: "+33 6 88 12 34 56",
    submittedAt: "2025-06-18",
    submittedAtDisplay: "18 Juin 2025",
    time: "11:05",
    documents: [{ label: "Liasse.pdf" }, { label: "Kbis.pdf" }],
    status: "pending",
  },
  {
    id: "#144828",
    name: "Nexura Logistique",
    type: "Externe",
    siret: "784 920 114 00035",
    naf: "NAF 5229B",
    contactName: "Thomas Mercier",
    phone: "+33 7 45 90 21 33",
    submittedAt: "2025-06-17",
    submittedAtDisplay: "17 Juin 2025",
    time: "16:40",
    documents: [{ label: "URSSAF.pdf" }, { label: "Kbis.pdf" }],
    status: "validated",
  },
  {
    id: "#144829",
    name: "Cabinet Vaneau & Associés",
    type: "Externe",
    siret: "493 029 881 00012",
    naf: "NAF 6910Z",
    contactName: "Sarah Vaneau",
    phone: "+33 1 42 68 55 00",
    submittedAt: "2025-06-17",
    submittedAtDisplay: "17 Juin 2025",
    time: "09:18",
    documents: [{ label: "RCP.pdf" }, { label: "Kbis.pdf" }],
    status: "pending",
  },
  {
    id: "#144830",
    name: "Solaris Énergie France",
    type: "Externe",
    siret: "820 914 772 00041",
    naf: "NAF 3511Z",
    contactName: "Alexandre Fabre",
    phone: "+33 6 33 21 89 04",
    submittedAt: "2025-06-16",
    submittedAtDisplay: "16 Juin 2025",
    time: "18:50",
    documents: [{ label: "Kbis (incomplet)", warning: true }],
    status: "rejected",
    rejectionReason: "Extrait Kbis périmé de plus de 3 mois.",
  },
];

type SortOption = "date-desc" | "date-asc" | "alpha-asc" | "alpha-desc";

export default function PendingCompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>(initialCompaniesData);
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "validated" | "rejected">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("date-desc");

  // Etats des Modales & Menus
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [detailModalCompany, setDetailModalCompany] = useState<Company | null>(null);
  const [rejectModalCompany, setRejectModalCompany] = useState<Company | null>(null);
  const [rejectionInput, setRejectionInput] = useState("");

  // Traitement des données : Recherche, Filtre par statut & Tri
  const processedData = companies
    .filter((company) => {
      const matchesFilter = filterStatus === "all" ? true : company.status === filterStatus;
      const matchesSearch =
        company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        company.siret.includes(searchQuery) ||
        company.contactName.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === "date-desc") {
        return new Date(`${b.submittedAt}T${b.time}`).getTime() - new Date(`${a.submittedAt}T${a.time}`).getTime();
      }
      if (sortBy === "date-asc") {
        return new Date(`${a.submittedAt}T${a.time}`).getTime() - new Date(`${b.submittedAt}T${b.time}`).getTime();
      }
      if (sortBy === "alpha-asc") {
        return a.name.localeCompare(b.name);
      }
      if (sortBy === "alpha-desc") {
        return b.name.localeCompare(a.name);
      }
      return 0;
    });

  // Action : Valider
  const handleAccept = (id: string) => {
    setCompanies((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: "validated", rejectionReason: undefined } : item))
    );
    setOpenMenuId(null);
  };

  // Action : Confirmer le refus avec motif
  const handleConfirmReject = () => {
    if (!rejectModalCompany) return;
    setCompanies((prev) =>
      prev.map((item) =>
        item.id === rejectModalCompany.id
          ? { ...item, status: "rejected", rejectionReason: rejectionInput || "Non conforme aux exigences." }
          : item
      )
    );
    setRejectModalCompany(null);
    setRejectionInput("");
  };

  return (
    <div className="flex flex-col gap-4 mt-1 w-full text-slate-800">
      {/* Barre d'outils supérieure : Recherche, Dropdown Tri unique et Filtres de Statut */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-white/80 p-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
        
        {/* Recherche + Dropdown Tri */}
        <div className="flex flex-wrap items-center gap-2 flex-1">
          {/* Recherche (Diminuée de 50% avec w-1/2) */}
          <div className="relative w-1/2 min-w-[180px]">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher entreprise, SIRET..."
              className="w-full pl-9 pr-3 text-sm bg-white border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 text-slate-700 placeholder-slate-400 py-2 shadow-2xs transition"
            />
            <svg className="w-4 h-4 absolute left-3 text-slate-400 top-2.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </div>

          {/* Menu Déroulant Tri Unique (Date & A-Z) */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="appearance-none bg-white border border-slate-200 rounded-full text-xs font-semibold text-slate-700 pl-3.5 pr-8 py-2.5 hover:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 shadow-2xs cursor-pointer transition"
            >
              <option value="date-desc">Plus récents d'abord</option>
              <option value="date-asc">Plus anciens d'abord</option>
              <option value="alpha-asc">Nom (A-Z)</option>
              <option value="alpha-desc">Nom (Z-A)</option>
            </select>
            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="m6 9 6 6 6-6" />
              </svg>
            </div>
          </div>
        </div>

        {/* Filtres par statut (Boutons actifs en bg vert) */}
        <div className="flex items-center gap-1.5 flex-wrap justify-end">
          <button
            onClick={() => setFilterStatus("all")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition ${
              filterStatus === "all" ? "bg-emerald-600 text-white shadow-xs" : "bg-slate-100 hover:bg-slate-200 text-slate-700"
            }`}
          >
            Tous ({companies.length})
          </button>
          <button
            onClick={() => setFilterStatus("pending")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition ${
              filterStatus === "pending" ? "bg-emerald-600 text-white shadow-xs" : "bg-slate-100 hover:bg-slate-200 text-slate-700"
            }`}
          >
            En attente ({companies.filter((c) => c.status === "pending").length})
          </button>
          <button
            onClick={() => setFilterStatus("validated")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition ${
              filterStatus === "validated" ? "bg-emerald-600 text-white shadow-xs" : "bg-slate-100 hover:bg-slate-200 text-slate-700"
            }`}
          >
            Validés ({companies.filter((c) => c.status === "validated").length})
          </button>
          <button
            onClick={() => setFilterStatus("rejected")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition ${
              filterStatus === "rejected" ? "bg-emerald-600 text-white shadow-xs" : "bg-slate-100 hover:bg-slate-200 text-slate-700"
            }`}
          >
            Refusés ({companies.filter((c) => c.status === "rejected").length})
          </button>
        </div>
      </div>

      {/* Tableau des Entreprises */}
      <div className="bg-white rounded-3xl p-2 shadow-xs border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto min-h-[320px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 text-slate-500 font-bold text-xs uppercase tracking-wider border-b border-slate-100">
                <th className="py-3.5 px-4 rounded-l-2xl">Entreprise</th>
                <th className="py-3.5 px-3">Type</th>
                <th className="py-3.5 px-3">SIRET &amp; NAF</th>
                <th className="py-3.5 px-4">Contact</th>
                <th className="py-3.5 px-3">Date</th>
                <th className="py-3.5 px-3">Justificatifs</th>
                <th className="py-3.5 px-3">Statut</th>
                <th className="py-3.5 px-4 text-center rounded-r-2xl">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm font-normal text-slate-700">
              {processedData.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/70 transition">
                  {/* Entreprise */}
                  <td className="py-4 px-4 font-bold text-slate-900 text-sm">
                    <div>
                      <span className="block">{item.name}</span>
                      <span className="text-xs text-slate-400 font-normal">{item.id}</span>
                    </div>
                  </td>

                  {/* Type */}
                  <td className="py-4 px-3">
                    <span
                      className={`px-2.5 py-1 rounded-full font-bold text-xs border ${
                        item.type === "Interne"
                          ? "bg-purple-50 text-slate-600 border-purple-200/60"
                          : "bg-blue-50 text-slate-600 border-blue-200/60"
                      }`}
                    >
                      {item.type}
                    </span>
                  </td>

                  {/* Identifiants */}
                  <td className="py-4 px-3 font-mono text-xs text-slate-600">
                    <span className="font-semibold block">{item.siret}</span>
                    <span className="text-[11px] text-slate-400 font-sans">{item.naf}</span>
                  </td>

                  {/* Contact */}
                  <td className="py-4 px-4">
                    <p className="font-semibold text-slate-800 text-sm">{item.contactName}</p>
                    <p className="text-xs text-slate-500 font-mono">{item.phone}</p>
                  </td>

                  {/* Date */}
                  <td className="py-4 px-3 text-slate-600 text-xs">
                    <span className="font-medium block">{item.submittedAtDisplay}</span>
                    <span className="text-[11px] text-slate-400">{item.time}</span>
                  </td>

                  {/* Documents */}
                  <td className="py-4 px-3">
                    <div className="flex flex-wrap items-center gap-1">
                      {item.documents.map((doc, idx) => (
                        <span
                          key={idx}
                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${
                            doc.warning
                              ? "bg-pink-50 text-pink-600 border-pink-200"
                              : "bg-slate-100 text-slate-600 border-slate-200"
                          }`}
                        >
                          {doc.label}
                        </span>
                      ))}
                    </div>
                  </td>

                  {/* Statut */}
                  <td className="py-4 px-3">
                    {item.status === "pending" && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                        <span className="w-2 h-2 rounded-full bg-amber-500" /> En attente
                      </span>
                    )}
                    {item.status === "validated" && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" /> Validé
                      </span>
                    )}
                    {item.status === "rejected" && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-pink-50 text-pink-600 border border-pink-200">
                        <span className="w-2 h-2 rounded-full bg-pink-500" /> Refusé
                      </span>
                    )}
                  </td>

                  {/* Menu Action (...) */}
                  <td className="py-4 px-4 text-center relative">
                    <button
                      onClick={() => setOpenMenuId(openMenuId === item.id ? null : item.id)}
                      className="w-8 h-8 inline-flex items-center justify-center rounded-full hover:bg-slate-200/60 text-slate-600 transition"
                      aria-label="Menu actions"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="1" />
                        <circle cx="12" cy="5" r="1" />
                        <circle cx="12" cy="19" r="1" />
                      </svg>
                    </button>

                    {/* Dropdown Menu */}
                    {openMenuId === item.id && (
                      <div className="absolute right-4 top-12 z-30 w-40 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 text-left text-xs font-semibold animate-in fade-in zoom-in-95">
                        <button
                          onClick={() => {
                            setDetailModalCompany(item);
                            setOpenMenuId(null);
                          }}
                          className="w-full flex items-center gap-2.5 px-3.5 py-2 text-slate-700 hover:bg-slate-50 transition"
                        >
                          <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                          Détails
                        </button>

                        <button
                          onClick={() => handleAccept(item.id)}
                          className="w-full flex items-center gap-2.5 px-3.5 py-2 text-emerald-600 hover:bg-emerald-50 transition"
                        >
                          <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                          Accepter
                        </button>

                        <button
                          onClick={() => {
                            setRejectModalCompany(item);
                            setRejectionInput("");
                            setOpenMenuId(null);
                          }}
                          className="w-full flex items-center gap-2.5 px-3.5 py-2 text-pink-600 hover:bg-pink-50 transition"
                        >
                          <svg className="w-4 h-4 text-pink-600" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                          Refuser
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1 : DÉTAILS D'UNE ENTREPRISE */}
      {detailModalCompany && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs text-slate-400 font-mono">{detailModalCompany.id}</span>
                <h3 className="text-lg font-bold text-slate-900">{detailModalCompany.name}</h3>
              </div>
              <button
                onClick={() => setDetailModalCompany(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="py-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <div>
                  <span className="text-slate-400 block font-medium">Type</span>
                  <span className="font-semibold text-slate-800">{detailModalCompany.type}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Statut</span>
                  <span className="font-semibold text-slate-800 capitalize">{detailModalCompany.status}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">SIRET</span>
                  <span className="font-mono text-slate-800 font-semibold">{detailModalCompany.siret}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Code NAF</span>
                  <span className="font-mono text-slate-800 font-semibold">{detailModalCompany.naf}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Contact</span>
                  <span className="text-slate-800 font-semibold">{detailModalCompany.contactName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Téléphone</span>
                  <span className="font-mono text-slate-800 font-semibold">{detailModalCompany.phone}</span>
                </div>
              </div>

              {detailModalCompany.rejectionReason && (
                <div className="p-3 bg-pink-50 border border-pink-200 rounded-2xl text-pink-700">
                  <span className="font-bold block mb-1">Motif du refus :</span>
                  {detailModalCompany.rejectionReason}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                onClick={() => setDetailModalCompany(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2 : MOTIF DE REFUS */}
      {rejectModalCompany && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-slate-900 mb-1">Refuser le dossier</h3>
            <p className="text-xs text-slate-500 mb-4">
              Veuillez indiquer le motif du refus pour <span className="font-semibold text-slate-800">{rejectModalCompany.name}</span>.
            </p>

            <textarea
              rows={4}
              value={rejectionInput}
              onChange={(e) => setRejectionInput(e.target.value)}
              placeholder="Ex: Document Kbis périmé, information manquante..."
              className="w-full text-xs p-3 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 text-slate-800"
            />

            <div className="flex items-center justify-end gap-2 mt-4">
              <button
                onClick={() => setRejectModalCompany(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 transition"
              >
                Annuler
              </button>
              <button
                onClick={handleConfirmReject}
                className="px-4 py-2 rounded-xl bg-pink-600 hover:bg-pink-700 text-white text-xs font-semibold transition shadow-xs"
              >
                Confirmer le refus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}