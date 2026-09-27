import Image from "next/image";
import Link from "next/link";

export default function Hero() {
  return (
    <section
      id="accueil"
      className="relative pt-28 pb-16 lg:pt-32 lg:pb-24 overflow-hidden"
    >
      {/* Fond diagonal teal */}
      <div className="absolute right-0 top-0 bottom-0 w-full lg:w-1/2 -z-10 pointer-events-none">
        <div className="hero-split-bg w-full h-full bg-gradient-to-br from-teal-600 via-teal-700 to-teal-900 opacity-95" />
        <div className="absolute top-1/4 right-8 w-80 h-80 bg-teal-400/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Ligne verticale fine */}
      <div className="hidden lg:block absolute top-0 bottom-0 left-1/2 w-px bg-gradient-to-b from-transparent via-slate-200 to-transparent -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-start">
          {/* Texte + boutons à gauche */}
          <div className="lg:col-span-6 z-10 lg:pt-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50 border border-teal-200/70 text-teal-800 text-xs font-semibold uppercase tracking-wider mb-6">
              <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
              Plateforme Officielle Réseau CCI
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-[52px] font-extrabold text-corporate-navy tracking-tight leading-[1.15] mb-6">
              Développez Votre Réseau B2B{" "}
              <span className="text-teal-600">
                Régional &amp; International
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl mb-9">
              Accédez à la communauté d&apos;entreprises qualifiées, certifiées
              par les Chambres de Commerce et d&apos;Industrie. Échangez en toute
              sécurité avec des partenaires solvables et vérifiés sous 24h.
            </p>

            {/* Boutons visibles dès l'ouverture */}
            <div className="flex flex-wrap items-center gap-4">
              <Link
                href="#opportunites"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-teal-600 text-white font-semibold text-sm hover:bg-teal-700 shadow-lg shadow-teal-600/30 hover:shadow-teal-700/40 transition duration-200"
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
                href="#fonctionnement"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-white text-slate-700 font-semibold text-sm border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition duration-200"
              >
                Rejoindre le réseau
              </Link>
            </div>
          </div>

          {/* Image à droite — décalée plus à droite */}
          <div className="lg:col-span-6 relative flex justify-center lg:justify-end self-start lg:-mt-2 lg:-mr-8 xl:-mr-16">
            <div className="relative w-full max-w-2xl">
              <div className="relative z-10 overflow-hidden rounded-3xl shadow-2xl border-4 border-white/60 aspect-[4/3] sm:aspect-[3/4] lg:aspect-[4/4]">
                <Image
                  src="https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=1200&q=90"
                  alt="Signature d'un contrat entre deux entreprises partenaires"
                  fill
                  sizes="(max-width: 768px) 80vw, (max-width: 1024px) 50vw, 600px"
                  className="object-cover object-center"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-teal-950/30 via-transparent to-transparent" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}