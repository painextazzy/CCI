import Image from "next/image";
import Reveal from "./Reveal";

export default function Partners() {
  const partners = [
    { name: "Région Haute Matsiatra", src: "/partners/region-haute-matsiatra.png" },
    { name: "Commune Urbaine de Fianarantsoa", src: "/partners/cuf.png" },
    { name: "EDBM Madagascar", src: "/partners/edbm.png" },
    { name: "GEM", src: "/partners/gem.png" },
    { name: "PNUD Madagascar", src: "/partners/pnud.png" },
    { name: "BNI Madagascar", src: "/partners/bni.png" },
    { name: "GIZ", src: "/partners/giz.png" },
    { name: "EMIT", src: "/partners/emit.png" },
    { name: "Université de Fianarantsoa", src: "/partners/uf.png" },
    { name: "AFD", src: "/partners/afd.png" },
    { name: "FIVMPAMA", src: "/partners/fivmpama.png" },
  ];

  return (
    <section className="py-20 bg-white border-y border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* En-tête animé */}
        <Reveal variant="fade-up" className="text-center mb-14">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-teal-600 mb-2">
            Nos partenaires
          </p>

          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl mx-auto">
            B2B connect s&apos;appuie sur les institutions publiques, les
            organisations patronales et les partenaires financiers qui
            structurent l&apos;économie régionale.
          </p>
        </Reveal>

        {/* Logos en cascade */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-10 gap-y-12 items-center justify-items-center">
          {partners.map((partner, i) => (
            <Reveal
              key={partner.name}
              variant="zoom-in"
              delay={i * 60}
              duration={600}
              className="relative w-full max-w-[200px] h-24 flex items-center justify-center transition-transform duration-300 hover:scale-105"
            >
              <Image
                src={partner.src}
                alt={partner.name}
                width={200}
                height={96}
                className="object-contain max-h-24 w-auto h-auto"
                title={partner.name}
              />
            </Reveal>
          ))}
        </div>

        <Reveal variant="fade-in" delay={400} className="text-center text-[11px] text-slate-400 mt-14">
          + de <span className="font-bold text-teal-600">25 organisations</span> partenaires
          à Madagascar et dans l&apos;océan Indien
        </Reveal>
      </div>
    </section>
  );
}