import Link from "next/link";
import type { ReactNode } from "react";
import Reveal from "./Reveal";

type Service = {
  title: string;
  description: string;
  href: string;
  icon: ReactNode;
};

const services: Service[] = [
  {
    title: "Mise en Relation Ciblée",
    description:
      "Algorithme affinitaire selon les codes NAF, les capacités de production et les certifications qualité de votre entreprise.",
    href: "#details-matching",
    icon: (
      <path
        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    ),
  },
  {
    title: "Opportunités d'Affaires",
    description:
      "Accès prioritaire aux appels d'offres privés et publics certifiés par la CCI, vérifiés avant publication pour garantir la solvabilité.",
    href: "#details-offres",
    icon: (
      <path
        d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    ),
  },
  {
    title: "Accompagnement Consulaire",
    description:
      "Conseils neutres de conseillers territoriaux pour structurer vos alliances commerciales et sécuriser vos négociations.",
    href: "#details-conseil",
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

const extraServices: Service[] = [
  {
    title: "Support & Médiation",
    description:
      "Assistance juridique de premier niveau et médiation consulaire en cas de différend contractuel entre pairs.",
    href: "#mediation",
    icon: (
      <path
        d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    ),
  },
  {
    title: "Comptes Entreprises Vérifiés",
    description:
      "Espace de gestion multi-utilisateurs avec gestion fine des habilitations et signature électronique qualifiée eIDAS.",
    href: "#comptes",
    icon: (
      <path
        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    ),
  },
];

function ServiceCard({ title, description, href, icon }: Service) {
  return (
    <div className="bg-white rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 flex flex-col justify-between group h-full">
      <div>
        <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mb-6 group-hover:bg-teal-600 group-hover:text-white transition-colors duration-200">
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {icon}
          </svg>
        </div>
        <h3 className="text-lg font-bold text-corporate-navy mb-2.5">
          {title}
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed mb-6">
          {description}
        </p>
      </div>
      <Link
        className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 hover:text-teal-900 transition-colors"
        href={href}
      >
        <span>En savoir plus</span>
        <span>→</span>
      </Link>
    </div>
  );
}

export default function Services() {
  return (
    <section
      id="services"
      className="py-24 bg-gradient-to-b from-[#fbfdfd] to-[#f2faf8]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* En-tête */}
        <Reveal variant="fade-up" className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-teal-600" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Nos Services
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-corporate-navy tracking-tight mb-4">
            Sécurisez Vos Partenariats Stratégiques
          </h2>
          <p className="text-sm sm:text-base text-slate-600">
            Des modules consulaires conçus pour accélérer vos contrats
            commerciaux en éliminant les intermédiaires non certifiés.
          </p>
        </Reveal>

        {/* Rangée 1 — 3 services principaux */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {services.map((s, i) => (
            <Reveal key={s.title} variant="fade-up" delay={i * 120}>
              <ServiceCard {...s} />
            </Reveal>
          ))}
        </div>

        {/* Rangée 2 — CTA + 2 services bonus */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Carte CTA (slide depuis la gauche) */}
          <Reveal variant="slide-left" delay={0} duration={800}>
            <div className="bg-gradient-to-tr from-teal-700 to-teal-800 rounded-3xl p-8 text-white flex flex-col justify-between shadow-lg shadow-teal-800/10 h-full">
              <div>
                <h4 className="text-xl font-bold mb-2">
                  Explorer Tous les Services
                </h4>
                <p className="text-teal-100 text-xs leading-relaxed">
                  Consultez le catalogue exhaustif des prestations
                  d&apos;accompagnement export, cession et reprise
                  d&apos;entreprise de votre CCI régionale.
                </p>
              </div>
              <div className="mt-6">
                <Link
                  href="#catalogue"
                  className="inline-block bg-white text-teal-800 font-bold text-xs px-5 py-2.5 rounded-full hover:bg-teal-50 transition shadow-sm"
                >
                  Accéder au catalogue complet
                </Link>
              </div>
            </div>
          </Reveal>

          {/* Services bonus (fade-up en cascade) */}
          {extraServices.map((s, i) => (
            <Reveal key={s.title} variant="fade-up" delay={150 + i * 120}>
              <ServiceCard {...s} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}