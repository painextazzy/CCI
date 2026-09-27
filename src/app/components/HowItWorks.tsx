import Link from "next/link";

export default function HowItWorks() {
  const steps = [
    {
      number: "01",
      title: "Créez votre compte entreprise",
      description:
        "Inscription en 2 minutes. Vérification automatique de votre SIRET et de votre immatriculation au greffe consulaire sous 24h ouvrées.",
      icon: (
        <path
          d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM22 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
        />
      ),
    },
    {
      number: "02",
      title: "Publiez ou recherchez une opportunité",
      description:
        "Notre algorithme de matching IA vous propose les partenaires et appels d'offres correspondant à votre code NAF, votre région et vos certifications.",
      icon: (
        <path
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
        />
      ),
    },
    {
      number: "03",
      title: "Échangez et contractualisez",
      description:
        "Messagerie sécurisée, contrats types CCI et accompagnement neutre de votre conseiller territorial pour sécuriser chaque négociation.",
      icon: (
        <path
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
        />
      ),
    },
  ];

  return (
    <section
      id="fonctionnement"
      className="py-24 bg-white border-t border-slate-100"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* En-tête */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-teal-600" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Comment ça marche
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-corporate-navy tracking-tight mb-4">
            Trois étapes pour développer votre réseau
          </h2>
          <p className="text-sm sm:text-base text-slate-600">
            Un parcours simple, sécurisé et encadré par les Chambres de
            Commerce et d&apos;Industrie.
          </p>
        </div>

        {/* Étapes */}
        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
          {/* Ligne de connexion (desktop) */}
          <div className="hidden md:block absolute top-16 left-[16%] right-[16%] h-px bg-gradient-to-r from-teal-200 via-teal-400 to-teal-200" />

          {steps.map((step) => (
            <div
              key={step.number}
              className="relative flex flex-col items-center text-center bg-white rounded-3xl p-8 border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group z-10"
            >
              {/* Icône + numéro */}
              <div className="relative mb-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-600 to-teal-800 text-white flex items-center justify-center shadow-lg shadow-teal-700/25 group-hover:scale-105 transition-transform">
                  <svg
                    className="w-7 h-7"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    {step.icon}
                  </svg>
                </div>
                <span className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-white border-2 border-teal-600 text-teal-700 text-[11px] font-extrabold flex items-center justify-center shadow-sm">
                  {step.number}
                </span>
              </div>

              {/* Titre */}
              <h3 className="text-lg font-bold text-corporate-navy mb-3">
                {step.title}
              </h3>

              {/* Description */}
              <p className="text-sm text-slate-500 leading-relaxed mb-6">
                {step.description}
              </p>

              {/* Lien */}
              <Link
                href="#"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 hover:text-teal-900 transition-colors"
              >
                <span>En savoir plus</span>
                <span>→</span>
              </Link>
            </div>
          ))}
        </div>

        {/* CTA en bas de section */}
        <div className="mt-16 text-center">
          <Link
            href="#espace-pro"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white font-semibold text-sm px-8 py-3.5 rounded-full shadow-lg shadow-teal-700/20 hover:shadow-teal-700/30 transition-all duration-200"
          >
            Commencer maintenant
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                d="M14 5l7 7m0 0l-7 7m7-7H3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}