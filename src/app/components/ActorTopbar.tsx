"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import {
  HiOutlineUserGroup,
  HiOutlineArrowsRightLeft,
  HiOutlineChatBubbleLeftRight,
  HiOutlineBell,
  HiOutlineArrowRightOnRectangle,
  HiOutlineUser,
  HiOutlineCog6Tooth,
  HiOutlineChevronDown,
  HiOutlineBriefcase,
  HiOutlinePlusCircle,
  HiBriefcase,
  HiUserGroup,
  HiArrowsRightLeft,
  HiChatBubbleLeftRight,
  HiPlusCircle,
} from "react-icons/hi2";
import { useAuth } from "../providers/AuthProvider";

export default function ActorTopbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const isActive = (path: string) => pathname === path;
  const displayName = user?.company?.companyName || user?.email || "Mon compte";
  const initials = displayName.slice(0, 2).toUpperCase();

  const handleLogout = async () => {
    setLogoutError(null);
    try {
      await logout();
      router.replace("/login");
    } catch (cause) {
      setLogoutError(
        cause instanceof Error ? cause.message : "La déconnexion a échoué."
      );
    }
  };

  // 5 navlinks : Opportunités, Partenaires, Annonce, Demandes, Messages
  const navItems = [
    {
      href: "/acteur/opportunites",
      label: "Opportunités",
      iconOutline: HiOutlineBriefcase,
      iconSolid: HiBriefcase,
    },
    {
      href: "/acteur/partenaires",
      label: "Partenaires",
      iconOutline: HiOutlineUserGroup,
      iconSolid: HiUserGroup,
    },
    {
      href: "/acteur/annonces/nouvelle",
      label: "Annonce",
      iconOutline: HiOutlinePlusCircle,
      iconSolid: HiPlusCircle,
    },
    {
      href: "/acteur/demandes",
      label: "Demandes",
      iconOutline: HiOutlineArrowsRightLeft,
      iconSolid: HiArrowsRightLeft,
    },
    {
      href: "/acteur/messages",
      label: "Messages",
      iconOutline: HiOutlineChatBubbleLeftRight,
      iconSolid: HiChatBubbleLeftRight,
    },
  ];

  // Ferme le dropdown profil si on clique en dehors
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 h-20 bg-white border-b border-slate-200 z-50">
      <div className="h-full max-w-[1600px] mx-auto px-6 sm:px-10 lg:px-16 flex items-center justify-between gap-3">
        {/* Zone gauche : Logo + Texte aligné */}
        <div className="flex items-center shrink-0">
          <Link
            href="/acteur/opportunites"
            className="flex items-center gap-3 group shrink-0"
          >
            <Image
              src="/logo.png"
              alt="CCI B2B Connect"
              width={48}
              height={48}
              className="w-12 h-12 object-contain group-hover:scale-105 transition-transform"
              priority
            />
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-extrabold tracking-tight text-emerald-600">
                B2B Connect
              </span>
            </div>
          </Link>
        </div>

        {/* Zone centrale : Navigation (5 navlinks simples) */}
        <nav className="hidden lg:flex items-center justify-center gap-0 flex-1 max-w-3xl mx-auto h-full">
          {navItems.map((item) => {
            const active = isActive(item.href);
            const Icon = active ? item.iconSolid : item.iconOutline;
            return (
              <Link
                key={item.href}
                href={item.href}
                title={item.label}
                aria-label={item.label}
                className="group relative flex-1 h-full flex flex-col items-center justify-center gap-1 transition-all hover:bg-slate-50"
              >
                <div
                  className={`flex items-center justify-center w-11 h-11 rounded-full transition-all ${
                    active
                      ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                      : "text-slate-500 group-hover:text-slate-700"
                  }`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <span
                  className={`text-[11px] font-bold leading-none ${
                    active ? "text-emerald-600" : "text-slate-500"
                  }`}
                >
                  {item.label}
                </span>

                {active && (
                  <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-emerald-600 rounded-full" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Zone droite : Notifications | Séparateur | Profil */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Notifications */}
          <button
            aria-label="Notifications"
            title="Notifications"
            className="w-11 h-11 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 transition relative"
          >
            <HiOutlineBell className="w-6 h-6" />
            <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white" />
          </button>

          <div className="w-px h-7 bg-slate-200 mx-1" />

          {/* Profil */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              aria-label="Profil"
              className="flex items-center gap-1.5 group"
            >
              <div className="w-11 h-11 rounded-full bg-linear-to-br from-emerald-500 to-emerald-700 text-white flex items-center justify-center text-sm font-bold ring-2 ring-white shadow-sm group-hover:opacity-90 transition">
                {initials}
              </div>

              <HiOutlineChevronDown
                className={`w-5 h-5 text-slate-400 group-hover:text-slate-600 transition-transform duration-200 ${
                  isProfileOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 text-xs text-slate-700">
                <div className="px-4 py-2 border-b border-slate-100">
                  <p className="font-bold text-slate-900">{displayName}</p>
                  <p className="text-[10px] text-slate-400">{user?.email}</p>
                </div>

                <Link
                  href="/acteur/profil"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-2 px-4 py-2.5 hover:bg-slate-50 transition text-slate-700 font-medium"
                >
                  <HiOutlineUser className="w-4 h-4 text-slate-400" />
                  Mon Profil
                </Link>

                <Link
                  href="/acteur/parametres"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-2 px-4 py-2.5 hover:bg-slate-50 transition text-slate-700 font-medium"
                >
                  <HiOutlineCog6Tooth className="w-4 h-4 text-slate-400" />
                  Paramètres
                </Link>

                <div className="border-t border-slate-100 my-1" />

                {logoutError && (
                  <p role="alert" className="px-4 py-2 text-rose-600">
                    {logoutError}
                  </p>
                )}
                <button
                  onClick={() => void handleLogout()}
                  className="w-full flex items-center gap-2 px-4 py-2.5 hover:bg-rose-50 text-rose-600 transition font-medium text-left"
                >
                  <HiOutlineArrowRightOnRectangle className="w-4 h-4 text-rose-500" />
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