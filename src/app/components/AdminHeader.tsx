"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminHeader() {
  const pathname = usePathname();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const navLinks = [
    { label: "Vue d'ensemble", href: "/admin/dashboard" },
    { label: "Demandes", href: "/admin/companies/pending" },
    { label: "Partenariats", href: "/admin/partnerships" },
    { label: "Statistiques & Rapports", href: "/admin/reports" },
  ];

  // Fermer le dropdown si on clique en dehors
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="flex flex-col md:flex-row items-center justify-between gap-4 pb-2 border-b border-teal-50/60 w-full">
      {/* Brand Logo (Identique à la page d'accueil) */}
      <Link href="/admin/dashboard" className="flex items-center gap-3 w-full md:w-auto">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-800 to-teal-500 flex items-center justify-center text-white shadow-md shadow-teal-700/20">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" viewBox="0 0 24 24">
            <path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v1" />
            <path d="M18 8h4a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-4" />
            <circle cx="8" cy="12" r="2" />
          </svg>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-xl font-extrabold tracking-tight text-slate-900">CCI</span>
          <span className="text-xl font-bold tracking-tight text-teal-700">B2B Connect</span>
        </div>
      </Link>

      {/* Navigation Links */}
      <nav className="flex items-center bg-white/80 p-1.5 rounded-full shadow-xs border text-xs sm:text-sm font-semibold text-slate-600 border-slate-200">
        {navLinks.map((link) => {
          const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`px-4 py-2 rounded-full transition-all duration-200 ${
                isActive
                  ? "bg-slate-900 text-white font-medium shadow-xs"
                  : "hover:text-teal-700 text-slate-600"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>

      {/* Actions & Profil Utilisateur */}
      <div className="flex items-center gap-3 self-end md:self-auto">
        {/* 1. Icône Message */}
        <button
          aria-label="Messages"
          className="w-10 h-10 rounded-full bg-white border border-slate-200/80 flex items-center justify-center text-slate-600 hover:text-teal-600 hover:border-teal-300 transition shadow-xs relative"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <span className="absolute top-2 right-2 w-2 h-2 bg-teal-500 rounded-full ring-2 ring-white" />
        </button>

        {/* 2. Icône Notification */}
        <button
          aria-label="Notifications"
          className="w-10 h-10 rounded-full bg-white border border-slate-200/80 flex items-center justify-center text-slate-600 hover:text-teal-600 hover:border-teal-300 transition shadow-xs relative"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
          </svg>
          <span className="absolute top-2 right-2 w-2 h-2 bg-amber-500 rounded-full ring-2 ring-white animate-pulse" />
        </button>

        {/* 3. Icône Utilisateur avec Menu Déroulant (Dropdown) */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="w-10 h-10 rounded-full bg-slate-900 text-teal-400 font-extrabold text-xs flex items-center justify-center ring-2 ring-teal-200 shadow-xs hover:ring-teal-400 transition"
          >
            CCI
          </button>

          {/* Menu Déroulant */}
          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 text-xs text-slate-700 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="font-bold text-slate-900">Admin CCI</p>
                <p className="text-[10px] text-slate-400">admin@cci-matsiatra.mg</p>
              </div>

              <Link
                href="/admin/profile"
                onClick={() => setIsProfileOpen(false)}
                className="flex items-center gap-2 px-4 py-2.5 hover:bg-slate-50 transition text-slate-700 font-medium"
              >
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Mon Profil
              </Link>

              <Link
                href="/admin/settings"
                onClick={() => setIsProfileOpen(false)}
                className="flex items-center gap-2 px-4 py-2.5 hover:bg-slate-50 transition text-slate-700 font-medium"
              >
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Paramètres
              </Link>

              <div className="border-t border-slate-100 my-1"></div>

              <button
                onClick={() => {
                  setIsProfileOpen(false);
                  // Action de déconnexion ici
                }}
                className="w-full flex items-center gap-2 px-4 py-2.5 hover:bg-rose-50 text-rose-600 transition font-medium text-left"
              >
                <svg className="w-4 h-4 text-rose-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Déconnexion
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}