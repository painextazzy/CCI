"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

// Importez votre image depuis le dossier public/ ou assets (ex: public/images/b2b-hero.jpg)


export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const configuredApiUrl = process.env.NEXT_PUBLIC_API_URL
        ?.trim()
        .replace(/\/+$/, "");
      if (!configuredApiUrl) {
        throw new Error("La variable NEXT_PUBLIC_API_URL n'est pas configurée.");
      }

      const apiRoot = /\/api$/i.test(configuredApiUrl)
        ? configuredApiUrl
        : `${configuredApiUrl}/api`;
      const res = await fetch(`${apiRoot}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Identifiants incorrects.");
      }

      const role = data.user?.role;
      if (!data.accessToken || !role) {
        throw new Error("Réponse de connexion invalide.");
      }

      let destination: string;
      if (role === "COMPANY") {
        destination = "/acteur/opportunites";
      } else if (role === "ADMIN" || role === "CCI_STAFF") {
        destination = "/admin";
      } else {
        throw new Error("Ce type de compte ne peut pas accéder à la plateforme.");
      }

      localStorage.setItem("token", data.accessToken);
      router.push(destination);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Une erreur est survenue lors de la connexion."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-10 bg-[#e9ebf2] text-slate-800 antialiased font-sans">
      {/* Conteneur Principal */}
      <main className="w-full max-w-[1040px] bg-white rounded-[36px] p-6 sm:p-8 lg:p-9 shadow-[0_25px_70px_-15px_rgba(45,55,90,0.12)] relative overflow-hidden">
        
        {/* Glow en haut à droite */}
        <div 
          aria-hidden="true" 
          className="absolute -top-12 -right-12 w-80 h-80 rounded-full pointer-events-none bg-[radial-gradient(circle,_rgba(168,142,255,0.3)_0%,_rgba(255,255,255,0)_70%)] blur-[40px]" 
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch relative z-10">
          
          {/* SECTION GAUCHE : Photo Asset & Message Brand */}
          <section className="lg:col-span-5 rounded-[32px] p-8 sm:p-10 flex flex-col justify-between text-white relative overflow-hidden min-h-[520px]">
            
            {/* Image d'arrière-plan avec dégradé d'incrustation */}
            <div className="absolute inset-0 z-0">
              <Image
                src="/images/b2b-hero.jpg"
                alt="Chambre de Commerce et d'Industrie Haute Matsiatra B2B"
                fill
                priority
                className="object-cover object-center"
                sizes="(max-width: 1024px) 100vw, 40vw"
              />
              {/* Overlay en dégradé Teal institutionnel pour assurer la lisibilité des textes */}
              <div className="absolute inset-0 bg-gradient-to-b from-[#0d9488]/90 via-[#005f56]/85 to-[#042f2e]/95" />
            </div>

            {/* Contenu au-dessus de la photo */}
            <div className="relative z-10 space-y-4 max-w-sm">
              <span className="inline-block px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-[11px] font-semibold uppercase tracking-wider text-teal-100 border border-white/20">
                CCI Haute Matsiatra
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-[1.2]">
                Simplifiez la<br />gestion de vos<br />partenariats B2B
              </h1>
              <p className="text-white/85 text-xs sm:text-[13px] leading-relaxed font-normal pt-1">
                Accédez à votre espace sécurisé CCI B2B Connect pour développer votre réseau inter-entreprises.
              </p>
            </div>

            {/* Pied de carte avec badge de réassurance */}
            <div className="relative z-10 pt-6">
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/15">
                <div className="w-8 h-8 rounded-xl bg-teal-400/20 flex items-center justify-center shrink-0 border border-teal-300/30">
                  <svg className="w-4 h-4 text-teal-200" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Plateforme Consulaire Officielle</p>
                  <p className="text-[11px] text-teal-100/80">Entreprises vérifiées NIF / STAT</p>
                </div>
              </div>
            </div>

          </section>

          {/* SECTION DROITE : Formulaire de connexion */}
          <section className="lg:col-span-7 flex flex-col justify-center px-2 sm:px-6 lg:px-8 py-4 sm:py-6">
            
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Bienvenue
              </h2>
              <p className="text-slate-400 text-sm mt-1.5 font-medium">
                Veuillez vous connecter à votre compte
              </p>
            </div>

            {/* Alerte d'erreur */}
            {error && (
              <div className="max-w-md mx-auto mb-4 w-full p-3 text-xs text-red-700 bg-red-100 border border-red-200 rounded-xl text-center font-medium">
                {error}
              </div>
            )}

            <form className="max-w-md mx-auto w-full space-y-5" onSubmit={handleSubmit}>
              
              {/* Champ Email */}
              <div>
                <label className="sr-only" htmlFor="email">Email professionnel</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email professionnel"
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200/90 rounded-xl text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0d9488]/20 focus:border-[#0d9488] transition-all text-sm font-medium"
                />
              </div>

              {/* Champ Mot de passe */}
              <div className="relative">
                <label className="sr-only" htmlFor="password">Mot de passe</label>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Mot de passe"
                  className="w-full pl-5 pr-12 py-3.5 bg-slate-50 border border-slate-200/90 rounded-xl text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0d9488]/20 focus:border-[#0d9488] transition-all text-sm font-medium"
                />
                
                {/* Bouton Toggle Mot de passe */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Afficher ou masquer le mot de passe"
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                    {showPassword ? (
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    )}
                  </svg>
                </button>
              </div>

              {/* Mot de passe oublié */}
              <div className="flex justify-end pt-0.5">
                <Link
                  href="/forgot-password"
                  className="text-xs font-semibold text-slate-400 hover:text-[#0d9488] transition-colors"
                >
                  Mot de passe oublié ?
                </Link>
              </div>

              {/* Bouton de validation */}
              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full text-white font-semibold py-3.5 px-4 rounded-xl transition-all text-sm tracking-wide mt-2 bg-[#0d9488] hover:bg-[#0f766e] shadow-[0_10px_25px_-5px_rgba(13,148,136,0.4)] active:scale-[0.99] disabled:opacity-50"
                >
                  {isLoading ? "Connexion en cours..." : "Se connecter"}
                </button>
              </div>

              {/* Lien Créer un compte */}
              <div className="text-center pt-2">
                <p className="text-sm text-slate-500 font-medium">
                  Vous n&apos;avez pas de compte ?{" "}
                  <Link
                    href="/register"
                    className="font-semibold text-[#0d9488] hover:underline transition-colors"
                  >
                    Créer un compte
                  </Link>
                </p>
              </div>

            </form>
          </section>

        </div>
      </main>
    </div>
  );
}