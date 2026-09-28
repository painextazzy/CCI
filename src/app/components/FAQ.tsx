"use client";

import { useState } from "react";

export default function FAQ() {
  const faqs = [
    {
      q: "L'inscription à Co-Hub est-elle gratuite ?",
      a: "Oui. L'inscription est entièrement gratuite pour toutes les entreprises légalement immatriculées à Madagascar. Aucune commission n'est prélevée sur vos contrats. Seules des options premium (mise en avant, accompagnement export renforcé) peuvent être facturées.",
    },
    {
      q: "Comment vérifiez-vous les entreprises inscrites ?",
      a: "Chaque entreprise est contrôlée sur son NIF, son numéro statistique et son immatriculation auprès de la CCI de Fianarantsoa. La vérification est effectuée sous 24h ouvrées. Les entreprises non conformes sont automatiquement rejetées.",
    },
    {
      q: "Puis-je publier une opportunité sans être membre ?",
      a: "Non. La publication d'opportunités (appels d'offres, recherche de partenaires, sous-traitance) est réservée aux entreprises vérifiées. Cela garantit la fiabilité et la qualité des échanges sur la plateforme.",
    },
    {
      q: "Quels secteurs sont couverts ?",
      a: "Tous les secteurs sont représentés : agro-business, artisanat, tourisme, BTP, transport, TIC, services aux entreprises, commerce de gros, industrie manufacturière. Les filières prioritaires de la Haute Matsiatra (thé, café, riz, girofle, vanille) bénéficient d'un accompagnement renforcé.",
    },
    {
      q: "Mes données sont-elles protégées ?",
      a: "Oui. Vos données sont hébergées à Madagascar et traitées conformément à la loi malgache sur la protection des données personnelles. Aucune information confidentielle n'est partagée sans votre accord explicite.",
    },
    {
      q: "Comment contacter un conseiller CCI ?",
      a: "Depuis votre espace membre, vous pouvez solliciter un rendez-vous avec un conseiller de la CCI de Fianarantsoa. Le rendez-vous peut se faire en présentiel à Fianarantsoa ou en visioconférence, selon votre préférence.",
    },
  ];

  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-24 bg-white border-t border-slate-100">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* En-tête */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50 border border-teal-200/70 text-teal-800 text-xs font-semibold uppercase tracking-wider mb-4">
            <span className="w-2 h-2 rounded-full bg-teal-600" />
            Questions fréquentes
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-corporate-navy tracking-tight mb-4">
            Vous avez des questions ?
          </h2>
          <p className="text-sm sm:text-base text-slate-600">
            Retrouvez les réponses aux questions les plus posées par les
            entreprises de la région.
          </p>
        </div>

        {/* Accordéon */}
        <div className="space-y-3">
          {faqs.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <div
                key={i}
                className={`rounded-2xl border transition-all duration-200 ${
                  isOpen
                    ? "bg-teal-50/40 border-teal-200"
                    : "bg-white border-slate-200 hover:border-teal-200"
                }`}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="w-full flex items-center justify-between gap-4 text-left px-6 py-5"
                  aria-expanded={isOpen}
                >
                  <span className="text-sm sm:text-base font-bold text-corporate-navy pr-4">
                    {faq.q}
                  </span>
                  <span
                    className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 ${
                      isOpen
                        ? "bg-teal-600 text-white rotate-45"
                        : "bg-teal-50 text-teal-700"
                    }`}
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M12 5v14M5 12h14"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </button>

                <div
                  className={`grid transition-all duration-300 ease-in-out ${
                    isOpen
                      ? "grid-rows-[1fr] opacity-100"
                      : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="text-sm text-slate-600 leading-relaxed px-6 pb-5">
                      {faq.a}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA bas */}
        <div className="mt-12 text-center">
          <p className="text-xs text-slate-500 mb-4">
            Vous ne trouvez pas votre réponse ?
          </p>
          <a
            href="#contact"
            className="inline-flex items-center gap-2 text-sm font-bold text-teal-700 hover:text-teal-900 transition-colors"
          >
            Contacter un conseiller CCI
            <span>→</span>
          </a>
        </div>
      </div>
    </section>
  );
}