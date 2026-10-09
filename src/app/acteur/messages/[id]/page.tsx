"use client";

import { use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Phone,
  Video,
  MoreVertical,
  Paperclip,
  Send,
} from "lucide-react";

export default function ConversationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  return (
    <div className="space-y-4">
      {/* Retour */}
      <Link
        href="/acteur/messages"
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-emerald-600 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour aux messages
      </Link>

      {/* En-tête conversation */}
      <div className="bg-white rounded-3xl border border-slate-100 p-4 shadow-[0_4px_25px_-4px_rgba(15,23,42,0.06)] flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white font-bold text-sm">
            AB
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900">
              AgriBio Madagascar
            </p>
            <p className="text-[10px] text-emerald-600 font-semibold">
              En ligne
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition">
            <Phone className="w-4 h-4" />
          </button>
          <button className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition">
            <Video className="w-4 h-4" />
          </button>
          <button className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition">
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-[0_4px_25px_-4px_rgba(15,23,42,0.06)] min-h-[400px] flex flex-col gap-4">
        {/* Message reçu */}
        <div className="flex gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
            AB
          </div>
          <div className="bg-slate-50 rounded-2xl rounded-tl-sm px-4 py-3 max-w-md">
            <p className="text-xs text-slate-700 leading-relaxed">
              Bonjour, je souhaiterais discuter du partenariat pour la
              transformation de thé. Êtes-vous disponible cette semaine ?
            </p>
            <p className="text-[10px] text-slate-400 mt-1">Il y a 2h</p>
          </div>
        </div>

        {/* Message envoyé */}
        <div className="flex gap-3 flex-row-reverse">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
            TM
          </div>
          <div className="bg-emerald-600 rounded-2xl rounded-tr-sm px-4 py-3 max-w-md">
            <p className="text-xs text-white leading-relaxed">
              Bonjour, oui je suis disponible. Proposons-nous un rendez-vous
              visio jeudi à 14h ?
            </p>
            <p className="text-[10px] text-emerald-100 mt-1">Il y a 1h</p>
          </div>
        </div>
      </div>

      {/* Champ de saisie */}
      <div className="bg-white rounded-3xl border border-slate-100 p-3 shadow-[0_4px_25px_-4px_rgba(15,23,42,0.06)] flex items-center gap-2">
        <button className="w-10 h-10 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500 transition">
          <Paperclip className="w-4 h-4" />
        </button>
        <input
          type="text"
          placeholder="Écrivez votre message..."
          className="flex-1 bg-transparent text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none px-2"
        />
        <button className="w-10 h-10 rounded-full bg-emerald-600 hover:bg-emerald-700 flex items-center justify-center text-white transition">
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}