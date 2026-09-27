import Image from "next/image";
import Link from "next/link";

export default function About() {
  const pillars = [
    {
      title: "Vérification consulaire locale",
      description:
        "Chaque entreprise est contrôlée sur son immatriculation et son NIF via la CCI de Fianarantsoa, qui couvre les 7 districts de la région Haute Matsiatra.",
      icon: (
        <path
          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
        />
      ),
    },
    {
      title: "Mise en relation ciblée",
      description:
        "Notre algorithme croise votre secteur d'activité, votre district et vos filières (agro-business, artisanat, tourisme, TIC) pour proposer des partenaires pertinents.",
      icon: (
        <path
          d="M13 10V3L4 14h7v7l9-11h-7z"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
        />
      ),
    },
    {
      title: "Accompagnement par la CCI FIA",
      description:
        "Un conseiller de la Chambre de Commerce et d'Industrie de Fianarantsoa vous suit de la première prise de contact jusqu'à la contractualisation, sans commission.",
      icon: (
        <path
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
        />
      ),
    },
    {
      title: "Cadre juridique adapté",
      description:
        "Contrats types adaptés au droit malgache, accompagnement à la formalisation et accès aux dispositifs Fihariana pour les coopératives et jeunes entrepreneurs.",
      icon: (
        <path
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
        />
      ),
    },
  ];

  return (
    <section
      id="a-propos"
      className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
    >
      <div className="bg-white rounded-3xl p-8 sm:p-10 lg:p-16 border border-slate-100 shadow-[0_20px_50px_rgba(15,23,42,0.06)]">
        {/* En-tête */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50 border border-teal-200/70 text-teal-800 text-xs font-semibold uppercase tracking-wider mb-4">
            <span className="w-2 h-2 rounded-full bg-teal-600 animate-pulse" />
            À propos de la plateforme
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-corporate-navy tracking-tight leading-tight mb-4">
            Le réseau consulaire qui connecte les entreprises de la{" "}
            <span className="text-teal-600">Haute Matsiatra</span>
          </h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            Co-Hub est la plateforme d&apos;intermédiation B2B portée par la
            Chambre de Commerce et d&apos;Industrie de Fianarantsoa. Elle
            connecte les opérateurs économiques des 7 districts de la région
            avec des partenaires vérifiés, dans un cadre institutionnel
            sécurisé.
          </p>
        </div>

        {/* 2 colonnes : visuel + texte */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center mb-16">
          {/* Visuel à gauche */}
          <div className="lg:col-span-5 relative flex justify-center lg:justify-start">
            <div className="relative w-full max-w-md">
              <div className="relative z-10 w-full rounded-3xl overflow-hidden shadow-2xl border border-slate-100 aspect-[4/5]">
                <Image
                  src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=1200&q=90"
                  alt="Opérateurs économiques de la Haute Matsiatra en réunion à la CCI Fianarantsoa"
                  fill
                  sizes="(max-width: 1024px) 100vw, 450px"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-corporate-navy/70 via-corporate-navy/10 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 text-white">
                  <p className="text-xs font-semibold uppercase tracking-wider text-teal-300 mb-1">
                    CCI de Fianarantsoa
                  </p>
                  <p className="text-sm font-bold text-white leading-snug">
                    7 districts · 82 communes · 1,2 million d&apos;habitants
                  </p>
                </div>
              </div>

              {/* Badge certification */}
              <div className="absolute -bottom-6 -left-4 z-20 bg-white/95 backdrop-blur-md rounded-2xl p-5 shadow-2xl border border-teal-100 max-w-xs">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200/70 text-teal-700 flex items-center justify-center shrink-0">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-teal-700 block">
                      Établissement Public
                    </span>
                    <span className="text-xs font-bold text-corporate-navy">
                      Loi n° 2006-029
                    </span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 leading-snug">
                  La CCI FIA est un établissement public à caractère
                  administratif, interface officielle entre l&apos;État et le
                  secteur privé régional.
                </p>
              </div>

              {/* Badge filières */}
              <div className="absolute -top-4 -right-4 z-20 bg-teal-600 text-white py-3 px-5 rounded-2xl shadow-xl shadow-teal-700/30 flex flex-col items-center justify-center border-2 border-white">
                <span className="text-lg font-extrabold tracking-tight leading-none">
                  7
                </span>
                <span className="text-[10px] font-medium text-teal-100 uppercase tracking-wider mt-1">
                  Districts couverts
                </span>
              </div>
            </div>
          </div>

          {/* Texte à droite */}
          <div className="lg:col-span-7">
            <h3 className="text-xl sm:text-2xl font-extrabold text-corporate-navy mb-4">
              Pourquoi une plateforme consulaire pour la Haute Matsiatra ?
            </h3>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed mb-5">
              La région Haute Matsiatra concentre un potentiel économique
              majeur : agriculture, élevage, agro-business, artisanat et
              tourisme. Pourtant, les opérateurs locaux — souvent des TPE et
              entreprises individuelles — manquent d&apos;outils pour identifier
              des partenaires fiables et accéder à des marchés plus larges.
            </p>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed mb-8">
              Co-Hub répond à ce besoin en s&apos;appuyant sur la{" "}
              <strong className="text-corporate-navy">CCI de Fianarantsoa</strong>,
              qui couvre les districts de Fianarantsoa I, Ambalavao,
              Ambohimahasoa, Ikalamavony, Isandra, Lalangina et Vohibato. La
              plateforme facilite la mise en relation, la formalisation et
              l&apos;accès aux dispositifs d&apos;appui existants.
            </p>

            {/* Points clés */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                "Aucune commission prélevée sur vos contrats",
                "Vérification NIF et immatriculation locale",
                "Accompagnement par un conseiller CCI FIA",
                "Accès aux dispositifs Fihariana et PROSPERER",
              ].map((item) => (
                <div key={item} className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center shrink-0 mt-0.5">
                    <svg
                      className="w-3.5 h-3.5 stroke-2 stroke-current"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M5 13l4 4L19 7"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-slate-700">
                    {item}
                  </span>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="mt-9">
              <Link
                href="#services"
                className="inline-flex items-center gap-2 text-sm font-bold text-teal-700 hover:text-teal-900 transition-colors"
              >
                <span>Découvrir nos services</span>
                <span>→</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Les 4 piliers */}
        <div className="border-t border-slate-100 pt-14">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h3 className="text-xl sm:text-2xl font-extrabold text-corporate-navy mb-3">
              Les 4 engagements de Co-Hub
            </h3>
            <p className="text-sm text-slate-600">
              Un cadre institutionnel pensé pour sécuriser chaque étape de
              votre développement commercial dans la région.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {pillars.map((pillar) => (
              <div
                key={pillar.title}
                className="bg-slate-50/60 hover:bg-teal-50/60 rounded-2xl p-6 border border-slate-100 hover:border-teal-200 transition-colors duration-200 group"
              >
                <div className="w-11 h-11 rounded-xl bg-white text-teal-600 flex items-center justify-center mb-4 shadow-sm group-hover:bg-teal-600 group-hover:text-white transition-colors duration-200">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    {pillar.icon}
                  </svg>
                </div>
                <h4 className="text-sm font-bold text-corporate-navy mb-2">
                  {pillar.title}
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {pillar.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}