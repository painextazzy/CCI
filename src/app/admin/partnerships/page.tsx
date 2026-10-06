"use client";

import { useState } from "react";

export default function AdminPartnershipsPage() {
  const [searchTerm, setSearchTerm] = useState("");

  // Données fictives illustrant les connexions créées de manière autonome par les entreprises
  const partnerships = [
    {
      id: "p1",
      senderCompany: "Madagascar Tech & Data",
      receiverCompany: "AgriExport Matsiatra",
      purpose: "Intégration d'une solution de traçabilité numérique",
      date: "10 Oct 2026",
      status: "ACTIF / EN COURS",
    },
    {
      id: "p2",
      senderCompany: "Bâtiment Plus Fianarantsoa",
      receiverCompany: "Énergie Verte Sud",
      purpose: "Fourniture de matériel pour projet solaire",
      date: "02 Oct 2026",
      status: "ACTIF / EN COURS",
    },
    {
      id: "p3",
      senderCompany: "Textile Haute-Matsiatra",
      receiverCompany: "Logistique Express Madagascar",
      purpose: "Contrat de transport et distribution régionale",
      date: "28 Sep 2026",
      status: "FINALISÉ",
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      
      {/* 1. En-tête de la page */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900">Observatoire des Partenariats B2B</h1>
          <p className="text-xs text-slate-500">Suivi des connexions et des synergies professionnelles créées entre les membres.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-200/60">
            {partnerships.length} Connexions Actives
          </span>
        </div>
      </div>

      {/* 2. Indicateurs rapides (KPIs de l'écosystème) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total des Mises en Relation</p>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">42</p>
          <p className="text-[11px] text-emerald-600 font-medium mt-1">↑ +12% ce mois-ci</p>
        </div>
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Secteur le plus actif</p>
          <p className="text-xl font-extrabold text-slate-900 mt-1">Agro-industrie & IT</p>
          <p className="text-[11px] text-slate-500 font-medium mt-1">Forte synergie régionale</p>
        </div>
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Taux de concrétisation</p>
          <p className="text-2xl font-extrabold text-emerald-600 mt-1">88%</p>
          <p className="text-[11px] text-slate-500 font-medium mt-1">Échanges validés entre pairs</p>
        </div>
      </div>

      {/* 3. Barre de recherche */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs flex items-center justify-between">
        <div className="relative w-full sm:w-80">
          <svg className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Filtrer par entreprise..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs pl-9 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-emerald-500 bg-slate-50/50"
          />
        </div>
      </div>

      {/* 4. Tableau de suivi des partenariats */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50/80 border-b border-slate-100 font-semibold text-slate-700">
              <tr>
                <th className="px-6 py-3.5">Entreprise Initiatrice</th>
                <th className="px-6 py-3.5">Entreprise Cible</th>
                <th className="px-6 py-3.5">Objet / Type de Projet</th>
                <th className="px-6 py-3.5">Date</th>
                <th className="px-6 py-3.5">Statut</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {partnerships.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition">
                  <td className="px-6 py-4 font-bold text-slate-900">{item.senderCompany}</td>
                  <td className="px-6 py-4 font-bold text-slate-900">{item.receiverCompany}</td>
                  <td className="px-6 py-4 text-slate-600">{item.purpose}</td>
                  <td className="px-6 py-4 text-slate-500">{item.date}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-slate-600 hover:text-emerald-600 font-bold transition">
                      Détails
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}