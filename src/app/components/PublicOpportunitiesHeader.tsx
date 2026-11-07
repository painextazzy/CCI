"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";

export default function PublicOpportunitiesHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-3">
          <div className="relative h-11 w-11 shrink-0">
            <Image
              src="/logo.png"
              alt="CCI B2B Connect"
              fill
              sizes="44px"
              className="object-contain"
              priority
            />
          </div>
          <span className="font-extrabold tracking-tight text-emerald-700">
            B2B Connect
          </span>
        </Link>

        <div className="hidden items-center gap-2 sm:flex">
          <Link
            href="/login"
            className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-emerald-300 hover:text-emerald-700"
          >
            Se connecter
          </Link>
          <Link
            href="/register"
            className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
          >
            S&apos;inscrire
          </Link>
        </div>

        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-full text-slate-700 transition hover:bg-slate-100 sm:hidden"
          aria-label={isMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={isMenuOpen}
          aria-controls="public-opportunities-menu"
          onClick={() => setIsMenuOpen((isOpen) => !isOpen)}
        >
          {isMenuOpen ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
        </button>
      </div>

      {isMenuOpen && (
        <nav
          id="public-opportunities-menu"
          aria-label="Menu visiteur"
          className="border-t border-slate-100 bg-white px-4 py-4 shadow-lg sm:hidden"
        >
          <div className="mx-auto flex max-w-7xl flex-col gap-3">
            <Link
              href="/login"
              onClick={() => setIsMenuOpen(false)}
              className="rounded-full border border-slate-200 px-4 py-3 text-center text-sm font-semibold text-slate-700 transition hover:border-emerald-300 hover:text-emerald-700"
            >
              Se connecter
            </Link>
            <Link
              href="/register"
              onClick={() => setIsMenuOpen(false)}
              className="rounded-full bg-emerald-600 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-emerald-700"
            >
              S&apos;inscrire
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
