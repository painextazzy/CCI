"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function ActorHeader() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <header className="max-w-[1600px] mx-auto bg-white/80 backdrop-blur-md rounded-3xl border border-slate-100 shadow-[0_4px_20px_-8px_rgba(15,23,42,0.06)] px-6 py-4 mb-6 flex items-center justify-between sticky top-4 z-40">
      <div className="flex items-center gap-6">
        <Link href="/acteur/dashboard" className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold text-base shadow-md shadow-emerald-600/30">
            A
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 block">Espace Acteur</span>
            <span className="text-sm font-extrabold text-slate-900">Tech Madagascar</span>
          </div>
        </Link>

        {/* Navigation interne */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-100/70 p-1 rounded-full text-xs font-semibold">
          <Link
            href="/acteur/dashboard"
            className={`px-4 py-2 rounded-full transition ${
              isActive("/acteur/dashboard")
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Tableau de bord
          </Link>
          <Link
            href="/acteur/offres"
            className={`px-4 py-2 rounded-full transition ${
              isActive("/acteur/offres")
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Opportunités & Offres
          </Link>
          <Link
            href="/acteur/messages"
            className={`px-4 py-2 rounded-full transition ${
              isActive("/acteur/messages")
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Messages
          </Link>
        </nav>
      </div>

      {/* Profil & Actions rapides du Header */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-700">
          TM
        </div>
        <Link
          href="/logout"
          className="text-xs font-semibold text-slate-500 hover:text-rose-600 transition hidden sm:inline-block"
        >
          Déconnexion
        </Link>
      </div>
    </header>
  );
}