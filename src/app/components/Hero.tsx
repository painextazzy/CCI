import Image from "next/image";
import Link from "next/link";

export default function Hero() {
  return (
    <section
      id="accueil"
      className="relative pt-28 pb-16 lg:pt-36 lg:pb-32 overflow-hidden"
    >
      <div className="absolute right-0 top-0 bottom-0 w-full lg:w-1/2 -z-10 pointer-events-none">
        <div className="hero-split-bg w-full h-full bg-gradient-to-br from-teal-600 via-teal-700 to-teal-900 opacity-95" />
        <div className="absolute top-1/4 right-8 w-80 h-80 bg-teal-400/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          <div className="lg:col-span-6 pt-4 lg:pt-0 z-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50 border border-teal-200/70 text-teal-800 text-xs font-semibold uppercase tracking-wider mb-6">
              <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
              Plateforme Officielle Réseau CCI
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-[52px] font-extrabold text-corporate-navy tracking-tight leading-[1.15] mb-6">
              Développez Votre Réseau B2B{" "}
              <span className="text-teal-600 underline decoration-teal-300/60 decoration-wavy decoration-2 underline-offset-8">
                Régional &amp; International
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl mb-9">
              Accédez à la communauté d&apos;entreprises qualifiées, certifiées
              par les Chambres de Commerce et d&apos;Industrie. Échangez en toute
              sécurité avec des partenaires solvables et vérifiés sous 24h.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <Link
                href="#opportunites"
                className="px-7 py-3.5 rounded-full bg-teal-600 text-white font-semibold text-sm hover:bg-teal-700 shadow-lg shadow-teal-600/30 hover:shadow-teal-700/40 transition duration-200"
              >
                Explorer les opportunités
              </Link>
              <Link
                href="#fonctionnement"
                className="px-7 py-3.5 rounded-full bg-white text-slate-700 font-semibold text-sm border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition duration-200"
              >
                Rejoindre le réseau
              </Link>
            </div>
          </div>

          <div className="lg:col-span-6 relative flex justify-center lg:justify-end">
            <div className="relative w-full max-w-md lg:max-w-none">
              <div className="relative z-10 overflow-hidden rounded-3xl shadow-2xl border-4 border-white/40 aspect-[4/3] sm:aspect-[5/4] lg:aspect-[4/3] max-w-lg ml-auto">
                <Image
                  src="https://lh3.googleusercontent.com/aida/AEtjO1Xlojcs_oewnHSKWptRO08jY4kM4M-oM2VLNjMtWDJRZ58veuuCes-ToOdigGdhmC8K3OeZipuv4ABn-52OLZ-FAcdU7SD8rfOn3LC4dIZMtagoHqS_wznsD_-FIspBzk1KI8L3xMRBLxgaLHn0ULDCgKd1jfyctWrdkMDsFmB-LUZPYI1Kw9ydqzERCr72sx5VEIc1OC4HxXfuy4o25hUcGuwfoJ8k_aCrHtffg0auHLg52cKg6sr9EZKO"
                  alt="Dirigeants d'entreprise collaborant via la plateforme CCI B2B Connect"
                  fill
                  className="object-cover object-center"
                  priority
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-teal-950/40 via-transparent to-transparent" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}