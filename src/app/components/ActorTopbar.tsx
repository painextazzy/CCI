"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import {
  HiOutlineUserGroup,
  HiOutlineArrowsRightLeft,
  HiOutlineChatBubbleLeftRight,
  HiOutlineArrowRightOnRectangle,
  HiOutlineUser,
  HiOutlineCog6Tooth,
  HiOutlineChevronDown,
  HiOutlineBars3,
  HiOutlineXMark,
  HiOutlineBriefcase,
  HiOutlinePlusCircle,
  HiBriefcase,
  HiUserGroup,
  HiArrowsRightLeft,
  HiChatBubbleLeftRight,
  HiPlusCircle,
} from "react-icons/hi2";
import { useAuth } from "../providers/AuthProvider";
import { useInterestsNotifications } from "../providers/InterestsNotificationsProvider";
import NotificationsMenu from "./NotificationsMenu";

export default function ActorTopbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const {
    unreadCount,
    unreadMessageCount,
    clearUnread,
  } = useInterestsNotifications();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const isActive = (path: string) => pathname === path;
  const displayName = user?.company?.companyName || user?.email || "Mon compte";
  const initials = displayName.slice(0, 2).toUpperCase();

  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

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
      <div className="relative h-full max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-16 flex items-center justify-between gap-3">
        {/* Zone gauche : Logo + Texte aligné */}
        <div className="flex items-center gap-2 shrink-0">
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
            <div className="hidden items-baseline gap-1.5 sm:flex">
              <span className="text-xl font-extrabold tracking-tight text-emerald-600">
                B2B Connect
              </span>
            </div>
          </Link>
          <button
            type="button"
            onClick={() => setIsMenuOpen((open) => !open)}
            aria-label={isMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={isMenuOpen}
            aria-controls="actor-mobile-navigation"
            className="relative flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 transition hover:bg-slate-100 lg:hidden"
          >
            {isMenuOpen ? (
              <HiOutlineXMark className="h-6 w-6" />
            ) : (
              <HiOutlineBars3 className="h-6 w-6" />
            )}
            {unreadMessageCount > 0 && !isActive("/acteur/messages") && (
              <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-rose-500 px-1 text-center text-[9px] font-bold leading-5 text-white">
                {unreadMessageCount > 99 ? "99+" : unreadMessageCount}
              </span>
            )}
          </button>
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
                onClick={() => {
                  if (item.href === "/acteur/demandes") clearUnread();
                }}
                title={item.label}
                aria-label={
                  item.href === "/acteur/demandes" && unreadCount > 0
                    ? `${item.label} (${unreadCount} nouvelle${unreadCount > 1 ? "s" : ""})`
                    : item.href === "/acteur/messages" &&
                        unreadMessageCount > 0 &&
                        !active
                      ? `${item.label} (${unreadMessageCount} nouveau${unreadMessageCount > 1 ? "x" : ""})`
                    : item.label
                }
                className="group relative flex-1 h-full flex flex-col items-center justify-center gap-1 transition-all hover:bg-slate-50"
              >
                <div
                  className={`relative flex items-center justify-center w-11 h-11 rounded-full transition-all ${
                    active
                      ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                      : "text-slate-500 group-hover:text-slate-700"
                  }`}
                >
                  <Icon className="w-6 h-6" />
                  {item.href === "/acteur/demandes" && unreadCount > 0 && (
                    <span className="absolute top-2 right-[calc(50%-1.5rem)] min-w-5 h-5 px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                  {item.href === "/acteur/messages" &&
                    unreadMessageCount > 0 &&
                    !active && (
                      <span className="absolute -right-1 -top-1 min-w-5 h-5 px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
                        {unreadMessageCount > 99 ? "99+" : unreadMessageCount}
                      </span>
                    )}
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

        {isMenuOpen && (
          <nav
            id="actor-mobile-navigation"
            aria-label="Navigation principale"
            className="absolute left-3 right-3 top-[calc(100%+0.5rem)] z-50 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl sm:left-6 sm:right-auto sm:w-72 lg:hidden"
          >
            {navItems.map((item) => {
              const active = isActive(item.href);
              const Icon = active ? item.iconSolid : item.iconOutline;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => {
                    if (item.href === "/acteur/demandes") clearUnread();
                    setIsMenuOpen(false);
                  }}
                  aria-current={active ? "page" : undefined}
                  className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition ${
                    active
                      ? "bg-emerald-50 text-emerald-700"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <span className="relative">
                    <Icon className="h-5 w-5" />
                    {item.href === "/acteur/demandes" && unreadCount > 0 && (
                      <span className="absolute -right-2 -top-2 min-w-4 rounded-full bg-rose-500 px-1 text-center text-[9px] font-bold text-white">
                        {unreadCount > 99 ? "99+" : unreadCount}
                      </span>
                    )}
                    {item.href === "/acteur/messages" &&
                      unreadMessageCount > 0 &&
                      !active && (
                        <span className="absolute -right-2 -top-2 min-w-4 rounded-full bg-rose-500 px-1 text-center text-[9px] font-bold text-white">
                          {unreadMessageCount > 99
                            ? "99+"
                            : unreadMessageCount}
                        </span>
                      )}
                  </span>
                  {item.label}
                </Link>
              );
            })}
          </nav>
        )}

        {/* Zone droite : Notifications | Séparateur | Profil */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Notifications */}
          <NotificationsMenu />

          <div className="w-px h-7 bg-slate-200 mx-1" />

          {/* Profil */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              aria-label="Profil"
              className="flex items-center gap-1.5 group"
            >
              {user?.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.avatarUrl}
                  alt=""
                  className="h-11 w-11 rounded-full object-cover ring-2 ring-white shadow-sm transition group-hover:opacity-90"
                />
              ) : (
                <div className="w-11 h-11 rounded-full bg-linear-to-br from-emerald-500 to-emerald-700 text-white flex items-center justify-center text-sm font-bold ring-2 ring-white shadow-sm group-hover:opacity-90 transition">
                  {initials}
                </div>
              )}

              <HiOutlineChevronDown
                className={`w-5 h-5 text-slate-400 group-hover:text-slate-600 transition-transform duration-200 ${
                  isProfileOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {isProfileOpen && (
              <div data-actor-card className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 text-xs text-slate-700">
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
                  Paramètres du compte
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