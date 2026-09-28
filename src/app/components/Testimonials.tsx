import Image from "next/image";

export default function Testimonials() {
  const testimonials = [
    {
      quote:
        "En trois semaines, nous avons identifié un partenaire de transformation agricole à Ambalavao. Sans Co-Hub, cela nous aurait pris six mois de prospection.",
      name: "Rasoanaivo Andrianina",
      role: "Directeur Général",
      company: "Soavita Agro SARL",
      location: "Fianarantsoa I",
      photo:
        "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&q=80",
    },
    {
      quote:
        "La vérification NIF par la CCI nous a rassurés immédiatement. Nous avons signé un contrat d'export de café Bourbon avec un distributeur européen.",
      name: "Hery Rakotoarisoa",
      role: "Fondateur",
      company: "Café des Hautes Terres",
      location: "Ambalavao",
      photo:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
    },
    {
      quote:
        "En tant que coopérative artisanale, nous manquions de visibilité. Co-Hub nous a ouvert les portes de boutiques à Antananarivo et à La Réunion.",
      name: "Vola Razafindrakoto",
      role: "Présidente",
      company: "Vannerie Betsileo",
      location: "Isandra",
      photo:
        "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80",
    },
  ];

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* En-tête */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-teal-600" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Témoignages
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-corporate-navy tracking-tight mb-4">
            Ils développent leur réseau avec B2B connect
          </h2>
          <p className="text-sm sm:text-base text-slate-600">
            Des dirigeants de la Haute Matsiatra qui ont fait le choix d&apos;un
            écosystème d&apos;affaires fiable et certifié.
          </p>
        </div>

        {/* Grille */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="relative bg-white rounded-3xl p-8 border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col"
            >
              {/* Guillemet décoratif */}
              <svg
                className="absolute top-6 right-6 w-10 h-10 text-teal-100"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
              </svg>

              {/* Étoiles */}
              <div className="flex gap-0.5 mb-5">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className="w-4 h-4 text-amber-400"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                  </svg>
                ))}
              </div>

              {/* Citation */}
              <p className="text-sm text-slate-600 leading-relaxed mb-6 flex-1 italic">
                « {t.quote} »
              </p>

              {/* Auteur */}
              <div className="flex items-center gap-3 pt-5 border-t border-slate-100">
                <div className="relative w-11 h-11 rounded-full overflow-hidden shrink-0">
                  <Image
                    src={t.photo}
                    alt={t.name}
                    fill
                    sizes="44px"
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-corporate-navy truncate">
                    {t.name}
                  </p>
                  <p className="text-[11px] text-slate-500 truncate">
                    {t.role} · {t.company}
                  </p>
                  <p className="text-[10px] text-teal-600 font-medium mt-0.5">
                    {t.location}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}