"use client";

export default function SummaryBar() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const features = [
    "Algorithme de matching IA",
    "Réseau vérifié SIRET",
    "Accompagnement neutre CCI",
    "Contrats sécurisés RGPD",
  ];

  return (
    <section className="relative z-30 -mt-10 lg:-mt-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 bg-white rounded-3xl p-6 sm:p-8 shadow-[0_20px_50px_rgba(15,23,42,0.08)] border border-slate-100">
          {/* Card 1 — Newsletter */}
          <div className="md:col-span-5 bg-gradient-to-br from-teal-700 to-teal-800 rounded-2xl p-6 text-white flex flex-col justify-between shadow-md shadow-teal-900/10">
            <div>
              <h3 className="text-lg font-bold tracking-tight text-white mb-2">
                Restez informé des nouveaux appels d&apos;offres
              </h3>
              <p className="text-teal-100 text-xs leading-relaxed mb-6">
                Recevez quotidiennement les projets consulaires et opportunités
                B2B correspondant précisément à votre code NAF.
              </p>
            </div>
            <form
              onSubmit={handleSubmit}
              className="flex items-center gap-2 bg-teal-900/50 p-1.5 rounded-full border border-teal-500/40"
            >
              <input
                className="w-full bg-transparent border-0 text-white placeholder-teal-300/70 text-xs px-3 focus:ring-0 focus:outline-none"
                placeholder="Votre email professionnel..."
                required
                type="email"
              />
              <button
                className="shrink-0 bg-white text-teal-800 hover:bg-teal-50 text-xs font-bold px-4 py-2 rounded-full transition shadow-sm"
                type="submit"
              >
                S&apos;inscrire
              </button>
            </form>
          </div>

          {/* Card 2 — Features */}
          <div className="md:col-span-3 flex flex-col justify-center py-2 px-2 border-slate-100 md:border-r">
            <ul className="space-y-3 text-xs font-medium text-slate-700">
              {features.map((item) => (
                <li key={item} className="flex items-center gap-2.5">
                  <svg
                    className="w-4 h-4 text-teal-600 shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M5 13l4 4L19 7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2.5"
                    />
                  </svg>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Card 3 — Help */}
          <div className="md:col-span-4 flex flex-col justify-between py-2 px-2">
            <div>
              <h4 className="text-base font-bold text-corporate-navy mb-2">
                Comment pouvons-nous vous aider ?
              </h4>
              <p className="text-slate-500 text-xs leading-relaxed">
                Un conseiller consulaire vous guide dans votre recherche de
                sous-traitants fiables, d&apos;appels à partenariats et de
                débouchés exports.
              </p>
            </div>
            <div className="pt-4">
              <a
                className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-600 hover:text-teal-800 transition-colors"
                href="#contact"
              >
                <span>En savoir plus sur l&apos;accompagnement</span>
                <span className="text-base leading-none">→</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}