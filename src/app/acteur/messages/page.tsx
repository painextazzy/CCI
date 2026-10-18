"use client";

import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import type { Socket } from "socket.io-client";
import {
  ArrowLeft,
  Search,
  ChevronDown,
  Calendar,
  Paperclip,
  Send,
  MessageSquare,
  FileText,
  Play,
  Check,
  CheckCheck,
  FileSignature,
  Coins,
  ShieldCheck,
  Download,
  FileCheck,
  Plus,
  LoaderCircle,
  MoreVertical,
  Pencil,
  Trash2,
  X,
} from "lucide-react";
import { getApiRoot } from "../../lib/auth";
import { useAuth } from "../../providers/AuthProvider";
import { useInterestsNotifications } from "../../providers/InterestsNotificationsProvider";
import ContractProposalModal from "./ContractProposalModal";
import ContractReviewModal from "./ContractReviewModal";
import type { ContractDetails } from "./ContractReviewModal";

interface CompanySummary {
  id: string;
  companyName: string;
  logoUrl?: string | null;
  sector?: string;
  managerRole?: string;
  address?: string;
  phone?: string;
  user?: {
    avatarUrl?: string | null;
    email?: string;
    lastLoginAt?: string | null;
  };
}

interface InterestItem {
  id: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  createdAt: string;
  message?: string;
  senderCompany: CompanySummary;
  receiverCompany: CompanySummary;
  announcement?: { id: string; title: string; category?: string };
}

interface MessageItem {
  id: string;
  createdAt: string;
  sender: string;
  text: string;
  time: string;
  isMine: boolean;
  isRead?: boolean;
  attachmentUrl?: string | null;
  attachmentName?: string | null;
  attachmentMimeType?: string | null;
  isSystemNotification?: boolean;
  timelinePositionAt?: string | null;
  isContract?: boolean;
  contractDetails?: ContractDetails;
}

interface Conversation {
  id: string;
  interest: InterestItem;
  partner: CompanySummary;
  name: string;
  role: string;
  lastMessage: string;
  timeAgo: string;
  unread: number;
  isOnline: boolean;
  lastLoginAt: string | null;
  isRead: boolean;
  avatar: string;
  messages: MessageItem[];
}

interface ApiMessage {
  id: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  sender: CompanySummary;
  attachmentUrl?: string | null;
  attachmentName?: string | null;
  attachmentMimeType?: string | null;
  isSystemNotification?: boolean;
  timelinePositionAt?: string | null;
  acceptedContract?: {
    id: string;
    reference: string;
    status: "ACCEPTED";
    acceptedAt: string;
    receiverSignerName: string;
  } | null;
}

interface SocketAck {
  ok: boolean;
  markedReadCount?: number;
  partnerCompanyId?: string;
  partnerIsOnline?: boolean;
  partnerLastLoginAt?: string | null;
  error?: string;
}

function formatContractDate(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return value;

  const [, year, month, day] = match;
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(Number(year), Number(month) - 1, Number(day)));
}

function parseContractProposal(
  content: string,
): MessageItem["contractDetails"] {
  const lines = content.split("\n");
  const title = lines
    .find((line) => line.startsWith("Proposition de contrat : "))
    ?.slice("Proposition de contrat : ".length);
  const encodedDescription = lines
    .find((line) => line.startsWith("Description encodée : "))
    ?.slice("Description encodée : ".length);
  const descriptionLine = lines.find((line) =>
    line.startsWith("Description : "),
  );
  let description = descriptionLine?.slice("Description : ".length);
  if (encodedDescription !== undefined) {
    try {
      description = decodeURIComponent(encodedDescription);
    } catch {
      return undefined;
    }
  }
  const amount = lines
    .find((line) => line.startsWith("Montant : "))
    ?.slice("Montant : ".length)
    .replace(/\s/g, "")
    .replace(/Ar$/, "");
  const period = lines
    .find((line) => line.startsWith("Période : "))
    ?.slice("Période : ".length)
    .split(" au ");

  if (
    !title ||
    !description ||
    !amount ||
    !period ||
    period.length !== 2 ||
    !Number.isFinite(Number(amount))
  ) {
    return undefined;
  }

  return {
    title,
    description,
    amount: Number(amount),
    startDate: period[0],
    endDate: period[1],
    status: "PENDING",
  };
}

function toMessageItem(
  message: ApiMessage,
  companyId: string,
  isRead = message.isRead,
): MessageItem {
  const contractDetails = parseContractProposal(message.content);
  if (contractDetails && message.acceptedContract) {
    contractDetails.status = "ACCEPTED";
    contractDetails.signerName =
      message.acceptedContract.receiverSignerName;
    contractDetails.contractId = message.acceptedContract.id;
    contractDetails.reference = message.acceptedContract.reference;
  }
  return {
    id: message.id,
    createdAt: message.createdAt,
    sender: message.sender.companyName ?? "Système",
    text: message.content,
    time: formatMessageTime(message.createdAt),
    isMine: message.sender.id === companyId,
    isRead,
    attachmentUrl: message.attachmentUrl,
    attachmentName: message.attachmentName,
    attachmentMimeType: message.attachmentMimeType,
    isSystemNotification: message.isSystemNotification,
    timelinePositionAt: message.timelinePositionAt,
    isContract: Boolean(contractDetails),
    contractDetails,
  };
}

function getMessageTimelineTime(message: MessageItem) {
  return new Date(message.timelinePositionAt ?? message.createdAt).getTime();
}

function orderMessages(messages: MessageItem[]) {
  return [...messages].sort(
    (left, right) =>
      getMessageTimelineTime(left) - getMessageTimelineTime(right) ||
      new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime(),
  );
}

function getLastMessagePreview(messages: MessageItem[], fallback: string) {
  const lastMessage = messages.at(-1);
  if (!lastMessage) return fallback;
  return lastMessage.attachmentName
    ? `📎 ${lastMessage.attachmentName}`
    : lastMessage.text;
}

function formatMessageTime(date: string) {
  return new Date(date).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatLastLogin(date: string | null) {
  if (!date) return "Dernière connexion inconnue";
  const lastLogin = new Date(date);
  if (Number.isNaN(lastLogin.getTime())) return "Dernière connexion inconnue";

  const now = new Date();
  const today = getMessageDateKey(now);
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  let dayLabel: string;

  if (getMessageDateKey(lastLogin) === today) {
    dayLabel = "aujourd'hui";
  } else if (getMessageDateKey(lastLogin) === getMessageDateKey(yesterday)) {
    dayLabel = "hier";
  } else {
    dayLabel = lastLogin.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year:
        lastLogin.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  }

  return `Dernière connexion ${dayLabel} à ${formatMessageTime(date)}`;
}

function getMessageDateKey(date: string | Date) {
  const parsedDate = new Date(date);
  return `${parsedDate.getFullYear()}-${parsedDate.getMonth()}-${parsedDate.getDate()}`;
}

function formatMessageDate(date: string) {
  const messageDate = new Date(date);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (getMessageDateKey(date) === getMessageDateKey(today)) {
    return "Aujourd'hui";
  }
  if (getMessageDateKey(date) === getMessageDateKey(yesterday)) {
    return "Hier";
  }

  const formattedDate = messageDate.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    ...(messageDate.getFullYear() !== today.getFullYear()
      ? { year: "numeric" as const }
      : {}),
  });
  return (
    formattedDate.charAt(0).toLocaleUpperCase("fr-FR") + formattedDate.slice(1)
  );
}

function shouldShowMessageDate(
  message: MessageItem,
  previousMessage?: MessageItem,
) {
  return (
    !previousMessage ||
    getMessageDateKey(new Date(getMessageTimelineTime(message))) !==
      getMessageDateKey(new Date(getMessageTimelineTime(previousMessage)))
  );
}

export default function MessagesPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const { setActiveConversationId, decrementUnreadMessages } =
    useInterestsNotifications();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(null);
  const [showMobileChat, setShowMobileChat] = useState(false);
  const [activeFilter, setActiveFilter] = useState<"ALL" | "READ" | "UNREAD">(
    "ALL",
  );

  // Menu déroulant "+" dans la barre de saisie
  const [showPlusMenu, setShowPlusMenu] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Saisie message normal
  const [inputText, setInputText] = useState("");
  const [openMessageMenuId, setOpenMessageMenuId] = useState<string | null>(
    null,
  );
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editedMessageText, setEditedMessageText] = useState("");
  const [isSavingMessage, setIsSavingMessage] = useState(false);
  const [deletingMessageId, setDeletingMessageId] = useState<string | null>(
    null,
  );
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const [isRoomReady, setIsRoomReady] = useState(false);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const readMessageIdsRef = useRef(new Set<string>());

  // Modale de proposition de contrat (Émetteur)
  const [showContractModal, setShowContractModal] = useState(false);
  const [editingContractMessageId, setEditingContractMessageId] = useState<
    string | null
  >(null);
  const [reviewingContractMessageId, setReviewingContractMessageId] = useState<
    string | null
  >(null);
  const [isSavingContract, setIsSavingContract] = useState(false);
  const [contractTitle, setContractTitle] = useState(
    "Fourniture de produits de gros",
  );
  const [contractAmount, setContractAmount] = useState("5000000");
  const [contractStartDate, setContractStartDate] = useState("2026-11-01");
  const [contractEndDate, setContractEndDate] = useState("2027-11-01");
  const [contractDescription, setContractDescription] = useState("");

  // Modale de signature officielle & PDF (Destinataire)
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [isSigningContract, setIsSigningContract] = useState(false);
  const [selectedContractMessageId, setSelectedContractMessageId] = useState<
    string | null
  >(null);
  const [signerName, setSignerName] = useState("");

  const selectedConversation = conversations.find(
    (conversation) => conversation.id === selectedConversationId,
  );
  useEffect(() => {
    setActiveConversationId(selectedConversationId);
    return () => setActiveConversationId(null);
  }, [selectedConversationId, setActiveConversationId]);

  useEffect(() => {
    if (isAuthLoading) return;
    if (!user?.company?.id) {
      setChatError(
        "Connectez-vous avec un compte entreprise pour accéder aux messages.",
      );
      setIsLoading(false);
      return;
    }
    const companyId = user.company.id;

    let active = true;
    async function loadConversations() {
      setIsLoading(true);
      setChatError(null);
      try {
        const [receivedResponse, sentResponse] = await Promise.all([
          fetch(`${getApiRoot()}/interests/received`, {
            credentials: "include",
            cache: "no-store",
          }),
          fetch(`${getApiRoot()}/interests/sent`, {
            credentials: "include",
            cache: "no-store",
          }),
        ]);
        if (!receivedResponse.ok || !sentResponse.ok) {
          throw new Error("Impossible de charger vos conversations.");
        }

        const [received, sent] = (await Promise.all([
          receivedResponse.json(),
          sentResponse.json(),
        ])) as [InterestItem[], InterestItem[]];
        const interests = Array.from(
          new Map(
            [...received, ...sent].map(
              (interest) => [interest.id, interest] as const,
            ),
          ).values(),
        ).sort(
          (left, right) =>
            new Date(right.createdAt).getTime() -
            new Date(left.createdAt).getTime(),
        );
        const loadedConversations = interests.map((interest) => {
          const partner =
            interest.senderCompany.id === companyId
              ? interest.receiverCompany
              : interest.senderCompany;
          return {
            id: interest.id,
            interest,
            partner,
            name: partner.companyName,
            role: partner.sector || "Entreprise",
            lastMessage:
              interest.message ||
              interest.announcement?.title ||
              "Conversation ouverte",
            timeAgo: new Date(interest.createdAt).toLocaleDateString("fr-FR"),
            unread: 0,
            isOnline: false,
            lastLoginAt: partner.user?.lastLoginAt ?? null,
            isRead: true,
            avatar: partner.logoUrl || partner.user?.avatarUrl || "/logo.png",
            messages: [],
          } satisfies Conversation;
        });

        if (active) {
          setConversations(loadedConversations);
          setSelectedConversationId((current) =>
            loadedConversations.some(
              (conversation) => conversation.id === current,
            )
              ? current
              : (loadedConversations[0]?.id ?? null),
          );
        }
      } catch (cause) {
        if (active) {
          setChatError(
            cause instanceof Error
              ? cause.message
              : "Impossible de charger vos conversations.",
          );
        }
      } finally {
        if (active) setIsLoading(false);
      }
    }

    void loadConversations();
    return () => {
      active = false;
    };
  }, [isAuthLoading, user?.company?.id]);

  useEffect(() => {
    if (!selectedConversationId || !user?.company?.id) return;
    const companyId = user.company.id;
    let active = true;
    setIsLoadingMessages(true);

    async function loadHistory() {
      try {
        const response = await fetch(
          `${getApiRoot()}/messages/${selectedConversationId}`,
          { credentials: "include", cache: "no-store" },
        );
        if (!response.ok) {
          throw new Error(
            "Impossible de charger l'historique de la conversation.",
          );
        }
        const messages = (await response.json()) as ApiMessage[];
        if (!active) return;

        setConversations((current) =>
          current.map((conversation) => {
            if (conversation.id !== selectedConversationId) return conversation;
            const loaded = messages.map((message) =>
              toMessageItem(
                message,
                companyId,
                message.isRead || readMessageIdsRef.current.has(message.id),
              ),
            );
            const merged = new Map(
              [...loaded, ...conversation.messages].map(
                (message) => [message.id, message] as const,
              ),
            );
            const orderedMessages = orderMessages([...merged.values()]);
            const lastMessage = orderedMessages.at(-1);
            return {
              ...conversation,
              messages: orderedMessages,
              lastMessage: lastMessage
                ? lastMessage.attachmentName
                  ? `📎 ${lastMessage.attachmentName}`
                  : lastMessage.text
                : conversation.lastMessage,
            };
          }),
        );
      } catch (cause) {
        if (active) {
          setChatError(
            cause instanceof Error
              ? cause.message
              : "Impossible de charger les messages.",
          );
        }
      } finally {
        if (active) setIsLoadingMessages(false);
      }
    }

    void loadHistory();
    return () => {
      active = false;
    };
  }, [decrementUnreadMessages, selectedConversationId, user?.company?.id]);

  useEffect(() => {
    if (!selectedConversationId || !user?.company?.id) return;
    const socket = io(getApiRoot().replace(/\/api$/i, ""), {
      withCredentials: true,
    });
    socketRef.current = socket;
    setIsSocketConnected(false);
    setIsRoomReady(false);

    socket.on("connect", () => {
      setIsSocketConnected(true);
      socket.emit(
        "joinRoom",
        { interestId: selectedConversationId },
        (response: SocketAck) => {
          if (!response?.ok) {
            setChatError(response?.error || "Accès à la conversation refusé.");
            return;
          }
          setIsRoomReady(true);
          if (response.partnerCompanyId) {
            setConversations((current) =>
              current.map((conversation) =>
                conversation.partner.id === response.partnerCompanyId
                  ? {
                      ...conversation,
                      isOnline: response.partnerIsOnline ?? false,
                      lastLoginAt:
                        response.partnerLastLoginAt ?? conversation.lastLoginAt,
                    }
                  : conversation,
              ),
            );
          }
          if (document.visibilityState === "visible") {
            socket.emit(
              "markRead",
              { interestId: selectedConversationId },
              (readResponse: SocketAck) => {
                if (readResponse?.ok) {
                  decrementUnreadMessages(readResponse.markedReadCount ?? 0);
                }
              },
            );
          }
        },
      );
    });
    socket.on("disconnect", () => {
      setIsSocketConnected(false);
      setIsRoomReady(false);
    });
    socket.on("connect_error", () => {
      setIsSocketConnected(false);
      setIsRoomReady(false);
      setChatError("Connexion au chat en temps réel impossible.");
    });
    socket.on(
      "companyOnline",
      (presence: { companyId: string; lastLoginAt: string | null }) => {
        setConversations((current) =>
          current.map((conversation) =>
            conversation.partner.id === presence.companyId
              ? {
                  ...conversation,
                  isOnline: true,
                  lastLoginAt: presence.lastLoginAt,
                }
              : conversation,
          ),
        );
      },
    );
    socket.on(
      "companyOffline",
      (presence: { companyId: string; lastLoginAt: string | null }) => {
        setConversations((current) =>
          current.map((conversation) =>
            conversation.partner.id === presence.companyId
              ? {
                  ...conversation,
                  isOnline: false,
                  lastLoginAt: presence.lastLoginAt,
                }
              : conversation,
          ),
        );
      },
    );
    socket.on("exception", (error: { message?: string } | string) => {
      const message = typeof error === "string" ? error : error?.message;
      setChatError(
        message && !/internal server error/i.test(message)
          ? message
          : "Une erreur est survenue dans le chat. Veuillez réessayer.",
      );
    });
    socket.on("newMessage", (message: ApiMessage) => {
      const newMessage = toMessageItem(
        message,
        user.company?.id ?? "",
        message.isRead || readMessageIdsRef.current.has(message.id),
      );
      setConversations((current) =>
        current.map((conversation) => {
          if (conversation.id !== selectedConversationId) return conversation;
          if (conversation.messages.some((item) => item.id === newMessage.id)) {
            return conversation;
          }
          return {
            ...conversation,
            lastMessage: newMessage.attachmentName
              ? `📎 ${newMessage.attachmentName}`
              : newMessage.text,
            timeAgo: "À l'instant",
            messages: [...conversation.messages, newMessage],
          };
        }),
      );
      if (
        message.sender.id !== user.company?.id &&
        document.visibilityState === "visible"
      ) {
        socket.emit(
          "markRead",
          { interestId: selectedConversationId },
          (response: SocketAck) => {
            if (response?.ok) {
              decrementUnreadMessages(response.markedReadCount ?? 0);
            }
          },
        );
      }
    });
    socket.on(
      "messageUpdated",
      (update: {
        interestId: string;
        message: ApiMessage;
        notificationMessage: ApiMessage;
      }) => {
        setConversations((current) =>
          current.map((conversation) => {
            if (conversation.id !== update.interestId) return conversation;
            const messages = conversation.messages.map((item) => {
              if (item.id !== update.message.id) return item;
              const contractDetails = parseContractProposal(
                update.message.content,
              );
              return {
                ...item,
                text: update.message.content,
                time: formatMessageTime(update.message.createdAt),
                isContract: Boolean(contractDetails),
                contractDetails,
              };
            });
            const notification = toMessageItem(
              update.notificationMessage,
              user?.company?.id ?? "",
            );
            const withNotification = orderMessages(
              messages.some((item) => item.id === notification.id)
                ? messages
                : [...messages, notification],
            );
            return {
              ...conversation,
              messages: withNotification,
              lastMessage: getLastMessagePreview(
                withNotification,
                conversation.lastMessage,
              ),
            };
          }),
        );
      },
    );
    socket.on(
      "contractAccepted",
      (update: { interestId: string; message: ApiMessage }) => {
        if (update.interestId !== selectedConversationId) return;
        const updatedItem = toMessageItem(
          update.message,
          user?.company?.id ?? "",
        );
        setConversations((current) =>
          current.map((conversation) =>
            conversation.id === update.interestId
              ? {
                  ...conversation,
                  messages: orderMessages(
                    conversation.messages.map((message) =>
                      message.id === updatedItem.id ? updatedItem : message,
                    ),
                  ),
                  lastMessage: updatedItem.text,
                }
              : conversation,
          ),
        );
      },
    );
    socket.on(
      "messageDeleted",
      (data: {
        interestId: string;
        messageId: string;
        notificationMessage: ApiMessage;
      }) => {
        setConversations((current) =>
          current.map((conversation) => {
            if (conversation.id !== data.interestId) return conversation;
            const withoutDeleted = conversation.messages.filter(
              (message) => message.id !== data.messageId,
            );
            const notification = toMessageItem(
              data.notificationMessage,
              user?.company?.id ?? "",
            );
            const messages = orderMessages(
              withoutDeleted.some((item) => item.id === notification.id)
                ? withoutDeleted
                : [...withoutDeleted, notification],
            );
            return {
              ...conversation,
              messages,
              lastMessage: getLastMessagePreview(
                messages,
                conversation.lastMessage,
              ),
            };
          }),
        );
        setOpenMessageMenuId(null);
        setEditingMessageId((currentId) =>
          currentId === data.messageId ? null : currentId,
        );
      },
    );
    socket.on(
      "messagesRead",
      (data: { interestId: string; messageIds: string[] }) => {
        if (data.interestId !== selectedConversationId) return;
        data.messageIds.forEach((messageId) =>
          readMessageIdsRef.current.add(messageId),
        );
        setConversations((current) =>
          current.map((conversation) =>
            conversation.id === data.interestId
              ? {
                  ...conversation,
                  messages: conversation.messages.map((message) =>
                    data.messageIds.includes(message.id)
                      ? { ...message, isRead: true }
                      : message,
                  ),
                }
              : conversation,
          ),
        );
      },
    );

    const markVisibleConversationRead = () => {
      if (document.visibilityState !== "visible" || !socket.connected) return;
      socket.emit(
        "markRead",
        { interestId: selectedConversationId },
        (response: SocketAck) => {
          if (response?.ok) {
            decrementUnreadMessages(response.markedReadCount ?? 0);
          }
        },
      );
    };
    document.addEventListener("visibilitychange", markVisibleConversationRead);

    return () => {
      document.removeEventListener(
        "visibilitychange",
        markVisibleConversationRead,
      );
      socket.emit("leaveRoom", { interestId: selectedConversationId });
      socket.disconnect();
      if (socketRef.current === socket) socketRef.current = null;
      setIsSocketConnected(false);
      setIsRoomReady(false);
    };
  }, [decrementUnreadMessages, selectedConversationId, user?.company?.id]);

  const sendTextMessage = (text: string, onSuccess?: () => void) => {
    const content = text.trim();
    if (!content) return false;
    if (
      !selectedConversationId ||
      !socketRef.current?.connected ||
      !isRoomReady
    ) {
      setChatError(
        "La connexion à la conversation n'est pas prête. Réessayez.",
      );
      return false;
    }

    setChatError(null);
    socketRef.current.emit(
      "sendMessage",
      { interestId: selectedConversationId, content },
      (response: SocketAck) => {
        if (!response?.ok) {
          setChatError(response?.error || "Le message n'a pas pu être envoyé.");
          return;
        }
        if (inputText.trim() === content) setInputText("");
        onSuccess?.();
      },
    );
    return true;
  };

  const handleSendMessage = () => {
    sendTextMessage(inputText);
  };

  const startEditingMessage = (message: MessageItem) => {
    setOpenMessageMenuId(null);
    setEditingMessageId(message.id);
    setEditedMessageText(message.text);
  };

  const cancelEditingMessage = () => {
    setEditingMessageId(null);
    setEditedMessageText("");
  };

  const saveEditedMessage = async () => {
    if (!editingMessageId) return;
    setIsSavingMessage(true);
    setChatError(null);
    try {
      const response = await fetch(
        `${getApiRoot()}/messages/${editingMessageId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ content: editedMessageText }),
        },
      );
      if (!response.ok) {
        throw new Error("Le message n’a pas pu être modifié.");
      }

      const result = (await response.json()) as {
        message: ApiMessage;
        notificationMessage: ApiMessage;
      };
      const updatedMessage = result.message;
      const notification = toMessageItem(
        result.notificationMessage,
        user?.company?.id ?? "",
      );
      setConversations((current) =>
        current.map((conversation) => {
          if (conversation.id !== selectedConversationId) return conversation;
          const messages = conversation.messages.map((message) => {
            if (message.id !== updatedMessage.id) return message;
            const contractDetails = parseContractProposal(
              updatedMessage.content,
            );
            return {
              ...message,
              text: updatedMessage.content,
              time: formatMessageTime(updatedMessage.createdAt),
              isContract: Boolean(contractDetails),
              contractDetails,
            };
          });
          const messagesWithNotice = orderMessages(
            messages.some((message) => message.id === notification.id)
              ? messages
              : [...messages, notification],
          );
          return {
            ...conversation,
            messages: messagesWithNotice,
            lastMessage: getLastMessagePreview(
              messagesWithNotice,
              conversation.lastMessage,
            ),
          };
        }),
      );
      cancelEditingMessage();
    } catch (cause) {
      setChatError(
        cause instanceof Error
          ? cause.message
          : "Le message n’a pas pu être modifié.",
      );
    } finally {
      setIsSavingMessage(false);
    }
  };

  const deleteMessage = async (message: MessageItem) => {
    if (!window.confirm("Supprimer définitivement ce message ?")) return;
    setDeletingMessageId(message.id);
    setChatError(null);
    try {
      const response = await fetch(`${getApiRoot()}/messages/${message.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Le message n’a pas pu être supprimé.");
      }
      const result = (await response.json()) as {
        id: string;
        notificationMessage: ApiMessage;
      };
      const notification = toMessageItem(
        result.notificationMessage,
        user?.company?.id ?? "",
      );

      setConversations((current) =>
        current.map((conversation) => {
          if (conversation.id !== selectedConversationId) return conversation;
          const withoutDeleted = conversation.messages.filter(
            (item) => item.id !== message.id,
          );
          const messages = orderMessages(
            withoutDeleted.some((item) => item.id === notification.id)
              ? withoutDeleted
              : [...withoutDeleted, notification],
          );
          return {
            ...conversation,
            messages,
            lastMessage: getLastMessagePreview(
              messages,
              conversation.lastMessage,
            ),
          };
        }),
      );
      setOpenMessageMenuId(null);
      if (editingMessageId === message.id) cancelEditingMessage();
    } catch (cause) {
      setChatError(
        cause instanceof Error
          ? cause.message
          : "Le message n’a pas pu être supprimé.",
      );
    } finally {
      setDeletingMessageId(null);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    setShowPlusMenu(false);
    if (!file || !selectedConversationId) return;

    setChatError(null);
    setIsUploadingFile(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch(
        `${getApiRoot()}/messages/${selectedConversationId}/attachments`,
        {
          method: "POST",
          credentials: "include",
          body: formData,
        },
      );
      if (!response.ok) {
        throw new Error(
          "Le fichier n’a pas pu être envoyé. Vérifiez le format et la taille (10 Mo maximum).",
        );
      }
      const uploadedMessage = (await response.json()) as ApiMessage;
      const attachmentMessage: MessageItem = {
        id: uploadedMessage.id,
        createdAt: uploadedMessage.createdAt,
        sender: uploadedMessage.sender.companyName,
        text: uploadedMessage.content,
        time: formatMessageTime(uploadedMessage.createdAt),
        isMine: true,
        isRead:
          uploadedMessage.isRead ||
          readMessageIdsRef.current.has(uploadedMessage.id),
        attachmentUrl: uploadedMessage.attachmentUrl,
        attachmentName: uploadedMessage.attachmentName,
        attachmentMimeType: uploadedMessage.attachmentMimeType,
      };
      setConversations((current) =>
        current.map((conversation) =>
          conversation.id === selectedConversationId
            ? {
                ...conversation,
                lastMessage: `📎 ${uploadedMessage.attachmentName || file.name}`,
                timeAgo: "À l'instant",
                messages: conversation.messages.some(
                  (message) => message.id === attachmentMessage.id,
                )
                  ? conversation.messages
                  : [...conversation.messages, attachmentMessage],
              }
            : conversation,
        ),
      );
    } catch {
      setChatError(
        "Le fichier n’a pas pu être envoyé. Formats acceptés : images, PDF, Word, Excel, PowerPoint, TXT et CSV (10 Mo maximum).",
      );
    } finally {
      setIsUploadingFile(false);
    }
  };

  const handleSendContract = (e: React.FormEvent) => {
    e.preventDefault();
    setChatError(null);
    const content = [
      `Proposition de contrat : ${contractTitle}`,
      `Description encodée : ${encodeURIComponent(contractDescription.trim())}`,
      `Montant : ${Number(contractAmount).toLocaleString("fr-FR")} Ar`,
      `Période : ${contractStartDate} au ${contractEndDate}`,
    ].join("\n");

    if (editingContractMessageId) {
      void (async () => {
        setIsSavingContract(true);
        try {
          const response = await fetch(
            `${getApiRoot()}/messages/${editingContractMessageId}`,
            {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify({ content }),
            },
          );
          if (!response.ok) {
            throw new Error("La proposition n’a pas pu être modifiée.");
          }
          const result = (await response.json()) as {
            message: ApiMessage;
            notificationMessage: ApiMessage;
          };
          const updatedMessage = result.message;
          const updatedItem = toMessageItem(
            updatedMessage,
            user?.company?.id ?? "",
          );
          const notification = toMessageItem(
            result.notificationMessage,
            user?.company?.id ?? "",
          );
          setConversations((current) =>
            current.map((conversation) => {
              if (conversation.id !== selectedConversationId) {
                return conversation;
              }
              const updatedMessages = conversation.messages.map((message) =>
                message.id === updatedItem.id ? updatedItem : message,
              );
              const messages = updatedMessages.some(
                (message) => message.id === notification.id,
              )
                ? updatedMessages
                : [...updatedMessages, notification];
              return {
                ...conversation,
                messages,
                lastMessage: notification.text,
              };
            }),
          );
          setShowContractModal(false);
          setEditingContractMessageId(null);
        } catch (cause) {
          setChatError(
            cause instanceof Error
              ? cause.message
              : "La proposition n’a pas pu être modifiée.",
          );
        } finally {
          setIsSavingContract(false);
        }
      })();
      return;
    }

    sendTextMessage(content, () => setShowContractModal(false));
  };

  const openContractForEditing = (message: MessageItem) => {
    if (!message.contractDetails) return;
    setChatError(null);
    setContractTitle(message.contractDetails.title);
    setContractDescription(message.contractDetails.description);
    setContractAmount(String(message.contractDetails.amount));
    setContractStartDate(message.contractDetails.startDate);
    setContractEndDate(message.contractDetails.endDate);
    setEditingContractMessageId(message.id);
    setShowContractModal(true);
  };

  const closeContractModal = () => {
    setShowContractModal(false);
    setEditingContractMessageId(null);
  };

  const handleConfirmOfficialSignature = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContractMessageId) return;
    setIsSigningContract(true);
    setChatError(null);
    try {
      const response = await fetch(
        `${getApiRoot()}/messages/${selectedContractMessageId}/accept`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ signerName }),
        },
      );
      if (!response.ok) {
        const result = (await response.json().catch(() => null)) as {
          message?: string;
        } | null;
        throw new Error(
          result?.message || "La proposition n’a pas pu être acceptée.",
        );
      }

      const result = (await response.json()) as { message: ApiMessage };
      const updatedItem = toMessageItem(
        result.message,
        user?.company?.id ?? "",
      );
      setConversations((current) =>
        current.map((conversation) =>
          conversation.id === selectedConversationId
            ? {
                ...conversation,
                messages: orderMessages(
                  conversation.messages.map((message) =>
                    message.id === updatedItem.id ? updatedItem : message,
                  ),
                ),
                lastMessage: updatedItem.text,
              }
            : conversation,
        ),
      );
      setShowSignatureModal(false);
      setSignerName("");
      setSelectedContractMessageId(null);
    } catch (cause) {
      setChatError(
        cause instanceof Error
          ? cause.message
          : "La proposition n’a pas pu être acceptée.",
      );
    } finally {
      setIsSigningContract(false);
    }
  };

  const downloadContract = async (contractId: string | undefined) => {
    if (!contractId) {
      setChatError("La référence du contrat accepté est introuvable.");
      return;
    }
    setChatError(null);
    try {
      const response = await fetch(
        `${getApiRoot()}/messages/contracts/${contractId}/pdf`,
        { credentials: "include" },
      );
      if (!response.ok) {
        throw new Error("Le PDF du contrat n’a pas pu être téléchargé.");
      }
      const pdf = await response.blob();
      const url = URL.createObjectURL(pdf);
      const link = document.createElement("a");
      link.href = url;
      const reference = selectedConversation?.messages.find(
        (message) => message.contractDetails?.contractId === contractId,
      )?.contractDetails?.reference;
      link.download = `${reference ?? "contrat"}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (cause) {
      setChatError(
        cause instanceof Error
          ? cause.message
          : "Le PDF du contrat n’a pas pu être téléchargé.",
      );
    }
  };

  // Filtrage des conversations
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

  const contractToSign = selectedConversation?.messages.find(
    (m) => m.id === selectedContractMessageId,
  )?.contractDetails;
  const contractToReview = selectedConversation?.messages.find(
    (message) => message.id === reviewingContractMessageId,
  )?.contractDetails;

  return (
    <div className="fixed inset-x-0 top-20 bottom-0 overflow-hidden bg-slate-100 p-0 font-sans">
      <div
        data-actor-card
        className="relative flex h-full w-full overflow-hidden bg-white"
      >
        {/* Input file caché pour l'envoi de fichier */}
        <input
          type="file"
          ref={fileInputRef}
          accept="image/jpeg,image/png,image/webp,image/gif,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,text/plain,text/csv"
          onChange={handleFileUpload}
          className="hidden"
        />

        {/* ═══════════════════════════════════════════════
            LISTE DES CONVERSATIONS
            ═══════════════════════════════════════════════ */}
        <div
          className={`w-full shrink-0 flex-col border-r border-slate-200 bg-white md:w-[360px] ${
            showMobileChat ? "hidden md:flex" : "flex"
          }`}
        >
          <div className="px-5 py-4 shrink-0 border-b border-slate-100">
            <h1 className="text-lg font-extrabold text-slate-900">
              Messages & Négociations
            </h1>
          </div>

          <div className="px-4 py-3 shrink-0 border-b border-slate-100">
            <div className="relative">
              <Search
                className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400"
                strokeWidth={2.2}
              />
              <input
                type="text"
                placeholder="Rechercher une conversation..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-100 border border-transparent text-xs font-medium text-slate-800 placeholder-slate-500 focus:outline-none focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
              />
            </div>
          </div>

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
                      ? "bg-emerald-500 text-white shadow-sm"
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

          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="p-8 text-center text-xs text-slate-400">
                Chargement des conversations...
              </div>
            ) : filteredConversations.length > 0 ? (
              filteredConversations.map((conv) => {
                const isSelected = conv.id === selectedConversationId;
                return (
                  <button
                    key={conv.id}
                    onClick={() => {
                      setSelectedConversationId(conv.id);
                      setShowMobileChat(true);
                    }}
                    className={`w-full text-left px-4 py-3 border-b border-slate-50 flex items-start gap-3 transition ${
                      isSelected ? "bg-emerald-50/70" : "hover:bg-slate-50"
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
                              ? "text-emerald-600 font-bold"
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
                      <span className="min-w-[18px] h-[18px] px-1 bg-emerald-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shrink-0 mt-1">
                        {conv.unread}
                      </span>
                    )}
                  </button>
                );
              })
            ) : (
              <div className="p-8 text-center">
                <MessageSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p
                  role={chatError ? "alert" : undefined}
                  className={`text-xs font-medium ${
                    chatError ? "text-red-600" : "text-slate-400"
                  }`}
                >
                  {chatError || "Aucune conversation"}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ═══════════════════════════════════════════════
            ZONE DE CHAT
            ═══════════════════════════════════════════════ */}
        <div
          className={`min-w-0 flex-1 flex-col bg-slate-50 ${
            showMobileChat ? "flex" : "hidden md:flex"
          }`}
        >
          {selectedConversation ? (
            <>
              {/* En-tête */}
              <div className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-200 bg-white px-3 py-3 sm:px-5">
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    type="button"
                    onClick={() => setShowMobileChat(false)}
                    aria-label="Retour"
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 md:hidden"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </button>
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
                    <p
                      className={`truncate text-[10px] ${
                        selectedConversation.isOnline
                          ? "font-semibold text-emerald-600"
                          : "text-slate-400"
                      }`}
                    >
                      {selectedConversation.isOnline
                        ? "En ligne"
                        : formatLastLogin(selectedConversation.lastLoginAt)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 space-y-4 overflow-y-auto px-3 py-5 sm:px-6">
                {chatError && (
                  <div
                    role="alert"
                    className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700"
                  >
                    {chatError}
                  </div>
                )}
                {isLoadingMessages && (
                  <p className="text-center text-xs text-slate-400">
                    Chargement des messages...
                  </p>
                )}
                {selectedConversation.messages.map((msg, index) => (
                  <div key={msg.id} className="flex flex-col gap-1">
                    {shouldShowMessageDate(
                      msg,
                      selectedConversation.messages[index - 1],
                    ) && (
                      <div className="flex items-center justify-center py-1">
                        <span className="text-[11px] font-medium text-slate-400 bg-slate-100 rounded-lg px-3 py-1">
                          {formatMessageDate(
                            new Date(getMessageTimelineTime(msg)).toISOString(),
                          )}
                        </span>
                      </div>
                    )}
                    {msg.isMine && !msg.isSystemNotification && (
                      <span className="px-1 text-right text-[10px] font-bold text-slate-400">
                        Vous
                      </span>
                    )}

                    <div
                      className={`flex gap-2 ${
                        msg.isSystemNotification
                          ? "justify-center"
                          : msg.isMine
                            ? "justify-end"
                            : "justify-start"
                      }`}
                    >
                      {msg.isMine &&
                        !msg.isSystemNotification &&
                        msg.contractDetails?.status !== "ACCEPTED" &&
                        editingMessageId !== msg.id && (
                          <div className="relative self-center">
                            <button
                              type="button"
                              aria-label="Options du message"
                              aria-haspopup="menu"
                              aria-expanded={openMessageMenuId === msg.id}
                              onClick={() =>
                                setOpenMessageMenuId((currentId) =>
                                  currentId === msg.id ? null : msg.id,
                                )
                              }
                              disabled={deletingMessageId === msg.id}
                              className="flex h-8 w-8 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 disabled:opacity-50"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </button>
                            {openMessageMenuId === msg.id && (
                              <div
                                role="menu"
                                className="absolute right-0 top-full z-20 mt-1 w-36 rounded-xl border border-slate-100 bg-white p-1.5 shadow-lg"
                              >
                                {!msg.attachmentUrl && !msg.isContract && (
                                  <button
                                    type="button"
                                    role="menuitem"
                                    onClick={() => startEditingMessage(msg)}
                                    disabled={deletingMessageId === msg.id}
                                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs font-medium text-slate-700 transition hover:bg-slate-50"
                                  >
                                    <Pencil className="h-3.5 w-3.5" />
                                    Modifier
                                  </button>
                                )}
                                <button
                                  type="button"
                                  role="menuitem"
                                  onClick={() => void deleteMessage(msg)}
                                  disabled={deletingMessageId === msg.id}
                                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs font-medium text-rose-600 transition hover:bg-rose-50"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                  Supprimer
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      <div
                        className={`flex flex-col ${
                          msg.isSystemNotification
                            ? "max-w-full"
                            : "max-w-[80%]"
                        }`}
                      >
                        {msg.isSystemNotification ? (
                          <div
                            role="note"
                            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-center text-[11px] font-medium text-slate-500 shadow-sm"
                          >
                            {msg.text}
                            <span className="ml-2 text-[10px] text-slate-400">
                              {msg.time}
                            </span>
                          </div>
                        ) : editingMessageId === msg.id ? (
                          <div className="w-[min(70vw,24rem)] rounded-2xl border border-emerald-200 bg-white p-3 shadow-sm">
                            <textarea
                              aria-label="Modifier le message"
                              autoFocus
                              rows={3}
                              value={editedMessageText}
                              onChange={(event) =>
                                setEditedMessageText(event.target.value)
                              }
                              onKeyDown={(event) => {
                                if (
                                  event.key === "Enter" &&
                                  (event.ctrlKey || event.metaKey)
                                ) {
                                  event.preventDefault();
                                  void saveEditedMessage();
                                }
                              }}
                              className="w-full resize-y rounded-lg border border-slate-200 px-2.5 py-2 text-xs text-slate-800 focus:border-emerald-500 focus:outline-none"
                            />
                            <div className="mt-2 flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={cancelEditingMessage}
                                disabled={isSavingMessage}
                                className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-50"
                              >
                                <X className="h-3.5 w-3.5" />
                                Annuler
                              </button>
                              <button
                                type="button"
                                onClick={() => void saveEditedMessage()}
                                disabled={
                                  isSavingMessage || !editedMessageText.trim()
                                }
                                className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1.5 text-[11px] font-semibold text-white hover:bg-emerald-700 disabled:cursor-wait disabled:opacity-50"
                              >
                                {isSavingMessage ? (
                                  <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <Check className="h-3.5 w-3.5" />
                                )}
                                Enregistrer
                              </button>
                            </div>
                          </div>
                        ) : msg.isContract && msg.contractDetails ? (
                          /* Rendu Carte Contrat B2B Officiel */
                          <div className="bg-white rounded-2xl border border-emerald-200 p-4 shadow-sm space-y-3 min-w-[280px] sm:min-w-[320px]">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                  <FileSignature className="w-4 h-4" />
                                </div>
                                <div>
                                  <h4 className="text-xs font-extrabold text-slate-900">
                                    {msg.contractDetails.title}
                                  </h4>
                                  <span className="text-[10px] text-slate-400">
                                    Accord B2B - Chambre de Commerce
                                  </span>
                                </div>
                              </div>
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                  msg.contractDetails.status === "ACCEPTED"
                                    ? "bg-emerald-100 text-emerald-800"
                                    : "bg-amber-100 text-amber-800"
                                }`}
                              >
                                {msg.contractDetails.status === "ACCEPTED"
                                  ?                                   "Accepté"
                                  : "En attente"}
                              </span>
                            </div>

                            <div className="space-y-1.5 text-xs text-slate-600">
                              <p className="whitespace-pre-wrap text-xs leading-relaxed text-slate-600">
                                {msg.contractDetails.description}
                              </p>
                              <div className="flex items-center justify-between">
                                <span className="text-slate-400 flex items-center gap-1">
                                  <Coins className="w-3.5 h-3.5" /> Montant :
                                </span>
                                <strong className="text-slate-900 font-bold">
                                  {msg.contractDetails.amount.toLocaleString(
                                    "fr-FR",
                                  )}{" "}
                                  Ar
                                </strong>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-slate-400 flex items-center gap-1">
                                  <Calendar className="w-3.5 h-3.5" /> Période :
                                </span>
                                <span className="text-slate-700 font-medium">
                                  {formatContractDate(
                                    msg.contractDetails.startDate,
                                  )}{" "}
                                  au{" "}
                                  {formatContractDate(
                                    msg.contractDetails.endDate,
                                  )}
                                </span>
                              </div>
                              {msg.contractDetails.signerName && (
                                <div className="flex items-center gap-1 text-[11px] text-emerald-700 font-semibold pt-1">
                                  <ShieldCheck className="w-3.5 h-3.5" /> Validé
                                  par {msg.contractDetails.signerName}
                                </div>
                              )}
                              {msg.contractDetails.reference && (
                                <p className="text-[10px] text-slate-400">
                                  Référence : {msg.contractDetails.reference}
                                </p>
                              )}
                            </div>

                            <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                              {!msg.isMine &&
                                msg.contractDetails.status === "PENDING" && (
                                  <button
                                    onClick={() =>
                                      setReviewingContractMessageId(msg.id)
                                    }
                                    className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center justify-center gap-1.5"
                                  >
                                    <FileText className="w-3.5 h-3.5" />
                                    <span>Consulter la proposition</span>
                                  </button>
                                )}
                              {msg.isMine &&
                                msg.contractDetails.status === "PENDING" && (
                                  <button
                                    type="button"
                                    onClick={() => openContractForEditing(msg)}
                                    className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center justify-center gap-1.5"
                                  >
                                    <Pencil className="h-3.5 w-3.5" />
                                    Modifier la proposition
                                  </button>
                                )}
                              {msg.contractDetails.status === "ACCEPTED" && (
                                <button
                                  onClick={() =>
                                    void downloadContract(
                                      msg.contractDetails?.contractId,
                                    )
                                  }
                                  className="w-full py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
                                >
                                  <Download className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>Télécharger le contrat PDF</span>
                                </button>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div
                            className={`${
                              msg.attachmentUrl
                                ? "border-0 bg-transparent p-0"
                                : `px-4 py-2.5 rounded-2xl ${
                                    msg.isMine
                                      ? "bg-emerald-500 text-white"
                                      : "bg-white text-slate-800 border border-slate-100"
                                  }`
                            }`}
                          >
                            {msg.attachmentUrl ? (
                              msg.attachmentMimeType?.startsWith("image/") ? (
                                <a
                                  href={msg.attachmentUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="block"
                                >
                                  <img
                                    src={msg.attachmentUrl}
                                    alt="Image envoyée"
                                    className="max-h-64 max-w-full rounded-lg object-contain"
                                  />
                                </a>
                              ) : msg.attachmentMimeType ===
                                "application/pdf" ? (
                                <a
                                  href={msg.attachmentUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  aria-label="Ouvrir le document PDF"
                                  className="inline-flex flex-col items-center gap-1"
                                >
                                  <img
                                    src="/images/pdf-file.svg"
                                    alt="Document PDF"
                                    className="h-32 w-28 rounded-lg object-contain"
                                  />
                                  <span className="max-w-40 break-all text-center text-xs font-medium text-slate-600">
                                    {msg.attachmentName || "Document PDF"}
                                  </span>
                                </a>
                              ) : (
                                <a
                                  href={msg.attachmentUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 text-xs font-medium underline break-all"
                                >
                                  <FileText className="h-4 w-4 shrink-0" />
                                  {msg.attachmentName || msg.text}
                                </a>
                              )
                            ) : (
                              <p className="text-xs leading-relaxed whitespace-pre-wrap">
                                {msg.text}
                              </p>
                            )}
                          </div>
                        )}

                        {!msg.isSystemNotification && (
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
                                <>
                                  <CheckCheck
                                    className="w-3 h-3 text-emerald-500"
                                    strokeWidth={2.5}
                                  />
                                  <span className="text-[9px] font-semibold text-emerald-600">
                                    Vu
                                  </span>
                                </>
                              ) : (
                                <Check
                                  className="w-3 h-3 text-slate-400"
                                  strokeWidth={2.5}
                                />
                              ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* ═══════════════════════════════════════════════════════════
                  ZONE DE SAISIE AVEC BOUTON "+" À L'EXTRÊME GAUCHE
                  ═══════════════════════════════════════════════════════════ */}
              <div className="relative shrink-0 px-2 pb-3 pt-2 sm:px-6 sm:pb-6">
                <div className="relative flex items-center gap-2 rounded-full border border-slate-200 bg-white p-1.5 pl-2 shadow-lg transition-shadow hover:shadow-xl">
                  {/* 🟢 BOUTON "+" AVEC MENU DÉROULANT (Extrême gauche) */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowPlusMenu(!showPlusMenu)}
                      className={`w-9 h-9 rounded-full flex items-center justify-center transition shrink-0 ${
                        showPlusMenu
                          ? "bg-emerald-600 text-white rotate-45"
                          : "bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-600"
                      }`}
                      title="Actions supplémentaires"
                    >
                      <Plus
                        className="w-5 h-5 transition-transform duration-200"
                        strokeWidth={2.5}
                      />
                    </button>

                    {/* MENU DÉROULANT DES ACTIONS DU BOUTON "+" */}
                    {showPlusMenu && (
                      <div className="absolute bottom-12 left-0 z-50 w-64 bg-white rounded-2xl p-2 shadow-2xl border border-slate-100 space-y-1 animate-in fade-in slide-in-from-bottom-3 duration-200">
                        {/* Option 1 : Proposer un contrat */}
                        <button
                          type="button"
                          onClick={() => {
                            setShowPlusMenu(false);
                            setChatError(null);
                            setShowContractModal(true);
                          }}
                          className="w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-100 text-slate-900 transition"
                        >
                          <FileSignature className="w-4 h-4 shrink-0 text-black" />
                          <p className="text-xs font-bold leading-tight">
                            Proposer un contrat
                          </p>
                        </button>

                        {/* Option 2 : Envoyer un fichier */}
                        <button
                          type="button"
                          disabled={isUploadingFile}
                          onClick={() => {
                            setShowPlusMenu(false);
                            fileInputRef.current?.click();
                          }}
                          className="w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-100 text-slate-900 transition disabled:cursor-wait disabled:opacity-50"
                        >
                          <Paperclip className="w-4 h-4 shrink-0 text-black" />
                          <p className="text-xs font-bold leading-tight">
                            Envoyer un fichier
                          </p>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Champ de texte */}
                  <input
                    type="text"
                    placeholder="Écrire un message ou négocier les termes..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                    className="flex-1 bg-transparent text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none py-2 px-2"
                  />

                  {isUploadingFile && (
                    <span
                      role="status"
                      className="inline-flex shrink-0 items-center gap-1.5 text-[10px] font-medium text-slate-500"
                    >
                      <LoaderCircle
                        aria-hidden="true"
                        className="h-4 w-4 animate-spin text-emerald-600"
                      />
                      Envoi en cours...
                    </span>
                  )}

                  {/* Bouton d'envoi principal */}
                  <button
                    onClick={handleSendMessage}
                    aria-label="Envoyer"
                    className="w-10 h-10 rounded-full bg-emerald-500 hover:bg-emerald-600 flex items-center justify-center text-white transition shrink-0 shadow-md shadow-emerald-500/30"
                  >
                    <Send className="w-4 h-4" strokeWidth={2.2} />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <p
                role={chatError ? "alert" : undefined}
                className={`text-sm ${
                  chatError ? "text-red-600" : "text-slate-400"
                }`}
              >
                {chatError ||
                  (isLoading
                    ? "Chargement de vos conversations..."
                    : "Sélectionnez une conversation")}
              </p>
            </div>
          )}
        </div>

        {/* ═══════════════════════════════════════════════
            MODALE 1 : PROPOSITION DE CONTRAT (Émetteur)
            ═══════════════════════════════════════════════ */}
        {showContractModal && (
          <ContractProposalModal
            contractTitle={contractTitle}
            contractDescription={contractDescription}
            contractAmount={contractAmount}
            contractStartDate={contractStartDate}
            contractEndDate={contractEndDate}
            onTitleChange={setContractTitle}
            onDescriptionChange={setContractDescription}
            onAmountChange={setContractAmount}
            onStartDateChange={setContractStartDate}
            onEndDateChange={setContractEndDate}
            onClose={closeContractModal}
            onSubmit={handleSendContract}
            title={
              editingContractMessageId
                ? "Modifier la proposition de contrat"
                : "Formaliser un accord B2B"
            }
            submitLabel={
              editingContractMessageId
                ? "Enregistrer les modifications"
                : "Envoyer au partenaire"
            }
            isSubmitting={isSavingContract}
            error={chatError}
          />
        )}

        {reviewingContractMessageId && contractToReview && (
          <ContractReviewModal
            contract={contractToReview}
            onCancel={() => setReviewingContractMessageId(null)}
            onAccept={() => {
              setSelectedContractMessageId(reviewingContractMessageId);
              setReviewingContractMessageId(null);
              setShowSignatureModal(true);
            }}
          />
        )}

        {/* ════════════════════════════════════════════════════════════════
            MODALE 2 : VALIDATION JURIDIQUE & SIGNATURE OFFICIELLE (Destinataire)
            ════════════════════════════════════════════════════════════════ */}
        {showSignatureModal && contractToSign && (
          <div className="absolute inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Validation et acceptation du contrat
                  </h3>
                  <p className="text-xs text-slate-500">
                    Acceptation enregistrée dans cette conversation
                  </p>
                </div>
              </div>

              {/* Récapitulatif officiel */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/60 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Objet du contrat :</span>
                  <span className="font-bold text-slate-900">
                    {contractToSign.title}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Montant total validé :</span>
                  <span className="font-extrabold text-emerald-600">
                    {contractToSign.amount.toLocaleString("fr-FR")} Ar
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Période d'engagement :</span>
                  <span className="font-semibold text-slate-700">
                    {formatContractDate(contractToSign.startDate)} au{" "}
                    {formatContractDate(contractToSign.endDate)}
                  </span>
                </div>
              </div>

              {/* Formulaire de signature du gérant */}
              <form
                onSubmit={handleConfirmOfficialSignature}
                className="space-y-3"
              >
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nom du représentant légal / Gérant
                  </label>
                  <input
                    type="text"
                    required
                    value={signerName}
                    onChange={(e) => setSignerName(e.target.value)}
                    placeholder="Ex: RAKOTO Jean"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:bg-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="flex items-start gap-2.5 pt-1">
                  <input
                    type="checkbox"
                    id="legal-agree-checkbox"
                    required
                    className="mt-0.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <label
                    htmlFor="legal-agree-checkbox"
                    className="text-[11px] text-slate-600 leading-tight"
                  >
                    Je confirme être habilité à représenter mon entreprise et
                    accepter les conditions de cette proposition. Cette action
                    enregistre l’acceptation et génère un exemplaire PDF du
                    contrat.
                  </label>
                </div>

                <div className="pt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowSignatureModal(false)}
                    disabled={isSigningContract}
                    className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={isSigningContract}
                    className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition flex items-center justify-center gap-1.5"
                  >
                    {isSigningContract ? (
                      <LoaderCircle className="w-4 h-4 animate-spin" />
                    ) : (
                      <FileCheck className="w-4 h-4" />
                    )}
                    <span>
                      {isSigningContract
                        ? "Enregistrement..."
                        : "Accepter et enregistrer"}
                    </span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
