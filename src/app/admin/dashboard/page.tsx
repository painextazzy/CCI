"use client";

import Link from "next/link";

export default function AdminDashboardPage() {
  // Données de démo
  const user = { name: "Sujon" };

  const engagementData = [
    { month: "JAN", value: 1800 },
    { month: "FEB", value: 4200 },
    { month: "MAR", value: 2800 },
    { month: "APR", value: 4600, highlight: true },
    { month: "MAY", value: 3200 },
    { month: "JUN", value: 4400 },
  ];

  const paymentHistory = [
    { name: "Dribbble Design", date: "16 Juin 2025", time: "10:30 PM", amount: "89 345.23 USD", percent: "+18.67%", color: "bg-pink-100" },
    { name: "Google Pay", date: "15 Juin 2025", time: "11:45 PM", amount: "12 345.89 USD", percent: "+9.34%", color: "bg-blue-100" },
    { name: "Amazon Shopping", date: "14 Juin 2025", time: "10:15 PM", amount: "32 123.67 USD", percent: "+12.23%", color: "bg-amber-100" },
  ];

  const pendingRequests = [
    { name: "Nexus Technologies", date: "16 Juin 2025", amount: "89 345.23 USD" },
    { name: "Google Pay SARL", date: "15 Juin 2025", amount: "12 345.89 USD" },
    { name: "Amazon Shopping", date: "14 Juin 2025", amount: "32 123.67 USD" },
  ];

  return (
    <div className="min-h-screen bg-[#f5f7f6] p-4 sm:p-6">
      {/* Conteneur principal — style carte blanche arrondie */}
      <div className="max-w-[1600px] mx-auto bg-[#fbfcfb] rounded-[32px] p-4 sm:p-6 lg:p-8 shadow-[0_4px_30px_-10px_rgba(15,23,42,0.06)]">
        
        {/* ═══════════════════════════════════════════════════════════
            LIGNE 1 — Salutation + Actions
            ═══════════════════════════════════════════════════════════ */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
            Bon retour, <span className="text-slate-400 font-light">{user.name}</span>
          </h1>

          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white border border-slate-200 hover:bg-slate-50 transition text-xs font-semibold text-slate-700 shadow-xs">
              <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              29 Juin, 2025 – 29 Août, 2025
              <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            <button className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white border border-slate-200 hover:bg-slate-50 transition text-xs font-semibold text-slate-700 shadow-xs">
              <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                <line x1="12" y1="5" x2="12" y2="19" strokeLinecap="round" />
                <line x1="5" y1="12" x2="19" y2="12" strokeLinecap="round" />
              </svg>
              Nouvelle demande
            </button>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════
            GRILLE PRINCIPALE : Sidebar + Contenu
            ═══════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr_320px] gap-4 sm:gap-5">
          
          {/* ───── COLONNE GAUCHE : Sidebar icônes ───── */}
          <aside className="hidden lg:flex flex-col gap-3 w-14">
            {/* Bouton dashboard actif */}
            <Link
              href="/admin/dashboard"
              className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                <rect x="3" y="3" width="7" height="7" rx="1.5" />
                <rect x="14" y="3" width="7" height="7" rx="1.5" />
                <rect x="3" y="14" width="7" height="7" rx="1.5" />
                <rect x="14" y="14" width="7" height="7" rx="1.5" />
              </svg>
            </Link>

            {[
              { icon: "chart", href: "/admin/reports" },
              { icon: "wallet", href: "/admin/payments" },
              { icon: "users", href: "/admin/users" },
              { icon: "mail", href: "/admin/messages" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="w-14 h-14 rounded-2xl bg-white border border-slate-200/80 text-slate-500 hover:text-emerald-600 hover:border-emerald-300 flex items-center justify-center transition shadow-xs"
              >
                {item.icon === "chart" && (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <line x1="18" y1="20" x2="18" y2="10" strokeLinecap="round" />
                    <line x1="12" y1="20" x2="12" y2="4" strokeLinecap="round" />
                    <line x1="6" y1="20" x2="6" y2="14" strokeLinecap="round" />
                  </svg>
                )}
                {item.icon === "wallet" && (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <rect x="2" y="6" width="20" height="14" rx="2" />
                    <path d="M2 10h20" />
                  </svg>
                )}
                {item.icon === "users" && (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                )}
                {item.icon === "mail" && (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <path d="m22 7-10 7L2 7" />
                  </svg>
                )}
              </Link>
            ))}

            <div className="flex-1" />

            <Link
              href="/admin/settings"
              className="w-14 h-14 rounded-2xl bg-white border border-slate-200/80 text-slate-500 hover:text-emerald-600 hover:border-emerald-300 flex items-center justify-center transition shadow-xs"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </Link>
          </aside>

          {/* ───── COLONNE CENTRALE : Cartes principales ───── */}
          <div className="space-y-4 sm:space-y-5">
            
            {/* Rangée 1 : Payment Goal + Engagement Rate */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-5">
              
              {/* Carte Payment Goal (verte) */}
              <div className="bg-white rounded-3xl p-5 border border-slate-100">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-xs font-bold text-slate-900">Objectif du mois</p>
                    <p className="text-[10px] text-slate-400 font-medium">Total des demandes traitées</p>
                  </div>
                  <button className="w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-500 transition">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                      <path d="M7 17L17 7M17 7H8M17 7v9" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>

                {/* Carte verte "VISA" style */}
                <div className="relative bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-800 rounded-2xl p-5 text-white shadow-lg shadow-emerald-900/20 overflow-hidden">
                  <div className="absolute top-4 right-5 text-white/80">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                    </svg>
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-200 mb-1">
                    Total validé
                  </p>
                  <p className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-5">
                    78 989,09 <span className="text-sm font-bold">Ar</span>
                  </p>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-mono tracking-wider">•••• 909090</span>
                    <span className="text-emerald-200">EXP 09/26</span>
                  </div>
                </div>

                {/* Weekly Revenue */}
                <div className="mt-4 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-slate-400 font-medium">Revenus hebdo</p>
                    <p className="text-lg font-extrabold text-slate-900">+3 945 USD</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                    +12,8%
                  </span>
                </div>
              </div>

              {/* Carte Engagement Rate (graphique) */}
              <div className="bg-white rounded-3xl p-5 border border-slate-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <rect x="3" y="4" width="18" height="16" rx="2" />
                        <path d="M3 10h18" />
                      </svg>
                    </div>
                    <p className="text-xs font-bold text-slate-900">Taux d&apos;engagement</p>
                  </div>
                  <div className="flex items-center gap-1 bg-slate-100 rounded-full p-0.5">
                    <button className="px-3 py-1 text-[10px] font-bold rounded-full text-slate-500 hover:text-slate-900 transition">
                      Mensuel
                    </button>
                    <button className="px-3 py-1 text-[10px] font-bold rounded-full bg-emerald-600 text-white shadow-sm">
                      Annuel
                    </button>
                  </div>
                </div>

                {/* Graphique à barres */}
                <div className="relative h-40 flex items-end justify-between gap-2 sm:gap-3 pt-6">
                  {/* Ligne de référence */}
                  <div className="absolute inset-x-0 top-6 bottom-6 border-t border-dashed border-slate-200" />

                  {engagementData.map((item, i) => (
                    <div key={item.month} className="flex-1 flex flex-col items-center gap-2 relative z-10">
                      {item.highlight && (
                        <div className="absolute -top-5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[9px] font-bold whitespace-nowrap">
                          +17,8%
                        </div>
                      )}
                      <div
                        className={`w-full rounded-t-xl transition-all duration-500 ${
                          item.highlight
                            ? "bg-emerald-700 shadow-lg shadow-emerald-700/30"
                            : "bg-emerald-200"
                        }`}
                        style={{ height: `${(item.value / 5000) * 100}%` }}
                      />
                      <span className="text-[9px] font-bold text-slate-400 uppercase">
                        {item.month}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Rangée 2 : Payment History */}
            <div className="bg-white rounded-3xl p-5 border border-slate-100">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-bold text-slate-900">Historique des demandes</p>
                  <p className="text-[10px] text-slate-400 font-medium">Dernières demandes d&apos;inscription</p>
                </div>
                <button className="w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-500 transition">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                    <path d="M7 17L17 7M17 7H8M17 7v9" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>

              {/* En-têtes du tableau */}
              <div className="grid grid-cols-12 gap-3 pb-3 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <div className="col-span-4">Nom</div>
                <div className="col-span-3">Date</div>
                <div className="col-span-2">Heure</div>
                <div className="col-span-3 text-right">Montant</div>
              </div>

              {/* Lignes */}
              <div className="divide-y divide-slate-50">
                {paymentHistory.map((item, i) => (
                  <div key={i} className="grid grid-cols-12 gap-3 py-3 items-center">
                    <div className="col-span-4 flex items-center gap-3 min-w-0">
                      <div className={`w-8 h-8 rounded-lg ${item.color} flex items-center justify-center shrink-0`}>
                        <span className="text-xs font-bold text-slate-700">
                          {item.name.charAt(0)}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-800 truncate">{item.name}</p>
                        <p className="text-[10px] text-emerald-600 font-semibold">{item.percent}</p>
                      </div>
                    </div>
                    <div className="col-span-3 text-[11px] text-slate-500">{item.date}</div>
                    <div className="col-span-2 text-[11px] text-slate-500">{item.time}</div>
                    <div className="col-span-3 text-right">
                      <span className="text-xs font-bold text-slate-900">{item.amount}</span>
                      <span className="ml-2 inline-flex w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ───── COLONNE DROITE : Cartes secondaires ───── */}
          <div className="space-y-4 sm:space-y-5">
            
            {/* Carte Balance (graphique lignes) */}
            <div className="bg-white rounded-3xl p-5 border border-slate-100">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-xs font-bold text-slate-900">Solde total</p>
                  <p className="text-[10px] text-slate-400 font-medium">Revenus annuels</p>
                </div>
                <button className="w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-500 transition">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                    <path d="M7 17L17 7M17 7H8M17 7v9" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>

              <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-4">
                32 678,90 <span className="text-sm font-bold text-slate-500">USD</span>
              </p>

              {/* Graphique courbe */}
              <div className="relative h-20 mb-4">
                <svg viewBox="0 0 300 80" className="w-full h-full">
                  <defs>
                    <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M 0 50 Q 40 20 80 40 T 160 30 T 240 45 T 300 25"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M 0 50 Q 40 20 80 40 T 160 30 T 240 45 T 300 25 L 300 80 L 0 80 Z"
                    fill="url(#areaGradient)"
                  />
                </svg>
              </div>

              <div className="flex gap-2">
                <button className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-full bg-emerald-600 text-white text-[11px] font-bold hover:bg-emerald-700 transition">
                  Envoyer
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path d="M12 19V5M5 12l7-7 7 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <button className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-full bg-white border border-slate-200 text-slate-700 text-[11px] font-bold hover:bg-slate-50 transition">
                  Recevoir
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path d="M12 5v14M5 12l7 7 7-7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Carte Amount of credit */}
            <div className="bg-white rounded-3xl p-5 border border-slate-100">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <rect x="2" y="6" width="20" height="14" rx="2" />
                    <path d="M2 10h20" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">Montant du crédit</p>
                  <p className="text-[10px] text-slate-400 font-medium">Total des remboursements</p>
                </div>
              </div>

              <div className="flex items-baseline gap-2 mb-1">
                <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  8 945,89
                </p>
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                  +2,8%
                </span>
              </div>
            </div>

            {/* Carte Mandatory Payments */}
            <div className="bg-white rounded-3xl p-5 border border-slate-100">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-xs font-bold text-slate-900">Paiements obligatoires</p>
                  <p className="text-[10px] text-slate-400 font-medium">Derniers paiements</p>
                </div>
                <button className="w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-500 transition">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                    <path d="M7 17L17 7M17 7H8M17 7v9" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>

              {/* Avatars empilés */}
              <div className="flex items-center">
                {pendingRequests.slice(0, 3).map((_, i) => (
                  <div
                    key={i}
                    className="relative w-9 h-9 rounded-full overflow-hidden ring-2 ring-white shadow-sm -ml-2 first:ml-0"
                  >
                    <div className="w-full h-full bg-gradient-to-br from-emerald-500 to-emerald-700" />
                  </div>
                ))}
                <div className="relative w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold ring-2 ring-white shadow-sm -ml-2">
                  +2
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}