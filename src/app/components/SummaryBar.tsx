"use client";

export default function SummaryBar() {
  const stats = [
    { value: "150 +", label: "Entreprises Régionales" },
    { value: "3 450 +", label: "Opportunités Déposées" },
    { value: "850 +", label: "Mises en Relation" },
    { value: "98 %", label: "Taux de Satisfaction" },
  ];

  return (
    <section className="relative z-30 -mt-10 lg:-mt-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="relative bg-white rounded-3xl p-6 sm:p-10 shadow-[0_20px_50px_rgba(15,23,42,0.08)] border border-slate-100 overflow-visible">
          {/* Cardbox flottante en haut à droite */}


          {/* Contenu : titre + stats */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Titre à gauche */}
            <div className="lg:col-span-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200/70 text-teal-800 text-[11px] font-semibold uppercase tracking-wider mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-600 animate-pulse" />
                Le réseau en chiffres
              </div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-corporate-navy tracking-tight leading-tight mb-2">
                Une communauté d&apos;affaires certifiée CCI
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                Des entreprises vérifiées, des opportunités publiées chaque
                mois et des mises en relation qualifiées par vos conseillers
                territoriaux.
              </p>
            </div>

            {/* Stats à droite */}
            <div className="lg:col-span-8">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
                {stats.map((s) => (
                  <div
                    key={s.label}
                    className="relative flex flex-col items-center text-center bg-slate-50/70 hover:bg-teal-50/60 rounded-2xl py-5 px-3 border border-slate-100 hover:border-teal-200 transition-colors duration-200"
                  >
                    <span className="text-2xl sm:text-3xl font-extrabold text-corporate-navy tracking-tight leading-none mb-1.5">
                      {s.value}
                    </span>
                    <span className="text-[10px] sm:text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      {s.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}