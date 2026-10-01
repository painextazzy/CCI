"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";

export interface CompanyRequest {
  id: string;
  companyName: string;
  companyType: "HAUTE_MATSIATRA" | "OTHER_REGION" | "INTERNATIONAL";
  nif: string;
  stat: string;
  managerName: string;
  phone: string;
  createdAt: string;
  verificationStatus: "PENDING" | "APPROVED" | "REJECTED";
  kbisUrl?: string;
  rejectionReason?: string;
}

interface PendingCompaniesClientProps {
  initialCompanies?: CompanyRequest[];
}

export default function PendingCompaniesClient({
  initialCompanies = [],
}: PendingCompaniesClientProps) {
  const [companies, setCompanies] = useState<CompanyRequest[]>(initialCompanies ?? []);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");

  // États pour le menu d'actions (Dropdown) et la modale de refus
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [rejectingCompany, setRejectingCompany] = useState<CompanyRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);

  // Fermer le menu si on clique en dehors
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenuId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const safeCompanies = Array.isArray(companies) ? companies : [];

  const filteredCompanies = safeCompanies.filter((company) => {
    if (!company) return false;

    const matchesSearch =
      (company.companyName?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (company.nif || "").includes(searchQuery) ||
      (company.stat || "").includes(searchQuery) ||
      (company.managerName?.toLowerCase() || "").includes(searchQuery.toLowerCase());

    const matchesStatus =
      selectedStatus === "ALL" || company.verificationStatus === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  const countStatus = (status: string) => {
    if (status === "ALL") return safeCompanies.length;
    return safeCompanies.filter((c) => c?.verificationStatus === status).length;
  };

  // Fonction pour approuver directement
  const handleApprove = async (id: string) => {
    try {
      // Exemple d'appel API (à adapter selon vos routes backend)
      // await fetch(`/api/companies/${id}/approve`, { method: "PATCH" });
      
      setCompanies((prev) =>
        prev.map((c) => (c.id === id ? { ...c, verificationStatus: "APPROVED" } : c))
      );
      setActiveMenuId(null);
    } catch (error) {
      console.error("Erreur lors de l'approbation", error);
    }
  };

  // Fonction pour soumettre le refus avec motif
  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingCompany) return;

    setIsSubmitting(true);
    try {
      // Exemple d'appel API :
      // await fetch(`/api/companies/${rejectingCompany.id}/reject`, {
      //   method: "PATCH",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ reason: rejectionReason }),
      // });

      setCompanies((prev) =>
        prev.map((c) =>
          c.id === rejectingCompany.id
            ? { ...c, verificationStatus: "REJECTED", rejectionReason }
            : c
        )
      );
      setRejectingCompany(null);
      setRejectionReason("");
    } catch (error) {
      console.error("Erreur lors du refus", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 mt-1 w-full text-slate-800 relative">
      
      {/* Barre d'outils supérieure : Recherche & Filtres */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-white/80 p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs backdrop-blur-md">
        <div className="relative w-full lg:w-80">
          <svg
            className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Rechercher (Nom, NIF, STAT, Resp.)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 text-xs bg-white border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-500/35 focus:border-emerald-500 text-slate-700 placeholder-slate-400 py-2.5 shadow-2xs transition"
          />
        </div>

        <div className="flex items-center gap-1.5 flex-wrap justify-end">
          {[
            { label: "Toutes", value: "ALL" },
            { label: "En attente", value: "PENDING" },
            { label: "Approuvées", value: "APPROVED" },
            { label: "Refusées", value: "REJECTED" },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setSelectedStatus(tab.value)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition ${
                selectedStatus === tab.value
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-700"
              }`}
            >
              {tab.label} ({countStatus(tab.value)})
            </button>
          ))}
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
                <th className="py-3.5 px-3">NIF / STAT</th>
                <th className="py-3.5 px-4">Responsable</th>
                <th className="py-3.5 px-3">Date</th>
                <th className="py-3.5 px-3">Statut</th>
                <th className="py-3.5 px-4 text-center rounded-r-2xl">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm font-normal text-slate-700">
              {filteredCompanies.length > 0 ? (
                filteredCompanies.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition relative">
                    
                    <td className="py-4 px-4 font-bold text-slate-900 text-sm whitespace-nowrap">
                      {item.companyName}
                    </td>

                    <td className="py-4 px-3 whitespace-nowrap">
                      <span
                        className={`px-2.5 py-1 rounded-full font-bold text-xs border ${
                          item.companyType === "HAUTE_MATSIATRA"
                            ? "bg-purple-50 text-purple-700 border-purple-200/60"
                            : item.companyType === "OTHER_REGION"
                            ? "bg-blue-50 text-blue-700 border-blue-200/60"
                            : "bg-slate-100 text-slate-600 border-slate-200/60"
                        }`}
                      >
                        {item.companyType === "HAUTE_MATSIATRA"
                          ? "Haute Matsiatra"
                          : item.companyType === "OTHER_REGION"
                          ? "Autre Région"
                          : "International"}
                      </span>
                    </td>

                    <td className="py-4 px-3 font-mono text-xs text-slate-600 whitespace-nowrap">
                      <span className="font-semibold text-slate-900 block">{item.nif}</span>
                      <span className="text-[11px] text-slate-400 font-sans">{item.stat}</span>
                    </td>

                    <td className="py-4 px-4 whitespace-nowrap">
                      <p className="font-semibold text-slate-800 text-sm">{item.managerName}</p>
                      <p className="text-xs text-slate-500 font-mono">{item.phone}</p>
                    </td>

                    <td className="py-4 px-3 text-slate-600 text-xs whitespace-nowrap">
                      {item.createdAt
                        ? new Intl.DateTimeFormat("fr-FR", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          }).format(new Date(item.createdAt))
                        : "-"}
                    </td>

                    <td className="py-4 px-3 whitespace-nowrap">
                      {item.verificationStatus === "PENDING" && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" /> En attente
                        </span>
                      )}
                      {item.verificationStatus === "APPROVED" && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <span className="w-2 h-2 rounded-full bg-emerald-500" /> Approuvée
                        </span>
                      )}
                      {item.verificationStatus === "REJECTED" && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-pink-50 text-pink-600 border border-pink-200">
                          <span className="w-2 h-2 rounded-full bg-pink-500" /> Refusée
                        </span>
                      )}
                    </td>

                    {/* Actions : Menu déroulant avec 3 points */}
                    <td className="py-4 px-4 text-center whitespace-nowrap relative">
                      <button
                        onClick={() =>
                          setActiveMenuId(activeMenuId === item.id ? null : item.id)
                        }
                        className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-slate-100 hover:bg-emerald-600 hover:text-white text-slate-600 transition shadow-2xs"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 13a1 1 0 100-2 1 1 0 000 2zM12 7a1 1 0 100-2 1 1 0 000 2zM12 19a1 1 0 100-2 1 1 0 000 2z" />
                        </svg>
                      </button>

                      {/* Menu contextuel (Dropdown) */}
                      {activeMenuId === item.id && (
                        <div
                          ref={menuRef}
                          className="absolute right-12 top-10 w-44 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 z-50 text-left animate-in fade-in zoom-in-95 duration-150"
                        >
                          <Link
                            href={`/admin/companies/${item.id}`}
                            className="w-full px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                          >
                            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            Voir détails
                          </Link>

                          <button
                            onClick={() => handleApprove(item.id)}
                            className="w-full px-4 py-2 text-xs font-medium text-emerald-600 hover:bg-emerald-50 flex items-center gap-2"
                          >
                            <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                            Accepter
                          </button>

                          <button
                            onClick={() => {
                              setRejectingCompany(item);
                              setActiveMenuId(null);
                            }}
                            className="w-full px-4 py-2 text-xs font-medium text-pink-600 hover:bg-pink-50 flex items-center gap-2 border-t border-slate-100 mt-1 pt-1"
                          >
                            <svg className="w-4 h-4 text-pink-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Refuser
                          </button>
                        </div>
                      )}
                    </td>

                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 text-xs font-medium">
                    Aucune demande d'entreprise ne correspond à votre recherche.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODALE DE REFUS AVEC MOTIF */}
      {rejectingCompany && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Motif du refus
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Veuillez indiquer la raison du refus pour <span className="font-semibold text-slate-700">{rejectingCompany.companyName}</span>.
            </p>

            <form onSubmit={handleRejectSubmit} className="flex flex-col gap-4">
              <textarea
                required
                rows={4}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Ex : Numéro NIF invalide ou documents illisibles..."
                className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 text-slate-700 placeholder-slate-400 resize-none transition"
              />

              <div className="flex items-center justify-end gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => {
                    setRejectingCompany(null);
                    setRejectionReason("");
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-pink-600 hover:bg-pink-700 text-white transition shadow-sm disabled:opacity-50"
                >
                  {isSubmitting ? "Enregistrement..." : "Confirmer le refus"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}