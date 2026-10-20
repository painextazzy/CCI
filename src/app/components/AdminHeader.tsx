"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { useAuth } from "../providers/AuthProvider";
import { getApiRoot } from "../lib/auth";
import { Bell, X } from "lucide-react";

interface AdminNotification {
  id: string;
  type: "REGISTRATION" | "PARTNERSHIP";
  companyName: string;
  subject: string | null;
  createdAt: string;
}

export default function AdminHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, isLoading } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationError, setNotificationError] = useState<string | null>(
    null,
  );
  const [toast, setToast] = useState<AdminNotification | null>(null);
  const [logoutError, setLogoutError] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentUser = {
    name: user?.email || "Mon compte",
    role: user?.role === "ADMIN" ? "Administrateur" : "Agent CCI",
    email: user?.email || "",
  };

  const handleLogout = async () => {
    setLogoutError(null);
    try {
      await logout();
      router.replace("/login");
    } catch (cause) {
      setLogoutError(
        cause instanceof Error ? cause.message : "La déconnexion a échoué.",
      );
    }
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

  useEffect(() => {
    if (
      isLoading ||
      (user?.role !== "ADMIN" && user?.role !== "CCI_STAFF")
    ) {
      return;
    }

    let isActive = true;
    let hasLoadedInitialNotifications = false;
    const knownIds = new Set<string>();

    async function loadNotifications() {
      try {
        const response = await fetch(
          `${getApiRoot()}/admin/dashboard/notifications`,
          {
            credentials: "include",
            cache: "no-store",
          },
        );
        if (!response.ok) {
          throw new Error("Impossible de charger les notifications.");
        }

        const incoming: AdminNotification[] = await response.json();
        if (!isActive) return;

        const newNotifications = hasLoadedInitialNotifications
          ? incoming.filter((notification) => !knownIds.has(notification.id))
          : [];
        if (!hasLoadedInitialNotifications) {
          setUnreadCount(incoming.length);
        }
        incoming.forEach((notification) => knownIds.add(notification.id));
        setNotifications((current) =>
          [...incoming, ...current]
            .filter(
              (notification, index, all) =>
                all.findIndex((item) => item.id === notification.id) === index,
            )
            .slice(0, 20),
        );
        setNotificationError(null);

        if (newNotifications.length > 0) {
          setUnreadCount((count) => count + newNotifications.length);
          setToast(newNotifications[0]);
          if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
          toastTimerRef.current = setTimeout(() => setToast(null), 7000);
        }
        hasLoadedInitialNotifications = true;
      } catch (cause) {
        if (!isActive) return;
        setNotificationError(
          cause instanceof Error
            ? cause.message
            : "Impossible de charger les notifications.",
        );
      }
    }

    void loadNotifications();
    const interval = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        void loadNotifications();
      }
    }, 10_000);

    return () => {
      isActive = false;
      window.clearInterval(interval);
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, [isLoading, user?.role]);

  const notificationHref = (notification: AdminNotification) =>
    notification.type === "REGISTRATION"
      ? "/admin/companies/pending"
      : "/admin/partnerships";
  const notificationTitle = (notification: AdminNotification) =>
    notification.type === "REGISTRATION"
      ? "Nouvelle demande d'inscription"
      : "Nouvelle demande de partenariat";
  const notificationDescription = (notification: AdminNotification) =>
    notification.type === "REGISTRATION"
      ? notification.companyName
      : `${notification.companyName} : ${notification.subject ?? "Nouvelle annonce de partenariat"}`;

  const dismissToast = () => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast(null);
  };

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
              src="/logo.png"
              alt="Logo CCI B2B Connect"
              fill
              className="object-contain"
              priority
            />
          </div>

          <div className="flex items-baseline gap-1">
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
          <div className="relative">
            <button
              type="button"
              aria-label={
                unreadCount > 0
                  ? `Notifications, ${unreadCount} non lue${unreadCount > 1 ? "s" : ""}`
                  : "Notifications"
              }
              aria-expanded={isNotificationsOpen}
              aria-controls="admin-notifications-panel"
              onClick={() => {
                setIsNotificationsOpen((open) => !open);
                setUnreadCount(0);
              }}
              className="relative flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100"
            >
              <Bell className="h-4 w-4" aria-hidden="true" />
              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white ring-2 ring-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>
            {isNotificationsOpen && (
              <section
                id="admin-notifications-panel"
                aria-label="Notifications récentes"
                className="absolute right-0 top-full z-[60] mt-3 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl"
              >
                <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                  <h2 className="text-sm font-bold text-slate-900">
                    Notifications
                  </h2>
                  <button
                    type="button"
                    onClick={() => setIsNotificationsOpen(false)}
                    aria-label="Fermer les notifications"
                    className="rounded-full p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                {notificationError && (
                  <p role="alert" className="px-4 py-3 text-xs text-rose-700">
                    {notificationError}
                  </p>
                )}
                {notifications.length > 0 ? (
                  <ul className="max-h-80 divide-y divide-slate-100 overflow-y-auto">
                    {notifications.map((notification) => (
                      <li key={notification.id}>
                        <Link
                          href={notificationHref(notification)}
                          onClick={() => setIsNotificationsOpen(false)}
                          className="block px-4 py-3 transition hover:bg-slate-50"
                        >
                          <p className="text-xs font-bold text-slate-900">
                            {notificationTitle(notification)}
                          </p>
                          <p className="mt-1 line-clamp-2 text-xs text-slate-600">
                            {notificationDescription(notification)}
                          </p>
                          <time
                            dateTime={notification.createdAt}
                            className="mt-1 block text-[10px] text-slate-400"
                          >
                            {new Date(notification.createdAt).toLocaleString(
                              "fr-FR",
                            )}
                          </time>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  !notificationError && (
                    <p className="px-4 py-6 text-center text-xs text-slate-500">
                      Aucune nouvelle notification.
                    </p>
                  )
                )}
              </section>
            )}
          </div>

          <div
            className="relative pl-2 border-l border-slate-200"
            ref={dropdownRef}
          >
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
                  href="/admin/settings"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-2 px-4 py-2.5 hover:bg-slate-50 transition text-slate-700 font-medium"
                >
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
                  Déconnexion
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-5 right-5 z-[100] w-[min(26rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-emerald-200 bg-white shadow-xl"
        >
          <div className="flex items-start gap-3 p-4">
            <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-500" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-slate-900">
                {notificationTitle(toast)}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-slate-600">
                {notificationDescription(toast)}
              </p>
              <Link
                href={notificationHref(toast)}
                onClick={dismissToast}
                className="mt-2 inline-block text-xs font-semibold text-emerald-700"
              >
                Voir la demande
              </Link>
            </div>
            <button
              type="button"
              onClick={dismissToast}
              aria-label="Fermer la notification"
              className="rounded-full p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
