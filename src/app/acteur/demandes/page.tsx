"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  Check,
  X,
  MessageSquare,
  Inbox,
  Send,
  Search,
  Info,
  Calendar,
  Tag,
} from "lucide-react";
import { getApiRoot } from "../../lib/auth";
import { useAuth } from "../../providers/AuthProvider";
import {
  useInterestsNotifications,
  type InterestNotification,
} from "../../providers/InterestsNotificationsProvider";

type InterestItem = InterestNotification;

export default function DemandesPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const { latestInterest, latestStatusUpdate, connectionError } =
    useInterestsNotifications();
  const [activeTab, setActiveTab] = useState<"received" | "sent">("received");
  const [interests, setInterests] = useState<InterestItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("ALL");

  useEffect(() => {
    if (isAuthLoading) return;
    if (!user?.company?.id) {
      setError(
        "Connectez-vous avec un compte entreprise pour voir vos demandes.",
      );
      setIsLoading(false);
      return;
    }
    const companyId = user.company.id;

    let active = true;
    async function loadInterests() {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`${getApiRoot()}/interests/${activeTab}`, {
          credentials: "include",
          cache: "no-store",
        });
        if (!response.ok) {
          throw new Error(
            "Impossible de charger vos demandes de mise en relation.",
          );
        }
        const loaded = (await response.json()) as InterestItem[];
        if (active) {
          setInterests((current) => {
            const currentTabItems = current.filter((interest) =>
              activeTab === "received"
                ? interest.receiverCompany?.id === companyId
                : interest.senderCompany?.id === companyId,
            );
            const byId = new Map(
              [...loaded, ...currentTabItems].map((interest) => [
                interest.id,
                interest,
              ]),
            );
            return [...byId.values()];
          });
        }
      } catch (cause) {
        if (active) {
          setError(
            cause instanceof Error
              ? cause.message
              : "Impossible de charger vos demandes.",
          );
        }
      } finally {
        if (active) setIsLoading(false);
      }
    }

    void loadInterests();
    return () => {
      active = false;
    };
  }, [activeTab, isAuthLoading, user?.company?.id]);

  useEffect(() => {
    if (!latestInterest) return;
    setInterests((current) => [
      latestInterest,
      ...current.filter((item) => item.id !== latestInterest.id),
    ]);
  }, [latestInterest]);

  useEffect(() => {
    if (!latestStatusUpdate) return;
    setInterests((current) =>
      current.map((item) =>
        item.id === latestStatusUpdate.id ? latestStatusUpdate : item,
      ),
    );
  }, [latestStatusUpdate]);

  const handleResponse = async (
    interestId: string,
    action: "accept" | "reject",
  ) => {
    setError(null);
    try {
      const response = await fetch(
        `${getApiRoot()}/interests/${interestId}/${action}`,
        { method: "PATCH", credentials: "include" },
      );
      const updated = (await response.json()) as InterestItem & {
        message?: string;
      };
      if (!response.ok) {
        throw new Error(updated.message || "La réponse à la demande a échoué.");
      }
      setInterests((current) =>
        current.map((item) => (item.id === interestId ? updated : item)),
      );
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "La réponse à la demande a échoué.",
      );
    }
  };

  const activeTabInterests = useMemo(
    () =>
      interests.filter((item) =>
        activeTab === "received"
          ? item.receiverCompany?.id === user?.company?.id
          : item.senderCompany?.id === user?.company?.id,
      ),
    [interests, activeTab, user?.company?.id],
  );

  const filteredInterests = useMemo(() => {
    return activeTabInterests.filter((item) => {
      const targetCompany =
        activeTab === "received" ? item.senderCompany : item.receiverCompany;
      const matchesSearch =
        targetCompany?.companyName
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        item.announcement?.title
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        item.message?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        selectedStatus === "ALL" || item.status === selectedStatus;

      return matchesSearch && matchesStatus;
    });
  }, [activeTabInterests, searchQuery, selectedStatus, activeTab]);

  const counts = useMemo(() => {
    return {
      all: activeTabInterests.length,
      pending: activeTabInterests.filter((i) => i.status === "PENDING").length,
      accepted: activeTabInterests.filter((i) => i.status === "ACCEPTED")
        .length,
    };
  }, [activeTabInterests]);

  const statusFilters = [
    { value: "ALL", label: "Toutes", count: counts.all },
    { value: "PENDING", label: "En attente", count: counts.pending },
    { value: "ACCEPTED", label: "Acceptées", count: counts.accepted },
  ];

  return (
    <div className="w-full space-y-6 py-4 px-4 sm:px-6 lg:px-8">
      {/* ─── Barre d'outils ─── */}
      <div className="flex flex-col gap-4">
        {/* Ligne 1 : Recherche + Switcher */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" />
            <input
              type="text"
              placeholder="Rechercher par nom, annonce, message..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-full bg-white border-2 border-[#F2F2F2] text-xs font-medium text-slate-800 placeholder-slate-300 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          <div className="flex items-center rounded-full border-2 border-[#F2F2F2] bg-white p-1 shrink-0">
            <button
              onClick={() => setActiveTab("received")}
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition-colors ${
                activeTab === "received"
                  ? "bg-emerald-500 text-white"
                  : "text-slate-500 hover:text-emerald-500"
              }`}
            >
              <Inbox className="w-3.5 h-3.5" />
              <span>Reçues</span>
            </button>
            <button
              onClick={() => setActiveTab("sent")}
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition-colors ${
                activeTab === "sent"
                  ? "bg-emerald-500 text-white"
                  : "text-slate-500 hover:text-emerald-500"
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>Envoyées</span>
            </button>
          </div>
        </div>

        {/* Ligne 2 : Filtres par statut */}
        <div className="flex flex-wrap items-center gap-2">
          {statusFilters.map((f) => {
            const active = selectedStatus === f.value;
            return (
              <button
                key={f.value}
                onClick={() => setSelectedStatus(f.value)}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-xs font-bold transition-colors border-2 ${
                  active
                    ? "bg-emerald-500 text-white border-emerald-500"
                    : "border-[#F2F2F2] bg-white text-slate-600 hover:bg-[#FAFAFA]"
                }`}
              >
                {f.label}
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                    active
                      ? "bg-white/20 text-white"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {f.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── Erreurs ─── */}
      {(error || connectionError) && (
        <div
          data-actor-card
          role="alert"
          className="rounded-xl border-2 border-[#F2F2F2] bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-700"
        >
          {error || connectionError}
        </div>
      )}

      {/* ─── Grille des cartes ─── */}
      {isLoading ? (
        <div data-actor-card className="rounded-xl border-2 border-[#F2F2F2] bg-white py-16 text-center text-sm font-semibold text-slate-500">
          Chargement de vos demandes...
        </div>
      ) : filteredInterests.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredInterests.map((item) => {
            const isPending = item.status === "PENDING";
            const isAccepted = item.status === "ACCEPTED";
            const targetCompany =
              activeTab === "received"
                ? item.senderCompany
                : item.receiverCompany;

            return (
              <article
                key={item.id}
                className="bg-white rounded-xl border-2 border-[#F2F2F2] p-5 transition-colors hover:border-emerald-500 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {/* En-tête : Logo + Nom + Statut */}
                  <div className="flex items-center justify-between gap-3">
                    <Link
                      href={`/acteur/entreprises/${targetCompany.id}`}
                      title={`Voir le profil de ${targetCompany.companyName}`}
                      className="flex items-center gap-3 min-w-0 group"
                    >
                      {targetCompany.user?.avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={targetCompany.user.avatarUrl}
                          alt={`Photo de ${targetCompany.companyName}`}
                          className="w-10 h-10 rounded-full object-cover shrink-0 ring-2 ring-[#F2F2F2]"
                        />
                      ) : (
                        <div
                          aria-label={`Photo non disponible pour ${targetCompany.companyName}`}
                          className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 shrink-0 flex items-center justify-center text-sm font-bold ring-2 ring-[#F2F2F2]"
                        >
                          {targetCompany.companyName
                            .trim()
                            .charAt(0)
                            .toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0">
                        <h3 className="text-sm font-bold text-slate-900 truncate group-hover:text-emerald-600 group-hover:underline">
                          {targetCompany.companyName}
                        </h3>
                        <p className="text-[11px] text-slate-400 truncate">
                          {targetCompany.sector}
                        </p>
                      </div>
                    </Link>

                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-tight shrink-0 border-2 ${
                        isPending
                          ? "bg-amber-50 text-amber-700 border-[#F2F2F2]"
                          : isAccepted
                            ? "bg-emerald-50 text-emerald-700 border-emerald-500"
                            : "bg-rose-50 text-rose-700 border-[#F2F2F2]"
                      }`}
                    >
                      {isPending
                        ? "En attente"
                        : isAccepted
                          ? "Acceptée"
                          : "Refusée"}
                    </span>
                  </div>

                  {/* Ligne unique : Catégorie · Date */}
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11px]">
                    <span className="inline-flex items-center gap-1 text-slate-500">
                      <Tag className="w-3 h-3 text-slate-400" />
                      {item.announcement?.category}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="inline-flex items-center gap-1 text-slate-400">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {new Date(item.createdAt).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>

                  {/* Titre + message */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 line-clamp-1">
                      {item.announcement?.title}
                    </h4>
                    {item.message && (
                      <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed bg-[#FAFAFA] p-2.5 rounded-xl border-2 border-[#F2F2F2]">
                        "{item.message}"
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-4 mt-4 border-t-2 border-[#F2F2F2] flex items-center gap-2">
                  {activeTab === "received" && isPending ? (
                    <>
                      <button
                        onClick={() => handleResponse(item.id, "reject")}
                        className="flex-1 py-2.5 px-3 rounded-full border-2 border-[#F2F2F2] text-slate-500 hover:bg-[#FAFAFA] text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Refuser</span>
                      </button>

                      <button
                        onClick={() => handleResponse(item.id, "accept")}
                        className="flex-1 py-2.5 px-3 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Accepter</span>
                      </button>
                    </>
                  ) : isAccepted ? (
                    <Link
                      href="/acteur/messages"
                      className="w-full py-2.5 px-4 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition-colors flex items-center justify-center gap-2"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Ouvrir la discussion</span>
                    </Link>
                  ) : (
                    <div className="w-full py-2 text-center text-xs font-semibold text-slate-400 italic">
                      Demande archivée
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div data-actor-card className="rounded-xl border-2 border-dashed border-[#F2F2F2] bg-white p-12 text-center space-y-3">
          <Info className="w-8 h-8 text-slate-300 mx-auto" />
          <p className="text-xs font-bold text-slate-500">
            Aucune demande de mise en relation correspondant aux critères.
          </p>
        </div>
      )}
    </div>
  );
}
