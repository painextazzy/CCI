import Image from "next/image";
import Reveal from "./Reveal";

export default function About() {
  return (
    <section className="py-20 bg-white relative overflow-hidden" id="a-propos">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Bloc Visuel / Image & Badges — slide depuis la gauche */}
          <Reveal
            variant="slide-left"
            duration={800}
            className="lg:col-span-5 relative"
          >
            <div className="relative mx-auto max-w-md lg:max-w-none">
              
              {/* Image Principale */}
              <div className="relative z-10 w-full rounded-3xl overflow-hidden shadow-2xl border border-slate-100 aspect-[4/5] bg-slate-100">
                <Image
                  src="/images/about6.jpg"
                  alt="Chambre de Commerce et d'Industrie Haute Matsiatra"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-transparent to-transparent" />
                
                <div className="absolute bottom-6 left-6 right-6 text-white">
                  <p className="text-xs font-semibold uppercase tracking-wider text-teal-300 mb-1">
                    Institution Officielle
                  </p>
                  <p className="text-sm font-bold text-white">
                    Chambre de Commerce et d&apos;Industrie Haute Matsiatra
                  </p>
                </div>
              </div>

              {/* Badge Flottant : Certification — apparition après l'image */}
              <Reveal
                variant="zoom-in"
                delay={400}
                duration={600}
                className="absolute -bottom-6 -left-4 z-20 bg-white/95 backdrop-blur-md rounded-2xl p-5 shadow-xl border border-teal-100 max-w-xs"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-teal-700 block">
                      Vérification Consulaire
                    </span>
                    <span className="text-xs font-bold text-slate-900">
                      Entreprises Certifiées
                    </span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 leading-snug">
                  Contrôle rigoureux des données juridiques et fiscales (NIF/STAT) par nos conseillers sous 24h.
                </p>
              </Reveal>

              {/* Badge Flottant : Ancrage — apparition après le badge certif */}


            </div>
          </Reveal>

          {/* Bloc Texte / Contenu Explicatif — slide depuis la droite */}
          <div className="lg:col-span-7">
            <Reveal variant="fade-up" delay={100} duration={600}>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50 border border-teal-200/70 text-teal-800 text-xs font-semibold uppercase tracking-wider mb-4">
                <span className="w-2 h-2 rounded-full bg-teal-600 animate-pulse" />
                À Propos de la Plateforme
              </div>
            </Reveal>
            
            <Reveal variant="fade-up" delay={200} duration={700}>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight mb-6">
                Le Tiers de Confiance au Service des Entreprises de la Haute Matsiatra
              </h2>
            </Reveal>

            <Reveal variant="fade-up" delay={300} duration={700}>
              <p className="text-base text-slate-600 leading-relaxed mb-6">
                Initiée par la{" "}
                <strong className="text-slate-900">
                  Chambre de Commerce et d&apos;Industrie Haute Matsiatra
                </strong>
                , cette plateforme B2B sécurisée a pour mission de dynamiser le
                tissu économique régional, de faciliter le partenariat
                inter-entreprises et d&apos;offrir une visibilité nationale et
                internationale aux opérateurs économiques locaux.
              </p>
            </Reveal>

            {/* Points forts sous forme de liste — cascade */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              {[
                {
                  title: "Sécurité des Échanges",
                  desc: "Mise en relation uniquement avec des entreprises vérifiées et en règle.",
                },
                {
                  title: "Accompagnement Neutre",
                  desc: "Assistance personnalisée par les conseillers économiques de la CCI.",
                },
                {
                  title: "Valorisation des Filières",
                  desc: "Mise en valeur de l'agroalimentaire, de l'artisanat, du BTP et des services.",
                },
                {
                  title: "Matching Ciblé",
                  desc: "Mise en relation intelligente par secteur d'activité et opportunités.",
                },
              ].map((item, i) => (
                <Reveal
                  key={item.title}
                  variant="fade-up"
                  delay={400 + i * 100}
                  duration={600}
                  className="flex items-start gap-3"
                >
                  <div className="w-5 h-5 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center shrink-0 mt-1">
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      {item.title}
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                  </div>
                </Reveal>
              ))}
            </div>

            {/* Appel à l'action discret — dernière apparition */}
            <Reveal
              variant="fade-up"
              delay={800}
              duration={600}
              className="pt-2 flex items-center gap-4 border-t border-slate-100"
            >
              <a
                href="#contact"
                className="inline-flex items-center gap-2 text-xs font-bold text-teal-700 hover:text-teal-900 transition-colors"
              >
                <span>En savoir plus sur nos missions consulaires</span>
                <span className="text-sm">→</span>
              </a>
            </Reveal>

          </div>

        </div>
      </div>
    </section>
  );
}