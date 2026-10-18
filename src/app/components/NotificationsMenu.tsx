"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { HiOutlineBell } from "react-icons/hi2";
import { useInterestsNotifications } from "../providers/InterestsNotificationsProvider";

export default function NotificationsMenu() {
  const {
    unreadCount,
    latestInterest,
    latestStatusUpdate,
    connectionError,
    clearUnread,
  } = useInterestsNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    function handlePointerDown(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setIsOpen(false);
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const notifications = [
    latestStatusUpdate && {
      id: latestStatusUpdate.id,
      title:
        latestStatusUpdate.status === "ACCEPTED"
          ? "Demande acceptée"
          : latestStatusUpdate.status === "REJECTED"
            ? "Demande refusée"
            : "Demande mise à jour",
      description: `Votre demande auprès de ${latestStatusUpdate.receiverCompany.companyName} a été ${
        latestStatusUpdate.status === "ACCEPTED"
          ? "acceptée"
          : latestStatusUpdate.status === "REJECTED"
            ? "refusée"
            : "mise à jour"
      }.`,
    },
    latestInterest && {
      id: latestInterest.id,
      title: "Nouvelle demande d’intérêt",
      description: `${latestInterest.senderCompany.companyName} manifeste son intérêt pour « ${latestInterest.announcement.title} ».`,
    },
  ].filter((notification): notification is NonNullable<typeof notification> =>
    Boolean(notification),
  );

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => {
          setIsOpen((open) => !open);
          clearUnread();
        }}
        aria-label={
          unreadCount > 0
            ? `Notifications (${unreadCount} non lue${unreadCount > 1 ? "s" : ""})`
            : "Notifications"
        }
        aria-expanded={isOpen}
        aria-controls="actor-notifications-panel"
        title="Notifications"
        className="relative flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-700 transition hover:bg-slate-200"
      >
        <HiOutlineBell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white ring-2 ring-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <section
          id="actor-notifications-panel"
          aria-label="Notifications récentes"
          className="absolute right-0 top-full z-[60] mt-3 w-[min(22rem,calc(100vw-1.5rem))] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl"
        >
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Notifications
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Fermer les notifications"
              className="rounded-full p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {connectionError && (
            <p
              role="status"
              className="border-b border-slate-100 px-4 py-3 text-xs text-amber-700"
            >
              {connectionError}
            </p>
          )}

          {notifications.length > 0 ? (
            <ul className="max-h-72 overflow-y-auto">
              {notifications.map((notification) => (
                <li key={notification.id}>
                  <Link
                    href="/acteur/demandes"
                    onClick={() => setIsOpen(false)}
                    className="block border-b border-slate-100 px-4 py-3 transition last:border-b-0 hover:bg-slate-50"
                  >
                    <p className="text-sm font-semibold text-slate-800">
                      {notification.title}
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-slate-600">
                      {notification.description}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-4 py-6 text-center text-sm text-slate-500">
              Aucune notification pour le moment.
            </p>
          )}

          <Link
            href="/acteur/demandes"
            onClick={() => setIsOpen(false)}
            className="block border-t border-slate-100 px-4 py-3 text-center text-xs font-semibold text-emerald-700 transition hover:bg-emerald-50"
          >
            Voir toutes les demandes
          </Link>
        </section>
      )}
    </div>
  );
}
