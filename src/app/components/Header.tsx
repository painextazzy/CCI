"use client";

import Link from "next/link";
import Image from "next/image";

export default function Header() {
  return (
    <header className="w-full pt-4 pb-2 px-4 sm:px-8 max-w-7xl mx-auto fixed top-0 left-0 right-0 z-50">
      <div className="bg-white/95 backdrop-blur-md rounded-full px-5 py-3 shadow-[0_4px_25px_-4px_rgba(15,23,42,0.06)] border border-slate-100 flex items-center justify-between transition-all duration-300">
        {/* Brand Logo + Text */}
        <Link href="#accueil" className="flex items-center gap-2.5 group">
          <Image
            src="/logo.png"
            alt="Co-Hub"
            width={40}
            height={100}
            className="h-9 w-9 object-contain group-hover:scale-105 transition-transform"
            priority
          />
          <span className="text-2xl font-extrabold tracking-tight text-corporate-navy group-hover:text-teal-700 transition-colors">
            Haute<span className="text-teal-600">matsiatra</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8 text-[14px] font-medium text-slate-600">
          <Link
            href="#accueil"
            className="text-teal-700 font-semibold hover:text-teal-600 transition-colors"
          >
            Accueil
          </Link>
        
          <Link href="#services" className="hover:text-teal-600 transition-colors">
            Services
          </Link>
          <div className="relative group cursor-pointer flex items-center gap-1 hover:text-teal-600 transition-colors">
            <span>Opportunités</span>
            <svg
              className="w-3.5 h-3.5 text-slate-400 group-hover:text-teal-600 transition-transform group-hover:rotate-180"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M19 9l-7 7-7-7"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              />
            </svg>
          </div>
            <Link href="#a-propos" className="hover:text-teal-600 transition-colors">
            À propos
          </Link>
          <Link href="#contact" className="hover:text-teal-600 transition-colors">
            Contact
          </Link>
        </nav>

        {/* CTA Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="#connexion"
            className="hidden sm:inline-flex items-center gap-2 text-[13px] font-semibold text-slate-700 px-4 py-2.5 rounded-full border border-slate-200 hover:border-teal-300 hover:text-teal-700 hover:bg-teal-50/60 transition-all duration-200"
          >
           
            Se connecter
          </Link>

          <Link
            href="#espace-pro"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white text-[13px] font-semibold px-5 py-2.5 rounded-full shadow-md shadow-teal-700/20 hover:shadow-lg hover:shadow-teal-700/30 transition-all duration-200"
          >
            S&apos;inscrire
          </Link>
        </div>
      </div>
    </header>
  );
}