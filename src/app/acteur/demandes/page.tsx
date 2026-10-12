"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  Check,
  X,
  Clock,
  Building2,
  MessageSquare,
  Loader2,
  Inbox,
  Send,
  AlertCircle,
  Search,
  ChevronDown,
} from "lucide-react";
import { getApiRoot } from "../../lib/auth";

export interface InterestItem {
  id: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  createdAt: string;
  message?: string;
  senderCompany: {
    id: string;
    companyName: string;
    logoUrl?: string;
    sector?: string;
    phone?: string;
  };
  receiverCompany: {
    id: string;
    companyName: string;
  };
  announcement: {
    id: string;
    title: string;
    category?: string;
  };
}

export default function DemandesPage() {
  const [activeTab, setActiveTab] = useState<"received" | "sent">("received");
  const [interests, setInterests] = useState<InterestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Barre de recherche et filtre classique
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("ALL");

  const fetchInterests = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const endpoint =
        activeTab === "received" ? "/interests/received" : "/interests/sent";
      const res = await fetch(`${getApiRoot()}${endpoint}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error(
          "Impossible de charger les demandes de mise en relation.",
        );
      }

      const data = await res.json();
      setInterests(data);
    } catch (err: any) {
      console.error("Erreur chargement intérêts :", err);
      setError(err.message || "Erreur de connexion au serveur.");
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchInterests();
  }, [fetchInterests]);

  const handleResponse = async (
    interestId: string,
    action: "accept" | "reject",
  ) => {
    try {
      setActionLoadingId(interestId);
      const res = await fetch(
        `${getApiRoot()}/interests/${interestId}/${action}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        },
      );

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(
          errData.message || "Erreur lors du traitement de la demande.",
        );
      }

      setInterests((prev) =>
        prev.map((item) =>
          item.id === interestId
            ? { ...item, status: action === "accept" ? "ACCEPTED" : "REJECTED" }
            : item,
        ),
      );
    } catch (err: any) {
      alert(err.message || "Une erreur est survenue.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const filteredInterests = useMemo(() => {
    return interests.filter((item) => {
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
  }, [interests, searchQuery, selectedStatus, activeTab]);

  return (
    <div className="space-y-6 pt-4 max-w-5xl mx-auto px-4 sm:px-6 pb-12">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-xs">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-slate-900">
            Gestion des Mises en Relation B2B
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Suivez les manifestations d'intérêt reçues sur vos annonces et
            celles que vous avez envoyées.
          </p>
        </div>

        {/* Onglets Reçues / Envoyées */}
        <div className="flex items-center gap-1 bg-slate-100 p-1.5 rounded-2xl border border-slate-200/60">
          <button
            onClick={() => setActiveTab("received")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === "received"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Inbox className="w-3.5 h-3.5" />
            <span>Reçues</span>
          </button>

          <button
            onClick={() => setActiveTab("sent")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === "sent"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>Envoyées</span>
          </button>
        </div>
      </div>

      {/* Barre de recherche classique + Filtre par statut */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search
            className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400"
            strokeWidth={2.2}
          />
          <input
            type="text"
            placeholder="Rechercher par entreprise ou titre d'annonce..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-full bg-white border border-slate-200 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition shadow-xs"
          />
        </div>

        <div className="relative">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="pl-4 pr-9 py-3 rounded-full bg-white border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 appearance-none cursor-pointer transition shadow-xs"
          >
            <option value="ALL">Tous les statuts</option>
            <option value="PENDING">En attente</option>
            <option value="ACCEPTED">Acceptée</option>
            <option value="REJECTED">Refusée</option>
          </select>
          <ChevronDown
            className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400"
            strokeWidth={2.5}
          />
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Liste des demandes */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
          <p className="text-xs font-medium text-slate-500">
            Chargement des demandes...
          </p>
        </div>
      ) : filteredInterests.length > 0 ? (
        <div className="space-y-4">
          {filteredInterests.map((item) => {
            const isPending = item.status === "PENDING";
            const isAccepted = item.status === "ACCEPTED";
            const isActionLoading = actionLoadingId === item.id;
            const targetCompany =
              activeTab === "received"
                ? item.senderCompany
                : item.receiverCompany;

            return (
              <article
                key={item.id}
                className="bg-white border border-slate-100 p-5 rounded-[24px] shadow-[0_4px_20px_-8px_rgba(15,23,42,0.06)] hover:shadow-md hover:border-emerald-200 transition space-y-4"
              >
                {/* En-tête de carte */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={
                        targetCompany?.logoUrl ||
                        "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&q=80"
                      }
                      alt={targetCompany?.companyName || "Entreprise"}
                      className="w-11 h-11 rounded-full object-cover ring-2 ring-white shadow-xs shrink-0"
                    />
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-slate-900 truncate">
                        {targetCompany?.companyName || "Entreprise partenaire"}
                      </h3>
                      <p className="text-xs text-slate-500 truncate">
                        {targetCompany?.sector || "Secteur non spécifié"}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide shrink-0 ${
                      isPending
                        ? "bg-amber-50 text-amber-700 border border-amber-200"
                        : isAccepted
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-rose-50 text-rose-700 border border-rose-200"
                    }`}
                  >
                    {isPending
                      ? "En attente"
                      : isAccepted
                        ? "Acceptée"
                        : "Refusée"}
                  </span>
                </div>

                {/* Détails de l'annonce */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-emerald-700">
                    Annonce concernée :
                  </span>
                  <p className="text-xs font-bold text-slate-900">
                    {item.announcement?.title}
                  </p>
                  {item.message && (
                    <p className="text-xs text-slate-600 italic pt-1 border-t border-slate-200/60">
                      "{item.message}"
                    </p>
                  )}
                </div>

                {/* Pied / Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <span className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                    <Clock className="w-3 h-3 text-emerald-600" />
                    {new Date(item.createdAt).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>

                  {activeTab === "received" && isPending ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleResponse(item.id, "reject")}
                        disabled={isActionLoading}
                        className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold border border-rose-200 transition flex items-center gap-1.5 disabled:opacity-50"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Refuser</span>
                      </button>

                      <button
                        onClick={() => handleResponse(item.id, "accept")}
                        disabled={isActionLoading}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-emerald-600/20 disabled:opacity-50"
                      >
                        {isActionLoading ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Check className="w-3.5 h-3.5" />
                        )}
                        <span>Accepter</span>
                      </button>
                    </div>
                  ) : isAccepted ? (
                    <Link
                      href={`/acteur/messages`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 hover:bg-emerald-100 transition"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Ouvrir la discussion</span>
                    </Link>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center shadow-xs space-y-3">
          <p className="text-slate-500 text-xs font-semibold">
            {activeTab === "received"
              ? "Aucune demande de mise en relation reçue pour le moment."
              : "Vous n'avez envoyé aucune manifestation d'intérêt pour le moment."}
          </p>
          <Link
            href="/acteur/opportunites"
            className="inline-block text-xs font-bold text-emerald-600 hover:underline"
          >
            Explorer les opportunités →
          </Link>
        </div>
      )}
    </div>
  );
}
