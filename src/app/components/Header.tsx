"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navigation = [
    { label: "Accueil", href: "#accueil" },
    { label: "Services", href: "#services" },
    { label: "Opportunités", href: "#opportunites" },
    { label: "À propos", href: "#a-propos" },
    { label: "Contact", href: "#contact" },
  ];

  return (
    <header className="w-full pt-3 sm:pt-4 pb-2 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto fixed top-0 left-0 right-0 z-50">
      <div className="bg-white/95 backdrop-blur-md rounded-2xl sm:rounded-full px-4 sm:px-5 py-2.5 sm:py-3 shadow-[0_4px_25px_-4px_rgba(15,23,42,0.06)] border border-slate-100 flex items-center justify-between transition-all duration-300">
        {/* Logo */}
        <Link href="#accueil" className="flex items-center gap-2 sm:gap-2.5 group shrink-0">
          <Image
            src="/logo.png"
            alt="Co-Hub"
            width={40}
            height={40}
            className="h-8 w-8 sm:h-9 sm:w-9 object-contain group-hover:scale-105 transition-transform"
            priority
          />
          <span className="text-base sm:text-2xl font-extrabold tracking-tight text-corporate-navy group-hover:text-teal-700 transition-colors">
            B2B<span className="text-teal-600">CONNECT</span>
          </span>
        </Link>

        {/* Navigation desktop */}
        <nav className="hidden lg:flex items-center gap-6 xl:gap-8 text-[14px] font-medium text-slate-600">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="hover:text-teal-600 transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* CTA desktop */}
        <div className="hidden lg:flex items-center gap-2 sm:gap-3 shrink-0">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-[13px] font-semibold text-slate-700 px-4 py-2.5 rounded-full border border-slate-200 hover:border-teal-300 hover:text-teal-700 hover:bg-teal-50/60 transition-all duration-200"
          >
 
            Se connecter
          </Link>

          <Link
            href="/register"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white text-[13px] font-semibold px-5 py-2.5 rounded-full shadow-md shadow-teal-700/20 hover:shadow-lg hover:shadow-teal-700/30 transition-all duration-200"
          >
            S&apos;inscrire
          </Link>
        </div>

        {/* CTA mobile + bouton menu */}
        <div className="flex lg:hidden items-center gap-2 shrink-0">
          <Link
            href="/register"
            className="inline-flex items-center bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white text-[12px] font-semibold px-4 py-2 rounded-full shadow-md shadow-teal-700/20 transition-all duration-200"
          >
            S&apos;inscrire
          </Link>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="w-10 h-10 rounded-full flex items-center justify-center text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="Menu"
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? (
              /* Icône X */
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                viewBox="0 0 24 24"
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            ) : (
              /* Icône hamburger */
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                viewBox="0 0 24 24"
              >
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Menu mobile déroulant */}
      <div
        className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          isMenuOpen ? "max-h-96 opacity-100 mt-2" : "max-h-0 opacity-0"
        }`}
      >
        <div className="bg-white/98 backdrop-blur-md rounded-2xl px-5 py-4 shadow-[0_4px_25px_-4px_rgba(15,23,42,0.1)] border border-slate-100">
          <nav className="flex flex-col">
            {navigation.map((item, i) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMenuOpen(false)}
                className={`py-3 text-[15px] font-medium text-slate-700 hover:text-teal-700 transition-colors ${
                  i !== navigation.length - 1 ? "border-b border-slate-100" : ""
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="pt-4 mt-3 border-t border-slate-100">
            <Link
              href="/login"
              onClick={() => setIsMenuOpen(false)}
              className="flex items-center justify-center gap-2 w-full text-[14px] font-semibold text-slate-700 px-4 py-3 rounded-full border border-slate-200 hover:border-teal-300 hover:text-teal-700 hover:bg-teal-50/60 transition-all duration-200"
            >

              Se connecter
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}