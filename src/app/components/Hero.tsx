import Image from "next/image";
import Link from "next/link";
import Reveal from "./Reveal";

export default function Hero() {
  return (
    <section
      id="accueil"
      className="relative pt-24 pb-12 sm:pt-28 sm:pb-16 lg:pt-32 lg:pb-24 overflow-hidden"
    >
      {/* Fond diagonal teal */}
      <div className="absolute right-0 top-0 bottom-0 w-full lg:w-1/2 -z-10 pointer-events-none">
        <div className="hero-split-bg w-full h-full bg-gradient-to-br from-teal-600 via-teal-700 to-teal-900 opacity-95" />
        <div className="absolute top-1/4 right-8 w-40 h-40 sm:w-60 sm:h-60 lg:w-80 lg:h-80 bg-teal-400/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Ligne verticale */}
      <div className="hidden lg:block absolute top-0 bottom-0 left-1/2 w-px bg-gradient-to-b from-transparent via-slate-200 to-transparent -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 sm:gap-12 lg:gap-8 items-center">
          {/* Colonne texte centrée verticalement à gauche */}
          <div className="lg:col-span-6 z-10 text-center lg:text-left flex flex-col justify-center">
            {/* Titre — apparition 2 */}
            <Reveal variant="fade-up" delay={100} duration={700}>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[52px] font-extrabold text-white lg:text-corporate-navy tracking-tight leading-[1.15] mb-4 sm:mb-5 pt-2">
                Développez Votre Réseau B2B{" "}
                <span className="text-teal-200 lg:text-teal-600">
                  Régional &amp; International
                </span>
              </h1>
            </Reveal>

            {/* Paragraphe — apparition 3 */}
            <Reveal variant="fade-up" delay={200} duration={700}>
              <p className="text-sm sm:text-base lg:text-lg text-teal-50 lg:text-slate-600 leading-relaxed max-w-xl mx-auto lg:mx-0 mb-6 sm:mb-8">
                Accédez à la communauté d&apos;entreprises qualifiées, certifiées
                par les Chambres de Commerce et d&apos;Industrie. Échangez en toute
                sécurité avec des partenaires solvables et vérifiés sous 24h.
              </p>
            </Reveal>

            {/* Boutons placés juste en dessous */}
            <Reveal variant="fade-up" delay={300} duration={700}>
              <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center justify-center lg:justify-start gap-3 sm:gap-4">
                <Link
                  href="#opportunites"
                  className="inline-flex items-center justify-center gap-2 px-8 sm:px-7 py-3 sm:py-3.5 rounded-full bg-white lg:bg-teal-600 text-teal-700 lg:text-white font-semibold text-sm hover:bg-teal-50 lg:hover:bg-teal-700 shadow-lg shadow-black/10 lg:shadow-teal-600/30 transition duration-200"
                >
                  Explorer les opportunités
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

                <Link
                  href="/login"
                  className="inline-flex items-center justify-center gap-2 px-6 sm:px-7 py-3 sm:py-3.5 rounded-full bg-white/10 lg:bg-white text-white lg:text-slate-700 font-semibold text-sm border border-white/30 lg:border-slate-200 hover:bg-white/20 lg:hover:bg-slate-50 backdrop-blur-sm lg:backdrop-blur-none transition duration-200"
                >
                  Rejoindre le réseau
                </Link>
              </div>
            </Reveal>
          </div>

          {/* Image — apparition 5 */}
          <Reveal
            variant="slide-right"
            delay={400}
            duration={900}
            className="lg:col-span-6 relative flex justify-center lg:justify-end"
          >
            <div className="relative w-full max-w-md sm:max-w-lg lg:max-w-2xl">
              <div className="relative z-10 overflow-hidden rounded-2xl sm:rounded-3xl shadow-2xl border-4 border-white/60 aspect-[4/3] sm:aspect-[16/10] lg:aspect-[4/4]">
                <Image
                  src="/images/hero.jpg"
                  alt="Signature d'un contrat entre deux entreprises partenaires"
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 600px"
                  className="object-cover object-center"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-teal-950/30 via-transparent to-transparent" />
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}