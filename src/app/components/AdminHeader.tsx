"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

export default function AdminHeader() {
  const pathname = usePathname();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentUser = {
    name: "Jean Dupont",
    role: "Administrateur",
    email: "admin@cci-matsiatra.mg",
  };

  const navLinks = [
    { label: "Vue d'ensemble", href: "/admin/dashboard" },
    { label: "Demandes", href: "/admin/companies/pending" },
    { label: "Membres", href: "/admin/users" },
    { label: "Partenariats", href: "/admin/partnerships" },
  ];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="w-full pt-3 sm:pt-4 pb-2 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto fixed top-0 left-0 right-0 z-50">
      <div className="flex items-center justify-between gap-4 py-2.5 sm:py-3 px-4 sm:px-6 bg-white/95 backdrop-blur-md rounded-2xl sm:rounded-full border border-slate-200/80 shadow-[0_4px_25px_-4px_rgba(15,23,42,0.06)] w-full transition-all duration-300">
        
        {/* Brand Logo avec image.svg */}
        <Link
          href="/admin/dashboard"
          className="flex items-center gap-2.5 sm:gap-3 group shrink-0"
        >
          <div className="relative w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Image
              src="/logo.svg"
              alt="Logo CCI B2B Connect"
              fill
              className="object-contain"
              priority
            />
          </div>

          <div className="flex items-baseline gap-1">
            <span className="text-base sm:text-lg font-extrabold tracking-tight text-slate-900 group-hover:text-emerald-700 transition-colors">
              CCI
            </span>
            <span className="text-base sm:text-lg font-bold tracking-tight text-emerald-600">
              B2B Connect
            </span>
          </div>
        </Link>

        {/* Navigation avec fond gris + actif blanc */}
        <nav className="hidden lg:flex items-center gap-1 bg-slate-100/70 p-1 rounded-full text-xs sm:text-sm font-semibold">
          {navLinks.map((link) => {
            const isActive =
              pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2.5 rounded-full transition-all duration-200 whitespace-nowrap ${
                  isActive
                    ? "bg-emerald-600 text-white font-bold shadow-sm"
                    : "text-slate-500 hover:text-slate-900 hover:bg-white/60"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          <button
            aria-label="Rechercher"
            className="w-9 h-9 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-100 transition"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </button>

          <button
            aria-label="Notifications"
            className="w-9 h-9 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-100 transition relative"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.3 21a1.94 1.94 0 0 0 3.4 0"
              />
            </svg>
            <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white" />
          </button>

          <div className="relative pl-2 border-l border-slate-200" ref={dropdownRef}>
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2 group"
            >
              <div className="relative w-9 h-9 rounded-full overflow-hidden ring-2 ring-white shadow-sm">
                <div className="w-full h-full bg-gradient-to-br from-emerald-500 to-emerald-700 text-white flex items-center justify-center font-bold text-xs">
                  {currentUser.name.charAt(0)}
                </div>
              </div>
              <svg
                className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m6 9 6 6 6-6"
                />
              </svg>
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-3 w-52 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 text-xs text-slate-700">
                <div className="px-4 py-2 border-b border-slate-100">
                  <p className="font-bold text-slate-900">{currentUser.name}</p>
                  <p className="text-[10px] text-slate-400">
                    {currentUser.email}
                  </p>
                </div>
                <Link
                  href="/admin/profile"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-2 px-4 py-2.5 hover:bg-slate-50 transition text-slate-700 font-medium"
                >
                  Mon Profil
                </Link>
                <Link
                  href="/admin/settings"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-2 px-4 py-2.5 hover:bg-slate-50 transition text-slate-700 font-medium"
                >
                  Paramètres
                </Link>
                <div className="border-t border-slate-100 my-1" />
                <button
                  onClick={() => setIsProfileOpen(false)}
                  className="w-full flex items-center gap-2 px-4 py-2.5 hover:bg-rose-50 text-rose-600 transition font-medium text-left"
                >
                  Déconnexion
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}