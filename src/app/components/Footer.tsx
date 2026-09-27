import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-corporate-navy text-white pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-slate-800">
          {/* Brand */}
          <div className="md:col-span-4">
            <Link href="#accueil" className="inline-flex items-center mb-4">
              <Image
                src="/logo.png"
                alt="CCI B2B Connect"
                width={160}
                height={40}
                className="h-9 w-auto object-contain"
              />
            </Link>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed mb-6">
              Le réseau officiel d&apos;intermédiation B2B piloté par les
              Chambres de Commerce et d&apos;Industrie de France. Facilitateur
              de confiance pour le développement des PME et ETI territoriales.
            </p>
            <div className="text-xs text-teal-400 font-medium">
              Conforme Référentiel Général de Sécurité (RGS v2)
            </div>
          </div>

          {/* Navigation */}
          <div className="md:col-span-2 md:col-start-6">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-4">
              Navigation
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <Link href="#accueil" className="hover:text-teal-400 transition-colors">
                  Accueil
                </Link>
              </li>
              <li>
                <Link href="#a-propos" className="hover:text-teal-400 transition-colors">
                  À Propos
                </Link>
              </li>
              <li>
                <Link href="#services" className="hover:text-teal-400 transition-colors">
                  Services Dédiés
                </Link>
              </li>
              <li>
                <Link href="#opportunites" className="hover:text-teal-400 transition-colors">
                  Opportunités
                </Link>
              </li>
              <li>
                <Link href="#annuaire" className="hover:text-teal-400 transition-colors">
                  Annuaire SIRET
                </Link>
              </li>
            </ul>
          </div>

          {/* Cadre institutionnel */}
          <div className="md:col-span-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-4">
              Cadre Institutionnel
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <Link href="#mentions" className="hover:text-teal-400 transition-colors">
                  Mentions Légales
                </Link>
              </li>
              <li>
                <Link href="#rgpd" className="hover:text-teal-400 transition-colors">
                  Protection des Données (RGPD)
                </Link>
              </li>
              <li>
                <Link href="#cgu" className="hover:text-teal-400 transition-colors">
                  Conditions Générales d&apos;Usage
                </Link>
              </li>
              <li>
                <Link href="#securite" className="hover:text-teal-400 transition-colors">
                  Charte de Confiance Consulaire
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact régional */}
          <div className="md:col-span-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-4">
              Contact Régional
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              Service Relations Entreprises CCI
              <br />
              Du lundi au vendredi : 08h30 - 18h00
            </p>
            <a
              className="text-xs text-teal-400 hover:underline font-medium"
              href="mailto:contact@cci-b2bconnect.fr"
            >
              contact@cci-b2bconnect.fr
            </a>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <div>
            © 2025 CCI France &amp; Chambres de Commerce et d&apos;Industrie
            Régionales. Tous droits réservés.
          </div>
          <div className="flex items-center gap-6">
            <Link href="#accessibilite" className="hover:text-slate-400 transition-colors">
              Accessibilité : conforme (96%)
            </Link>
            <Link href="#cookies" className="hover:text-slate-400 transition-colors">
              Gestion des cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}