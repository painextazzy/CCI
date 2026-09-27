import Image from "next/image";

export default function About() {
  const points = [
    "Algorithme de matching IA et vérification automatique des codes NAF.",
    "Réseau vérifié 100% SIRET et greffes consulaires sous 24h.",
    "Accompagnement neutre et confidentiel par vos conseillers territoriaux.",
    "Contrats et échanges sécurisés en souveraineté RGPD & SecNumCloud.",
  ];

  return (
    <section
      id="a-propos"
      className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
    >
      <div className="bg-white rounded-3xl p-8 sm:p-10 lg:p-16 border border-slate-100 shadow-[0_20px_50px_rgba(15,23,42,0.06)]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Image column */}
          <div className="lg:col-span-5 relative flex justify-center lg:justify-start">
            <div className="relative w-full max-w-md">
              <div className="relative z-10 w-full rounded-3xl overflow-hidden shadow-2xl border border-slate-100 aspect-[4/5]">
                <Image
                  src="https://lh3.googleusercontent.com/aida/AEtjO1Xlojcs_oewnHSKWptRO08jY4kM4M-oM2VLNjMtWDJRZ58veuuCes-ToOdigGdhmC8K3OeZipuv4ABn-52OLZ-FAcdU7SD8rfOn3LC4dIZMtagoHqS_wznsD_-FIspBzk1KI8L3xMRBLxgaLHn0ULDCgKd1jfyctWrdkMDsFmB-LUZPYI1Kw9ydqzERCr72sx5VEIc1OC4HxXfuy4o25hUcGuwfoJ8k_aCrHtffg0auHLg52cKg6sr9EZKO"
                  alt="Dirigeants d'entreprises collaborant dans le réseau consulaire CCI"
                  fill
                  className="object-cover"
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-corporate-navy/60 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 text-white">
                  <p className="text-xs font-semibold uppercase tracking-wider text-teal-300 mb-1">
                    Réseau officiel consulaire
                  </p>
                  <p className="text-sm font-bold text-white">
                    121 CCI en France &amp; 125 CCI Internationales
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
                      Certification Officielle
                    </span>
                    <span className="text-xs font-bold text-corporate-navy">
                      100% CCI France &amp; Régions
                    </span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 leading-snug">
                  Contrôle d&apos;immatriculation et solvabilité certifié sous
                  24h par les greffes consulaires.
                </p>
              </div>

              {/* Badge entreprises */}
              <div className="absolute -top-4 -right-4 z-20 bg-teal-600 text-white py-3 px-5 rounded-2xl shadow-xl shadow-teal-700/30 flex flex-col items-center justify-center border-2 border-white">
                <span className="text-lg font-extrabold tracking-tight leading-none">
                  1 485 +
                </span>
                <span className="text-[10px] font-medium text-teal-100 uppercase tracking-wider mt-1">
                  Entreprises Actives
                </span>
              </div>
            </div>
          </div>

          {/* Text column */}
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50 border border-teal-200/70 text-teal-800 text-xs font-semibold uppercase tracking-wider mb-4">
              <span className="w-2 h-2 rounded-full bg-teal-600 animate-pulse" />
              À Propos de CCI B2B Connect
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-corporate-navy tracking-tight leading-tight mb-4">
              Le Tiers de Confiance Institutionnel des Entreprises
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed mb-6">
              Créée sous l&apos;égide de CCI France pour fiabiliser et propulser
              les échanges économiques entre entreprises en France et à
              l&apos;international.
            </p>

            <ul className="space-y-3.5">
              {points.map((point) => (
                <li key={point} className="flex items-start gap-3">
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
                    {point}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}