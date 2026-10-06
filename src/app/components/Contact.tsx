"use client";

export default function Contact() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <section id="contact" className="py-24 bg-white border-t border-slate-100">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50 border border-teal-200/70 text-teal-800 text-xs font-semibold uppercase tracking-wider mb-4">
            <span className="w-2 h-2 rounded-full bg-teal-600" />
            Contact Consulaire
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-corporate-navy tracking-tight mb-3">
            Une question ? Contactez notre équipe
          </h2>
          <p className="text-base text-slate-600 max-w-xl mx-auto leading-relaxed">
            Nos conseillers CCI analysent vos besoins d&apos;intermédiation et
            vous répondent sous 24 heures ouvrées.
          </p>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-3xl p-8 sm:p-10 shadow-[0_20px_50px_rgba(15,23,42,0.06)]">
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Nom &amp; Prénom *
                </label>
                <input
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600 transition"
                  placeholder="votre nom ici"
                  required
                  type="text"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Email professionnel *
                </label>
                <input
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600 transition"
                  placeholder="example@gmail.com"
                  required
                  type="email"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Sujet / Objet *
              </label>
              <input
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600 transition"
                placeholder="Partenariat régional, recherche de sous-traitance, export..."
                required
                type="text"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Message *
              </label>
              <textarea
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600 transition"
                placeholder="Expliquez-nous brièvement votre projet ou votre demande..."
                required
                rows={4}
              />
            </div>

            <div className="pt-2 text-center">
              <button
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white font-semibold text-sm px-8 py-3.5 rounded-full shadow-lg shadow-teal-700/20 hover:shadow-teal-700/30 transition-all duration-200 cursor-pointer"
                type="submit"
              >
                <span>Envoyer le message</span>
                <svg
                  className="w-4 h-4 fill-none stroke-current stroke-2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}