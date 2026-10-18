"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { io } from "socket.io-client";
import { getApiRoot } from "../lib/auth";
import { useAuth } from "./AuthProvider";

export interface InterestNotification {
  id: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  createdAt: string;
  message?: string;
  senderCompany: {
    id: string;
    companyName: string;
    logoUrl?: string;
    sector?: string;
    user?: { avatarUrl?: string | null };
  };

  receiverCompany: {
    id: string;
    companyName: string;
    logoUrl?: string;
    sector?: string;
    user?: { avatarUrl?: string | null };
  };
  announcement: {
    id: string;
    title: string;
    category?: string;
  };
}

export interface MessageNotification {
  interestId: string;
  message: {
    id: string;
    content: string;
    createdAt: string;
    attachmentName?: string | null;
    sender: { companyName: string };
  };
}

type InterestsNotificationsValue = {
  unreadCount: number;
  unreadMessageCount: number;
  latestInterest: InterestNotification | null;
  latestStatusUpdate: InterestNotification | null;
  latestMessageNotification: MessageNotification | null;
  connectionError: string | null;
  clearUnread: () => void;
  decrementUnreadMessages: (count: number) => void;
  setActiveConversationId: (interestId: string | null) => void;
};

const InterestsNotificationsContext =
  createContext<InterestsNotificationsValue | null>(null);

export function InterestsNotificationsProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const pathname = usePathname();
  const pathnameRef = useRef(pathname);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const messageToastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const activeConversationIdRef = useRef<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);
  const [latestInterest, setLatestInterest] =
    useState<InterestNotification | null>(null);
  const [latestStatusUpdate, setLatestStatusUpdate] =
    useState<InterestNotification | null>(null);
  const [latestMessageNotification, setLatestMessageNotification] =
    useState<MessageNotification | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [toast, setToast] = useState<InterestNotification | null>(null);
  const [messageToast, setMessageToast] =
    useState<MessageNotification | null>(null);

  useEffect(() => {
    pathnameRef.current = pathname;
    if (pathname === "/acteur/demandes") {
      setUnreadCount(0);
    }
    if (pathname === "/acteur/messages") {
      setUnreadMessageCount(0);
    }
  }, [pathname]);

  const clearUnread = useCallback(() => setUnreadCount(0), []);
  const decrementUnreadMessages = useCallback((count: number) => {
    if (count > 0) {
      setUnreadMessageCount((current) => Math.max(0, current - count));
    }
  }, []);
  const setActiveConversationId = useCallback((interestId: string | null) => {
    activeConversationIdRef.current = interestId;
  }, []);

  useEffect(() => {
    if (isLoading || user?.role !== "COMPANY" || !user.company?.id) return;

    const socket = io(getApiRoot().replace(/\/api$/i, ""), {
      withCredentials: true,
    });
    socket.on("connect_error", () => {
      setConnectionError("Les notifications en temps réel ne sont pas disponibles.");
    });
    socket.on("connect", () => setConnectionError(null));
    void fetch(`${getApiRoot()}/messages/unread-count`, {
      credentials: "include",
      cache: "no-store",
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Impossible de charger le nombre de messages non lus.");
        }
        const result = (await response.json()) as { count: number };
        setUnreadMessageCount(
          pathnameRef.current === "/acteur/messages" ? 0 : result.count,
        );
      })
      .catch((cause: unknown) => {
        setConnectionError(
          cause instanceof Error
            ? cause.message
            : "Impossible de charger les notifications de messages.",
        );
      });
    socket.on("newInterestReceived", (interest: InterestNotification) => {
      setLatestInterest(interest);
      setToast(interest);
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      toastTimerRef.current = setTimeout(() => setToast(null), 7000);

      if (pathnameRef.current !== "/acteur/demandes") {
        setUnreadCount((count) => count + 1);
      }
    });
    socket.on("interestStatusUpdated", setLatestStatusUpdate);
    socket.on(
      "newMessageNotification",
      (notification: MessageNotification) => {
        if (
          notification.interestId === activeConversationIdRef.current
        ) {
          return;
        }
        setLatestMessageNotification(notification);
        setUnreadMessageCount((count) => count + 1);
        setMessageToast(notification);
        if (messageToastTimerRef.current) {
          clearTimeout(messageToastTimerRef.current);
        }
        messageToastTimerRef.current = setTimeout(
          () => setMessageToast(null),
          7000,
        );
      },
    );

    return () => {
      socket.disconnect();
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      if (messageToastTimerRef.current) {
        clearTimeout(messageToastTimerRef.current);
      }
    };
  }, [isLoading, user?.company?.id, user?.role]);

  const dismissToast = () => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast(null);
  };

  const dismissMessageToast = () => {
    if (messageToastTimerRef.current) {
      clearTimeout(messageToastTimerRef.current);
    }
    setMessageToast(null);
  };

  return (
    <InterestsNotificationsContext.Provider
      value={{
        unreadCount,
        unreadMessageCount,
        latestInterest,
        latestStatusUpdate,
        latestMessageNotification,
        connectionError,
        clearUnread,
        decrementUnreadMessages,
        setActiveConversationId,
      }}
    >
      {children}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-5 right-5 z-[100] w-[min(24rem,calc(100vw-2.5rem))] overflow-hidden rounded-2xl border border-emerald-200 bg-white shadow-xl"
        >
          <div className="flex items-start gap-3 p-4">
            <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-500" />
            <Link
              href="/acteur/demandes"
              onClick={dismissToast}
              className="min-w-0 flex-1"
            >
              <p className="text-sm font-bold text-slate-900">
                Nouvelle demande d&apos;intérêt
              </p>
              <p className="mt-1 text-xs leading-relaxed text-slate-600">
                {toast.senderCompany.companyName} manifeste son intérêt pour
                {" "}&laquo; {toast.announcement.title} &raquo;.
              </p>
              <span className="mt-2 inline-block text-xs font-semibold text-emerald-700">
                Voir la demande
              </span>
            </Link>
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
      {messageToast && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed right-5 z-[101] w-[min(24rem,calc(100vw-2.5rem))] overflow-hidden rounded-2xl border border-sky-200 bg-white shadow-xl ${
            toast ? "bottom-[8.5rem]" : "bottom-5"
          }`}
        >
          <div className="flex items-start gap-3 p-4">
            <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-sky-500" />
            <Link
              href="/acteur/messages"
              onClick={() => {
                dismissMessageToast();
              }}
              className="min-w-0 flex-1"
            >
              <p className="text-sm font-bold text-slate-900">
                Nouveau message
              </p>
              <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-600">
                {messageToast.message.sender.companyName} :{" "}
                {messageToast.message.attachmentName
                  ? `📎 ${messageToast.message.attachmentName}`
                  : messageToast.message.content}
              </p>
              <span className="mt-2 inline-block text-xs font-semibold text-sky-700">
                Ouvrir la messagerie
              </span>
            </Link>
            <button
              type="button"
              onClick={dismissMessageToast}
              aria-label="Fermer la notification de message"
              className="rounded-full p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </InterestsNotificationsContext.Provider>
  );
}

export function useInterestsNotifications() {
  const context = useContext(InterestsNotificationsContext);
  if (!context) {
    throw new Error(
      "useInterestsNotifications doit être utilisé dans InterestsNotificationsProvider.",
    );
  }
  return context;
}
