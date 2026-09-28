import Image from "next/image";

export default function Partners() {
  const partners = [
    // Partenaires existants
    {
      name: "Région Haute Matsiatra",
      src: "/partners/region-haute-matsiatra.png",
    },
    {
      name: "Commune Urbaine de Fianarantsoa",
      src: "/partners/cuf.png",
    },
    {
      name: "EDBM Madagascar",
      src: "/partners/edbm.png",
    },
    {
      name: "GEM",
      src: "/partners/gem.png",
    },
    {
      name: "PNUD Madagascar",
      src: "/partners/pnud.png",
    },
    {
      name: "BNI Madagascar",
      src: "/partners/bni.png",
    },
    // Nouveaux partenaires ajoutés
    {
      name: "GIZ",
      src: "/partners/giz.png",
    },
    {
      name: "EMIT",
      src: "/partners/emit.png",
    },
    {
      name: "Université de Fianarantsoa",
      src: "/partners/uf.png",
    },
    {
      name: "AFD",
      src: "/partners/afd.png",
    },
    {
      name: "FIVMPAMA",
      src: "/partners/fivmpama.png",
    },
  ];

  return (
    <section className="py-16 bg-white border-y border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Titre */}
        <div className="text-center mb-10">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-teal-600 mb-2">
            Nos partenaires
          </p>
      
        </div>

        {/* Grille de 11 logos */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-x-8 gap-y-10 items-center justify-items-center">
          {partners.map((partner) => (
            <div
              key={partner.name}
              className="relative w-full max-w-[140px] h-16 flex items-center justify-center transition-transform duration-300 hover:scale-105"
              title={partner.name}
            >
              <Image
                src={partner.src}
                alt={partner.name}
                width={140}
                height={64}
                className="object-contain max-h-16 w-auto"
              />
            </div>
          ))}

          {/* Cellule vide pour équilibrer la 2ᵉ ligne (11 logos = 6 + 5) */}
          <div className="hidden lg:block" aria-hidden="true" />
        </div>

        {/* Note de bas */}
        <p className="text-center text-[11px] text-slate-400 mt-12">
          + de <span className="font-bold text-teal-600">25 organisations</span> partenaires
          à Madagascar et dans l&apos;océan Indien
        </p>
      </div>
    </section>
  );
}