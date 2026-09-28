import Link from "next/link";

export default function OpportunitiesPreview() {
  const opportunities = [
    {
      sector: "Agro-business",
      title: "Recherche sous-traitant transformation de thé",
      location: "Fianarantsoa I",
      budget: "50 – 120 M Ar",
      deadline: "Il y a 2h",
      type: "Sous-traitance",
      urgent: true,
    },
    {
      sector: "Export",
      title: "Partenaire distribution café Bourbon – Europe",
      location: "Ambalavao",
      budget: "Sur devis",
      deadline: "Il y a 5h",
      type: "Partenariat export",
      urgent: false,
    },
    {
      sector: "Artisanat",
      title: "Fournisseur vannerie pour boutique Antananarivo",
      location: "Isandra",
      budget: "15 – 30 M Ar",
      deadline: "Hier",
      type: "Achat groupé",
      urgent: false,
    },
    {
      sector: "Tourisme",
      title: "Prestataire écotourisme – Parc Ranomafana",
      location: "Vohibato",
      budget: "80 – 200 M Ar",
      deadline: "Il y a 1j",
      type: "Appel d'offres",
      urgent: true,
    },
  ];

  return (
    <section
      id="opportunites"
      className="py-24 bg-gradient-to-b from-[#fbfdfd] to-[#f2faf8]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* En-tête */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-teal-600 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Opportunités en direct
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-corporate-navy tracking-tight mb-3">
              Les dernières opportunités publiées
            </h2>
            <p className="text-sm sm:text-base text-slate-600 max-w-xl">
              Mises à jour en temps réel par les entreprises certifiées CCI de
              la région Haute Matsiatra.
            </p>
          </div>
          <Link
            href="#opportunites"
            className="inline-flex items-center gap-2 text-sm font-bold text-teal-700 hover:text-teal-900 transition-colors self-start sm:self-auto"
          >
            Voir toutes les opportunités
            <span>→</span>
          </Link>
        </div>

        {/* Grille */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {opportunities.map((opp, i) => (
            <div
              key={i}
              className="group bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-xl hover:border-teal-200 hover:-translate-y-1 transition-all duration-300"
            >
              {/* Ligne du haut : secteur + type */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-teal-50 text-teal-700 border border-teal-100">
                  {opp.sector}
                </span>
                <div className="flex items-center gap-2">
                  {opp.urgent && (
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                      Urgent
                    </span>
                  )}
                  <span className="text-[11px] text-slate-400">
                    {opp.deadline}
                  </span>
                </div>
              </div>

              {/* Titre */}
              <h3 className="text-base font-bold text-corporate-navy leading-snug mb-4 group-hover:text-teal-700 transition-colors">
                {opp.title}
              </h3>

              {/* Détails */}
              <div className="grid grid-cols-2 gap-3 mb-5 text-xs">
                <div className="flex items-center gap-2 text-slate-500">
                  <svg
                    className="w-3.5 h-3.5 text-teal-600 shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                    />
                    <path
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                    />
                  </svg>
                  {opp.location}
                </div>
                <div className="flex items-center gap-2 text-slate-500">
                  <svg
                    className="w-3.5 h-3.5 text-teal-600 shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                    />
                  </svg>
                  {opp.budget}
                </div>
              </div>

              {/* Footer : type + lien */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <span className="text-[11px] font-semibold text-slate-500">
                  {opp.type}
                </span>
                <Link
                  href="#"
                  className="inline-flex items-center gap-1 text-xs font-bold text-teal-700 hover:text-teal-900 transition-colors"
                >
                  Postuler
                  <span>→</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}