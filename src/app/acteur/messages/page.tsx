"use client";

import { useState } from "react";
import {
  Search,
  ChevronDown,
  Phone,
  MoreHorizontal,
  Mic,
  Image as ImageIcon,
  Plus,
  Send,
  Video,
  Check,
  CheckCheck,
  Play,
  Smile,
} from "lucide-react";

interface Conversation {
  id: number;
  company: string;
  role: string;
  lastMessage: string;
  timeAgo: string;
  unread: number;
  isOnline: boolean;
  isFavorite: boolean;
  status: "Actif" | "En pause";
  avatar?: string;
  initials?: string;
  avatarColor?: string;
  messages: {
    id: number;
    text?: string;
    time: string;
    isMine: boolean;
    isRead?: boolean;
    type?: "text" | "audio" | "image" | "emoji";
    audioDuration?: string;
  }[];
}

export default function MessagesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedConversationId, setSelectedConversationId] = useState(1);
  const [messageInput, setMessageInput] = useState("");

  const conversations: Conversation[] = [
    {
      id: 1,
      company: "Justin Rhiel Madsen",
      role: "Producteur certifié | Thé",
      lastMessage: "Could you check the monthly report?",
      timeAgo: "4:27 PM",
      unread: 0,
      isOnline: true,
      isFavorite: true,
      status: "Actif",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
      messages: [
        {
          id: 1,
          text: "Hey, do you have a minute to check the monthly report?",
          time: "4:27 PM",
          isMine: true,
          isRead: true,
        },
        {
          id: 2,
          text: "Sure. Is there something specific I should look at?",
          time: "4:29 PM",
          isMine: false,
        },
        {
          id: 3,
          time: "4:29 PM",
          isMine: true,
          type: "audio",
          audioDuration: "00:28",
          isRead: true,
        },
        {
          id: 4,
          text: "That makes sense. Can you fix it before the 3 p.m. meeting?",
          time: "1:43 PM",
          isMine: true,
          isRead: true,
        },
        {
          id: 5,
          time: "2:01 PM",
          isMine: false,
          type: "emoji",
        },
      ],
    },
    {
      id: 2,
      company: "Alfonso Bator",
      role: "Négoce & Export",
      lastMessage: "Got it, I'll check and get back to you",
      timeAgo: "5:13 PM",
      unread: 0,
      isOnline: false,
      isFavorite: true,
      status: "Actif",
      avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&q=80",
      messages: [
        {
          id: 1,
          text: "Got it, I'll check and get back to you.",
          time: "5:13 PM",
          isMine: false,
        },
      ],
    },
    {
      id: 3,
      company: "Charlie Rhiel Madsen",
      role: "Artisanat & Création",
      lastMessage: "Are we still on for today?",
      timeAgo: "3:00 PM",
      unread: 2,
      isOnline: false,
      isFavorite: true,
      status: "Actif",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80",
      messages: [
        {
          id: 1,
          text: "Are we still on for today?",
          time: "3:00 PM",
          isMine: false,
        },
      ],
    },
    {
      id: 4,
      company: "Kianna Gouse",
      role: "Industrie",
      lastMessage: "Sent the file, please take a look",
      timeAgo: "2:58 PM",
      unread: 0,
      isOnline: false,
      isFavorite: true,
      status: "Actif",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80",
      messages: [
        {
          id: 1,
          text: "Sent the file, please take a look.",
          time: "2:58 PM",
          isMine: false,
        },
      ],
    },
    {
      id: 5,
      company: "Angel Mango",
      role: "Tourisme",
      lastMessage: "Thanks, that works for me",
      timeAgo: "12:00 AM",
      unread: 0,
      isOnline: false,
      isFavorite: true,
      status: "Actif",
      initials: "AM",
      avatarColor: "from-violet-500 to-purple-700",
      messages: [
        {
          id: 1,
          text: "Thanks, that works for me.",
          time: "12:00 AM",
          isMine: false,
        },
      ],
    },
    {
      id: 6,
      company: "Figma",
      role: "Outil de design",
      lastMessage: "The latest design system up",
      timeAgo: "8:30 AM",
      unread: 0,
      isOnline: false,
      isFavorite: false,
      status: "Actif",
      initials: "Fi",
      avatarColor: "from-pink-500 to-rose-700",
      messages: [
        {
          id: 1,
          text: "The latest design system is up.",
          time: "8:30 AM",
          isMine: false,
        },
      ],
    },
    {
      id: 7,
      company: "Ann Ekstrom Bothman",
      role: "Commerce",
      lastMessage: "Can you confirm the details?",
      timeAgo: "Mon",
      unread: 0,
      isOnline: false,
      isFavorite: false,
      status: "Actif",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
      messages: [
        {
          id: 1,
          text: "Can you confirm the details?",
          time: "Mon",
          isMine: false,
        },
      ],
    },
    {
      id: 8,
      company: "Alfonso Bator",
      role: "Tech",
      lastMessage: "New model updates are now available",
      timeAgo: "Sat",
      unread: 0,
      isOnline: false,
      isFavorite: false,
      status: "Actif",
      initials: "AB",
      avatarColor: "from-amber-500 to-orange-700",
      messages: [
        {
          id: 1,
          text: "New model updates are now available.",
          time: "Sat",
          isMine: false,
        },
      ],
    },
  ];

  const selectedConversation = conversations.find(
    (c) => c.id === selectedConversationId
  );

  const favorites = conversations.filter((c) => c.isFavorite);
  const others = conversations.filter((c) => !c.isFavorite);

  const getInitials = (name: string) =>
    name
      .split(" ")
      .slice(0, 2)
      .map((w) => w[0])
      .join("")
      .toUpperCase();

  const renderAvatar = (conv: Conversation, size = "w-10 h-10") => {
    if (conv.avatar) {
      return (
        <img
          alt={conv.company}
          className={`${size} rounded-full object-cover shrink-0`}
          src={conv.avatar}
        />
      );
    }
    return (
      <div
        className={`${size} rounded-full bg-gradient-to-br ${
          conv.avatarColor || "from-emerald-500 to-emerald-700"
        } flex items-center justify-center text-white text-xs font-bold shrink-0`}
      >
        {conv.initials || getInitials(conv.company)}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[calc(100vh-160px)] min-h-[640px]">
      {/* ═══════════════════════════════════════════════
          COLONNE GAUCHE : Liste des conversations
          ═══════════════════════════════════════════════ */}
      <aside className="lg:col-span-4 xl:col-span-3 bg-white rounded-3xl border border-slate-100 shadow-[0_8px_30px_-10px_rgba(15,23,42,0.08)] flex flex-col overflow-hidden">
        {/* En-tête : Relay Chat + Recherche */}
        <div className="p-4 space-y-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-md">
              RC
            </div>
            <h1 className="text-lg font-extrabold text-slate-900 tracking-tight">
              Relay Chat
            </h1>
          </div>

          <div className="relative">
            <Search
              className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400"
              strokeWidth={2.2}
            />
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-12 py-2.5 rounded-xl bg-slate-50 border border-transparent text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-violet-300 focus:ring-2 focus:ring-violet-500/20 transition"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 bg-white border border-slate-200 rounded-md px-1.5 py-0.5">
              ⌘ F
            </span>
          </div>
        </div>

        {/* Liste scrollable */}
        <div className="flex-1 overflow-y-auto px-2">
          {/* Section Favorites */}
          <div className="mb-2">
            <p className="px-2 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Favorite
            </p>
            <div className="space-y-0.5">
              {favorites.map((conv) => {
                const isSelected = conv.id === selectedConversationId;
                return (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedConversationId(conv.id)}
                    className={`w-full text-left px-3 py-2.5 rounded-2xl transition-all flex items-start gap-3 ${
                      isSelected
                        ? "bg-slate-100/70"
                        : "hover:bg-slate-50"
                    }`}
                  >
                    <div className="relative shrink-0">
                      {renderAvatar(conv)}
                      {conv.isOnline && (
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-0.5">
                        <h3 className="text-sm font-bold text-slate-900 truncate">
                          {conv.company}
                        </h3>
                        <span className="text-[10px] text-slate-400 font-medium shrink-0">
                          {conv.timeAgo}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate">
                        {conv.lastMessage}
                      </p>
                    </div>

                    {conv.unread > 0 && (
                      <span className="min-w-[18px] h-[18px] px-1 bg-violet-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center shrink-0 mt-1">
                        {conv.unread}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section Other */}
          <div>
            <p className="px-2 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Other
            </p>
            <div className="space-y-0.5">
              {others.map((conv) => {
                const isSelected = conv.id === selectedConversationId;
                return (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedConversationId(conv.id)}
                    className={`w-full text-left px-3 py-2.5 rounded-2xl transition-all flex items-start gap-3 ${
                      isSelected
                        ? "bg-slate-100/70"
                        : "hover:bg-slate-50"
                    }`}
                  >
                    <div className="relative shrink-0">
                      {renderAvatar(conv)}
                      {conv.isOnline && (
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-0.5">
                        <h3 className="text-sm font-bold text-slate-900 truncate">
                          {conv.company}
                        </h3>
                        <span className="text-[10px] text-slate-400 font-medium shrink-0">
                          {conv.timeAgo}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate">
                        {conv.lastMessage}
                      </p>
                    </div>

                    {conv.unread > 0 && (
                      <span className="min-w-[18px] h-[18px] px-1 bg-violet-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center shrink-0 mt-1">
                        {conv.unread}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Promotion en bas */}
        <div className="p-4 shrink-0 border-t border-slate-100">
          <div className="bg-gradient-to-br from-violet-50 to-indigo-50 rounded-2xl p-4 border border-violet-100">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <p className="text-sm font-extrabold text-slate-900 mb-1">
                  Boost with PRO
                </p>
                <p className="text-[11px] text-slate-500 leading-snug">
                  Unlock advanced features and unlimited messaging
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shrink-0">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  viewBox="0 0 24 24"
                >
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                </svg>
              </div>
            </div>
            <button className="w-full mt-3 px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white text-xs font-bold shadow-md shadow-violet-600/20 transition">
              Upgrade Now
            </button>
          </div>
        </div>
      </aside>

      {/* ═══════════════════════════════════════════════
          COLONNE DROITE : Conversation
          ═══════════════════════════════════════════════ */}
      <div className="lg:col-span-8 xl:col-span-9 bg-white rounded-3xl border border-slate-100 shadow-[0_8px_30px_-10px_rgba(15,23,42,0.08)] flex flex-col overflow-hidden">
        {selectedConversation ? (
          <>
            {/* En-tête */}
            <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between gap-3 shrink-0">
              <div className="flex-1 text-center">
                <h2 className="text-sm font-bold text-slate-900">
                  {selectedConversation.company}
                </h2>
                <p
                  className={`text-[11px] font-semibold ${
                    selectedConversation.isOnline
                      ? "text-emerald-600"
                      : "text-slate-400"
                  }`}
                >
                  {selectedConversation.isOnline ? "Online" : "Offline"}
                </p>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  aria-label="Appeler"
                  className="w-9 h-9 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500 transition"
                >
                  <Phone className="w-4 h-4" strokeWidth={2} />
                </button>
                <button
                  aria-label="Plus"
                  className="w-9 h-9 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500 transition"
                >
                  <MoreHorizontal className="w-4 h-4" strokeWidth={2} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-5 py-6 space-y-4 bg-white">
              {/* Séparateur date */}
              <div className="flex items-center justify-center">
                <span className="text-[10px] font-semibold text-slate-400 bg-slate-50 rounded-full px-3 py-1">
                  14 May
                </span>
              </div>

              {selectedConversation.messages.map((msg, idx) => {
                const showDateSeparator =
                  idx === 3 && selectedConversation.messages.length > 4;

                return (
                  <div key={msg.id}>
                    {showDateSeparator && (
                      <div className="flex items-center justify-center my-4">
                        <span className="text-[10px] font-semibold text-slate-400 bg-slate-50 rounded-full px-3 py-1">
                          15 May
                        </span>
                      </div>
                    )}

                    <div
                      className={`flex ${
                        msg.isMine ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[70%] flex flex-col ${
                          msg.isMine ? "items-end" : "items-start"
                        }`}
                      >
                        {/* Bulle texte */}
                        {msg.type === "audio" ? (
                          <div className="flex items-center gap-3 bg-violet-100 text-slate-700 rounded-2xl px-4 py-3 shadow-sm min-w-[200px]">
                            <button className="w-8 h-8 rounded-full bg-violet-600 hover:bg-violet-700 text-white flex items-center justify-center shrink-0 transition">
                              <Play className="w-3.5 h-3.5" fill="currentColor" />
                            </button>
                            <div className="flex-1 flex items-center gap-0.5">
                              {[...Array(28)].map((_, i) => (
                                <span
                                  key={i}
                                  className="w-0.5 bg-violet-600 rounded-full"
                                  style={{
                                    height: `${Math.random() * 16 + 4}px`,
                                  }}
                                />
                              ))}
                            </div>
                            <span className="text-[10px] font-bold text-violet-700 shrink-0">
                              {msg.audioDuration}
                            </span>
                          </div>
                        ) : msg.type === "emoji" ? (
                          <div className="text-4xl">👨‍🍳</div>
                        ) : (
                          <div
                            className={`px-4 py-2.5 rounded-2xl shadow-sm ${
                              msg.isMine
                                ? "bg-violet-100 text-slate-800 rounded-br-md"
                                : "bg-slate-100 text-slate-700 rounded-bl-md"
                            }`}
                          >
                            <p className="text-sm leading-relaxed">
                              {msg.text}
                            </p>
                          </div>
                        )}

                        {/* Timestamp + statut */}
                        {msg.type !== "emoji" && (
                          <div
                            className={`flex items-center gap-1 mt-1 px-1 ${
                              msg.isMine ? "flex-row-reverse" : ""
                            }`}
                          >
                            <span className="text-[10px] text-slate-400 font-medium">
                              {msg.time}
                            </span>
                            {msg.isMine && (
                              <>
                                {msg.isRead ? (
                                  <CheckCheck
                                    className="w-3 h-3 text-violet-500"
                                    strokeWidth={2.5}
                                  />
                                ) : (
                                  <Check
                                    className="w-3 h-3 text-slate-400"
                                    strokeWidth={2.5}
                                  />
                                )}
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Zone de saisie */}
            <div className="px-4 py-3 border-t border-slate-100 bg-white shrink-0">
              <div className="flex items-center gap-2 bg-slate-50 rounded-2xl border border-transparent focus-within:border-violet-300 focus-within:bg-white focus-within:ring-2 focus-within:ring-violet-500/20 transition px-2 py-2">
                <button
                  aria-label="Joindre"
                  className="w-9 h-9 rounded-full hover:bg-white flex items-center justify-center text-slate-500 transition shrink-0"
                >
                  <Plus className="w-4.5 h-4.5" strokeWidth={2.2} />
                </button>

                <input
                  type="text"
                  placeholder="Message..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  className="flex-1 bg-transparent text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none py-1.5"
                />

                <button
                  aria-label="Emoji"
                  className="w-9 h-9 rounded-full hover:bg-white flex items-center justify-center text-slate-500 transition shrink-0"
                >
                  <Smile className="w-4.5 h-4.5" strokeWidth={2} />
                </button>

                <button
                  aria-label="Image"
                  className="w-9 h-9 rounded-full hover:bg-white flex items-center justify-center text-slate-500 transition shrink-0"
                >
                  <ImageIcon className="w-4.5 h-4.5" strokeWidth={2} />
                </button>

                <button
                  aria-label="Envoyer"
                  className="w-9 h-9 rounded-full bg-violet-600 hover:bg-violet-700 flex items-center justify-center text-white transition shrink-0 shadow-md shadow-violet-600/30"
                >
                  <Mic className="w-4.5 h-4.5" strokeWidth={2.2} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center p-12">
            <p className="text-sm text-slate-400">Sélectionnez une conversation</p>
          </div>
        )}
      </div>
    </div>
  );
}