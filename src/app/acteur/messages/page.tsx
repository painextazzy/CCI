"use client";

import { useState } from "react";
import {
  Search,
  ChevronDown,
  Info,
  X,
  Phone,
  Mail,
  Calendar,
  MapPin,
  Paperclip,
  Send,
  MessageSquare,
  FileText,
  Play,
  Check,
  CheckCheck,
} from "lucide-react";

interface Conversation {
  id: number;
  name: string;
  role: string;
  lastMessage: string;
  timeAgo: string;
  unread: number;
  isOnline: boolean;
  isRead: boolean;
  avatar: string;
  messages: {
    id: number;
    sender: string;
    text: string;
    time: string;
    isMine: boolean;
    isRead?: boolean;
    isDocument?: boolean;
    documentName?: string;
  }[];
}

interface ProfileData {
  name: string;
  location: string;
  role: string;
  phone: string;
  email: string;
  birthday: string;
}

export default function MessagesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedConversationId, setSelectedConversationId] = useState(1);
  const [showProfile, setShowProfile] = useState(true);
  const [activeFilter, setActiveFilter] = useState<"ALL" | "READ" | "UNREAD">(
    "ALL"
  );

  const conversations: Conversation[] = [
    {
      id: 1,
      name: "Regina Polyakova",
      role: "Designer",
      lastMessage:
        "Oh, there is such a bunch of emails. I just can not find yours among...",
      timeAgo: "10:25 am",
      unread: 0,
      isOnline: true,
      isRead: true,
      avatar:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
      messages: [
        {
          id: 1,
          sender: "Regina Polyakova",
          text: "Hello! Have you already prepared financial statements for the last month? I can't find it anywhere. Tomorrow it will be necessary to print all the documents and hand them over to the customer at the meeting.",
          time: "Friday 09:45 am",
          isMine: false,
        },
        {
          id: 2,
          sender: "Andrey Popov",
          text: "Hi, of course I've made it! I sent you all the documents two days ago by email. This is what happens when you do not read messages for several days :) But it's ok, here you go, don't lose them.",
          time: "Friday 10:11 am",
          isMine: true,
          isRead: true,
        },
        {
          id: 3,
          sender: "Andrey Popov",
          text: "mytask.doc",
          time: "Friday 10:11 am",
          isMine: true,
          isDocument: true,
          documentName: "mytask.doc",
        },
        {
          id: 4,
          sender: "Regina Polyakova",
          text: "Oh, there is such a bunch of emails. I just can not find yours among the other. I promise not to lose your letters anymore. See you at the meeting tomorrow!",
          time: "Friday 10:25 am",
          isMine: false,
        },
      ],
    },
    {
      id: 2,
      name: "Oleg Shatrava",
      role: "Manager",
      lastMessage: "Is the date of the general meeting already known?",
      timeAgo: "11:45 am",
      unread: 3,
      isOnline: false,
      isRead: false,
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
      messages: [
        {
          id: 1,
          sender: "Oleg Shatrava",
          text: "Is the date of the general meeting already known?",
          time: "11:45 am",
          isMine: false,
        },
      ],
    },
    {
      id: 3,
      name: "Yakov Shubin",
      role: "Art Director",
      lastMessage:
        "I came up with this idea after visiting an art exhibition...",
      timeAgo: "09:55 am",
      unread: 1,
      isOnline: false,
      isRead: false,
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80",
      messages: [
        {
          id: 1,
          sender: "Yakov Shubin",
          text: "I came up with this idea after visiting an art exhibition...",
          time: "09:55 am",
          isMine: false,
        },
      ],
    },
    {
      id: 4,
      name: "Gleb Tarasov",
      role: "Developer",
      lastMessage: "Try to think over the chronology of the events again",
      timeAgo: "09:45 am",
      unread: 0,
      isOnline: false,
      isRead: true,
      avatar:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
      messages: [
        {
          id: 1,
          sender: "Gleb Tarasov",
          text: "Try to think over the chronology of the events again",
          time: "09:45 am",
          isMine: false,
        },
      ],
    },
    {
      id: 5,
      name: "Albert Konovalov",
      role: "Product Manager",
      lastMessage:
        "Wow, I definitely like it! Check your schedule and ring me back",
      timeAgo: "Yesterday 11:20 am",
      unread: 0,
      isOnline: false,
      isRead: true,
      avatar:
        "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&q=80",
      messages: [
        {
          id: 1,
          sender: "Albert Konovalov",
          text: "Wow, I definitely like it! Check your schedule and ring me back",
          time: "Yesterday 11:20 am",
          isMine: false,
        },
      ],
    },
    {
      id: 6,
      name: "Vetta Tihonova",
      role: "Marketing",
      lastMessage:
        "We need to consult three things in our actions tomorrow",
      timeAgo: "Yesterday 08:00 am",
      unread: 0,
      isOnline: false,
      isRead: true,
      avatar:
        "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80",
      messages: [
        {
          id: 1,
          sender: "Vetta Tihonova",
          text: "We need to consult three things in our actions tomorrow",
          time: "Yesterday 08:00 am",
          isMine: false,
        },
      ],
    },
  ];

  const profileData: ProfileData = {
    name: "Regina Polyakova",
    location: "Russia, Saint-Petersburg",
    role: "Designer",
    phone: "+1 812 546 28 53",
    email: "regina@apptech.ru",
    birthday: "26.07.1995",
  };

  // Filtrage : recherche + filtre lu/non lu
  const filteredConversations = conversations.filter((conv) => {
    const matchesSearch =
      conv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase());

    let matchesFilter = true;
    if (activeFilter === "UNREAD") matchesFilter = !conv.isRead;
    else if (activeFilter === "READ") matchesFilter = conv.isRead;

    return matchesSearch && matchesFilter;
  });

  const countByFilter = (filter: string) => {
    if (filter === "ALL") return conversations.length;
    if (filter === "UNREAD")
      return conversations.filter((c) => !c.isRead).length;
    if (filter === "READ") return conversations.filter((c) => c.isRead).length;
    return 0;
  };

  const selectedConversation = conversations.find(
    (c) => c.id === selectedConversationId
  );

  return (
    <div className="fixed inset-0 top-20 bg-slate-100 flex items-center justify-center p-4 overflow-hidden">
      <div className="w-full h-full max-w-[1600px] bg-white rounded-2xl border border-slate-200 shadow-lg flex overflow-hidden">
        {/* ═══════════════════════════════════════════════
            LISTE DES CONVERSATIONS
            ═══════════════════════════════════════════════ */}
        <div className="w-[360px] border-r border-slate-200 flex flex-col bg-white shrink-0">
          {/* En-tête (sans comptage) */}
          <div className="px-5 py-4 shrink-0 border-b border-slate-100">
            <h1 className="text-lg font-extrabold text-slate-900">
              Messages
            </h1>
          </div>

          {/* Recherche */}
          <div className="px-4 py-3 shrink-0 border-b border-slate-100">
            <div className="relative">
              <Search
                className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400"
                strokeWidth={2.2}
              />
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-100 border border-transparent text-xs font-medium text-slate-800 placeholder-slate-500 focus:outline-none focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition"
              />
            </div>
          </div>

          {/* Filtres Lus / Non lus */}
          <div className="px-4 py-3 shrink-0 border-b border-slate-100 flex items-center gap-1.5">
            {[
              { label: "Tous", value: "ALL" as const },
              { label: "Non lus", value: "UNREAD" as const },
              { label: "Lus", value: "READ" as const },
            ].map((tab) => {
              const active = activeFilter === tab.value;
              return (
                <button
                  key={tab.value}
                  onClick={() => setActiveFilter(tab.value)}
                  className={`flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition ${
                    active
                      ? "bg-sky-500 text-white shadow-sm"
                      : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                  }`}
                >
                  {tab.label}
                  <span
                    className={`px-1.5 rounded-md text-[10px] ${
                      active
                        ? "bg-white/20 text-white"
                        : "bg-white text-slate-500"
                    }`}
                  >
                    {countByFilter(tab.value)}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Liste */}
          <div className="flex-1 overflow-y-auto">
            {filteredConversations.length > 0 ? (
              filteredConversations.map((conv) => {
                const isSelected = conv.id === selectedConversationId;
                return (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedConversationId(conv.id)}
                    className={`w-full text-left px-4 py-3 border-b border-slate-50 flex items-start gap-3 transition ${
                      isSelected ? "bg-sky-50/70" : "hover:bg-slate-50"
                    }`}
                  >
                    <div className="relative shrink-0">
                      <img
                        alt={conv.name}
                        className="w-11 h-11 rounded-full object-cover"
                        src={conv.avatar}
                      />
                      {conv.isOnline && (
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full ring-2 ring-white" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-0.5">
                        <h3
                          className={`text-sm truncate ${
                            !conv.isRead
                              ? "font-extrabold text-slate-900"
                              : "font-bold text-slate-800"
                          }`}
                        >
                          {conv.name}
                        </h3>
                        <span
                          className={`text-[10px] shrink-0 ${
                            !conv.isRead
                              ? "text-sky-600 font-bold"
                              : "text-slate-400"
                          }`}
                        >
                          {conv.timeAgo}
                        </span>
                      </div>
                      <p
                        className={`text-xs truncate ${
                          !conv.isRead
                            ? "text-slate-700 font-semibold"
                            : "text-slate-500"
                        }`}
                      >
                        {conv.lastMessage}
                      </p>
                    </div>

                    {conv.unread > 0 && (
                      <span className="min-w-[18px] h-[18px] px-1 bg-sky-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shrink-0 mt-1">
                        {conv.unread}
                      </span>
                    )}
                  </button>
                );
              })
            ) : (
              <div className="p-8 text-center">
                <MessageSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-400 font-medium">
                  Aucune conversation
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ═══════════════════════════════════════════════
            ZONE DE CHAT
            ═══════════════════════════════════════════════ */}
        <div className="flex-1 flex flex-col bg-slate-50 min-w-0">
          {selectedConversation ? (
            <>
              {/* En-tête */}
              <div className="px-5 py-3 bg-white border-b border-slate-200 flex items-center justify-between gap-3 shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative shrink-0">
                    <img
                      alt={selectedConversation.name}
                      className="w-10 h-10 rounded-full object-cover"
                      src={selectedConversation.avatar}
                    />
                    {selectedConversation.isOnline && (
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1">
                      <h2 className="text-sm font-bold text-slate-900 truncate">
                        {selectedConversation.name}
                      </h2>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    </div>
                    <p className="text-[10px] text-slate-500 flex items-center gap-1">
                      {selectedConversation.isOnline ? (
                        <>
                          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                          Online
                        </>
                      ) : (
                        "Vu(e) récemment"
                      )}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setShowProfile(!showProfile)}
                  aria-label="Info"
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition ${
                    showProfile
                      ? "bg-sky-100 text-sky-600"
                      : "hover:bg-slate-100 text-slate-500"
                  }`}
                >
                  <Info className="w-4 h-4" strokeWidth={2.2} />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
                <div className="flex items-center justify-center">
                  <span className="text-[11px] font-medium text-slate-400 bg-slate-100 rounded-lg px-3 py-1">
                    Today
                  </span>
                </div>

                {selectedConversation.messages.map((msg) => (
                  <div key={msg.id} className="flex flex-col gap-1">
                    <span
                      className={`text-[10px] font-bold text-slate-400 px-1 ${
                        msg.isMine ? "text-right" : "text-left"
                      }`}
                    >
                      {msg.sender}
                    </span>

                    <div
                      className={`flex gap-2 ${
                        msg.isMine ? "justify-end" : "justify-start"
                      }`}
                    >
                      {!msg.isMine && (
                        <img
                          alt={msg.sender}
                          className="w-8 h-8 rounded-full object-cover shrink-0"
                          src={selectedConversation.avatar}
                        />
                      )}

                      <div className="max-w-[70%] flex flex-col">
                        {msg.isDocument ? (
                          <div className="bg-sky-500 rounded-lg p-2.5 flex items-center gap-2.5 min-w-[180px]">
                            <div className="w-8 h-8 rounded bg-white/20 flex items-center justify-center shrink-0">
                              <FileText className="w-4 h-4 text-white" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-white truncate">
                                {msg.documentName}
                              </p>
                              <p className="text-[9px] text-sky-100">
                                Document
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div
                            className={`px-4 py-2.5 rounded-2xl ${
                              msg.isMine
                                ? "bg-sky-500 text-white"
                                : "bg-white text-slate-800 border border-slate-100"
                            }`}
                          >
                            <p className="text-xs leading-relaxed">
                              {msg.text}
                            </p>
                          </div>
                        )}

                        <div
                          className={`flex items-center gap-1 mt-1 px-1 ${
                            msg.isMine ? "justify-end" : "justify-start"
                          }`}
                        >
                          <span className="text-[9px] text-slate-400">
                            {msg.time}
                          </span>
                          {msg.isMine &&
                            (msg.isRead ? (
                              <CheckCheck
                                className="w-3 h-3 text-sky-500"
                                strokeWidth={2.5}
                              />
                            ) : (
                              <Check
                                className="w-3 h-3 text-slate-400"
                                strokeWidth={2.5}
                              />
                            ))}
                        </div>
                      </div>

                      {msg.isMine && (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                          AP
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Typing */}
                <div className="flex items-center gap-2 px-2">
                  <img
                    alt={selectedConversation.name}
                    className="w-6 h-6 rounded-full object-cover"
                    src={selectedConversation.avatar}
                  />
                  <p className="text-[10px] text-slate-400 italic">
                    {selectedConversation.name.split(" ")[0]} is typing...
                  </p>
                </div>
              </div>

              {/* Zone de saisie flottante */}
              <div className="px-6 pb-6 pt-2 shrink-0 relative">
                <div className="flex items-center gap-2 bg-white rounded-full border border-slate-200 shadow-lg hover:shadow-xl transition-shadow p-1.5 pl-5">
                  <input
                    type="text"
                    placeholder="Add commentaries..."
                    className="flex-1 bg-transparent text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none py-2"
                  />
                  <button
                    aria-label="Joindre"
                    className="w-9 h-9 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition shrink-0"
                  >
                    <Paperclip className="w-4 h-4" strokeWidth={2.2} />
                  </button>
                  <button
                    aria-label="Envoyer"
                    className="w-10 h-10 rounded-full bg-sky-500 hover:bg-sky-600 flex items-center justify-center text-white transition shrink-0 shadow-md shadow-sky-500/30"
                  >
                    <Send className="w-4 h-4" strokeWidth={2.2} />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-sm text-slate-400">
                Sélectionnez une conversation
              </p>
            </div>
          )}
        </div>

        {/* ═══════════════════════════════════════════════
            PANNEAU PROFIL (droite)
            ═══════════════════════════════════════════════ */}
        {showProfile && selectedConversation && (
          <div className="hidden xl:flex w-[320px] border-l border-slate-200 bg-white flex-col shrink-0">
            <div className="flex justify-end p-3">
              <button
                onClick={() => setShowProfile(false)}
                aria-label="Fermer"
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 transition"
              >
                <X className="w-4 h-4" strokeWidth={2.2} />
              </button>
            </div>

            <div className="flex flex-col items-center px-4 pb-4">
              <img
                alt={profileData.name}
                className="w-24 h-24 rounded-full object-cover mb-3"
                src={selectedConversation.avatar}
              />
              <h3 className="text-base font-bold text-slate-900 mb-1">
                {profileData.name}
              </h3>
              <div className="flex items-center gap-1 text-[11px] text-slate-500 mb-0.5">
                <MapPin className="w-3 h-3" />
                {profileData.location}
              </div>
              <p className="text-[11px] text-slate-400">{profileData.role}</p>
            </div>

            <div className="px-4 py-3 border-t border-slate-100 space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                  <Phone className="w-3.5 h-3.5 text-slate-500" />
                </div>
                <span className="text-xs text-slate-700">
                  {profileData.phone}
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                  <Mail className="w-3.5 h-3.5 text-slate-500" />
                </div>
                <span className="text-xs text-slate-700">
                  {profileData.email}
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                </div>
                <span className="text-xs text-slate-700">
                  {profileData.birthday}
                </span>
              </div>
            </div>

            <div className="px-4 py-3 border-t border-slate-100 flex-1 overflow-y-auto">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Attachment Files
                </h4>
                <button className="text-[10px] font-bold text-sky-500 hover:text-sky-600">
                  View all
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {[
                  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=200&q=80",
                  "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=200&q=80",
                  "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=200&q=80",
                  "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=200&q=80",
                  "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=200&q=80",
                  "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&w=200&q=80",
                ].map((src, i) => (
                  <div
                    key={i}
                    className="aspect-square rounded-lg overflow-hidden bg-slate-100 relative group cursor-pointer"
                  >
                    <img
                      src={src}
                      alt={`Attachment ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                    {i % 3 === 1 && (
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                        <Play
                          className="w-4 h-4 text-white"
                          fill="currentColor"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}