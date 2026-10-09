"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import {
  HiOutlinePlusCircle,
  HiOutlineChevronDown,
  HiOutlineBriefcase,
  HiOutlineUsers,
} from "react-icons/hi2";

// Résumé des partenaires (démo)
const partners = [
  { id: 1, name: "AgriBio Madagascar", initials: "AB", color: "from-emerald-500 to-emerald-700" },
  { id: 2, name: "Bourbon Exporters", initials: "BE", color: "from-amber-500 to-amber-700" },
  { id: 3, name: "Tsara Artisans", initials: "TA", color: "from-rose-500 to-rose-700" },
  { id: 4, name: "MecaPrecision", initials: "MP", color: "from-blue-500 to-blue-700" },
  { id: 5, name: "GreenPack Solutions", initials: "GP", color: "from-indigo-500 to-indigo-700" },
  { id: 6, name: "Ranomafana EcoTours", initials: "RE", color: "from-teal-500 to-teal-700" },
];

// Résumé des personnes dans les messages (démo)
const messagePeople = [
  { id: 1, name: "Hery R.", initials: "HR", color: "from-emerald-500 to-emerald-700", unread: 2 },
  { id: 2, name: "Vola R.", initials: "VR", color: "from-rose-500 to-rose-700", unread: 1 },
  { id: 3, name: "Tojo R.", initials: "TR", color: "from-amber-500 to-amber-700", unread: 0 },
  { id: 4, name: "Soa R.", initials: "SR", color: "from-indigo-500 to-indigo-700", unread: 0 },
  { id: 5, name: "Naivo A.", initials: "NA", color: "from-teal-500 to-teal-700", unread: 3 },
  { id: 6, name: "Fanja R.", initials: "FR", color: "from-pink-500 to-pink-700", unread: 0 },
];

export default function ActorSidebar() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const createRef = useRef<HTMLDivElement>(null);

  // Limite l'affichage à 4 éléments
  const displayedPartners = partners.slice(0, 4);
  const displayedMessages = messagePeople.slice(0, 4);

  // Ferme le dropdown si on clique en dehors
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        createRef.current &&
        !createRef.current.contains(event.target as Node)
      ) {
        setIsCreateOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <aside className="hidden lg:flex fixed top-16 left-0 h-[calc(100vh-64px)] w-[320px] bg-white border-r border-slate-200 z-40 flex-col">
      {/* Zone scrollable : Partenaires + Messages */}
      <div className="flex-1 overflow-y-auto">
        {/* Section : Partenaires (max 4) */}
        <div className="p-4 border-b border-slate-100">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[11px] uppercase tracking-wider font-bold text-slate-400">
              Partenaires
            </h3>
            <Link
              href="/acteur/partenaires"
              className="text-[10px] font-bold text-emerald-600 hover:text-emerald-700"
            >
              Voir tout
            </Link>
          </div>

          <ul className="space-y-2">
            {displayedPartners.map((p) => (
              <li key={p.id}>
                <Link
                  href={`/acteur/partenaires/${p.id}`}
                  className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-50 transition"
                >
                  <div
                    className={`w-8 h-8 rounded-full bg-gradient-to-br ${p.color} flex items-center justify-center text-white text-[10px] font-bold shrink-0`}
                  >
                    {p.initials}
                  </div>
                  <span className="text-xs font-semibold text-slate-700 truncate">
                    {p.name}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Section : Messages (max 4) */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[11px] uppercase tracking-wider font-bold text-slate-400">
              Messages
            </h3>
            <Link
              href="/acteur/messages"
              className="text-[10px] font-bold text-emerald-600 hover:text-emerald-700"
            >
              Voir tout
            </Link>
          </div>

          <ul className="space-y-2">
            {displayedMessages.map((person) => (
              <li key={person.id}>
                <Link
                  href={`/acteur/messages/${person.id}`}
                  className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-50 transition relative"
                >
                  <div
                    className={`w-8 h-8 rounded-full bg-gradient-to-br ${person.color} flex items-center justify-center text-white text-[10px] font-bold shrink-0`}
                  >
                    {person.initials}
                  </div>
                  <span className="text-xs font-semibold text-slate-700 truncate flex-1">
                    {person.name}
                  </span>
                  {person.unread > 0 && (
                    <span className="min-w-[18px] h-[18px] px-1 bg-emerald-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center shrink-0">
                      {person.unread}
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Zone fixe en bas : Bouton Faire une annonce */}
      <div className="border-t border-slate-100 p-4 shrink-0 bg-white">
        <div className="relative" ref={createRef}>
          <button
            onClick={() => setIsCreateOpen(!isCreateOpen)}
            className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl transition-all font-bold text-sm ${
              isCreateOpen
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20"
            }`}
          >
            <HiOutlinePlusCircle className="w-5 h-5" />
            Faire une annonce
            <HiOutlineChevronDown
              className={`w-4 h-4 transition-transform duration-200 ${
                isCreateOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Dropdown vers le HAUT (car le bouton est en bas) */}
          {isCreateOpen && (
            <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 text-xs text-slate-700">
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                  Créer une annonce
                </p>
              </div>

              <Link
                href="/acteur/annonces/nouvelle?type=offre"
                onClick={() => setIsCreateOpen(false)}
                className="flex items-center gap-2 px-4 py-2.5 hover:bg-slate-50 transition text-slate-700 font-medium"
              >
                <HiOutlineBriefcase className="w-4 h-4 text-slate-400" />
                Une offre
              </Link>

              <Link
                href="/acteur/annonces/nouvelle?type=partenariat"
                onClick={() => setIsCreateOpen(false)}
                className="flex items-center gap-2 px-4 py-2.5 hover:bg-slate-50 transition text-slate-700 font-medium"
              >
                <HiOutlineUsers className="w-4 h-4 text-slate-400" />
                Demande de partenariat
              </Link>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}