"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { Timestamp } from "firebase/firestore";
import { useAuth } from "./AuthContext";
import { subscribeToRequestsForNotifications } from "@/lib/requests";
import { FaCommentDots, FaTimes } from "react-icons/fa";

type ChatToastData = {
  key: string;
  requestId: string;
  category: string;
  senderRole: "admin" | "client";
  text: string;
};

const ChatNotificationContext = createContext<undefined>(undefined);

const TOAST_DURATION_MS = 6000;

export function ChatNotificationProvider({ children }: { children: ReactNode }) {
  const { user, role, loading } = useAuth();
  const router = useRouter();
  const [toast, setToast] = useState<ChatToastData | null>(null);
  const lastSeenMsRef = useRef<Record<string, number>>({});
  const hasLoadedOnceRef = useRef(false);

  useEffect(() => {
    if (loading || !user || !role) return;

    const myRole: "admin" | "client" =
      role === "admin" || role === "mainAdmin" ? "admin" : "client";

    lastSeenMsRef.current = {};
    hasLoadedOnceRef.current = false;

    const unsubscribe = subscribeToRequestsForNotifications(
      myRole,
      user.uid,
      (requests) => {
        const isFirstLoad = !hasLoadedOnceRef.current;

        for (const req of requests) {
          const lastMsgAtMs =
            (req.lastMessageAt as unknown as Timestamp | undefined)?.toMillis?.() ?? 0;
          if (!lastMsgAtMs) continue;

          const previouslySeenMs = lastSeenMsRef.current[req.id] ?? 0;
          lastSeenMsRef.current[req.id] = lastMsgAtMs;

          // don't notify for chat history that already existed before this
          // tab opened — only newly arriving messages should toast
          if (isFirstLoad) continue;
          if (lastMsgAtMs <= previouslySeenMs) continue;
          if (req.lastMessageSenderRole === myRole) continue;

          setToast({
            key: `${req.id}-${lastMsgAtMs}`,
            requestId: req.id,
            category: req.category,
            senderRole: (req.lastMessageSenderRole as "admin" | "client") ?? "admin",
            text: req.lastMessageText || "Sent a message",
          });
        }

        hasLoadedOnceRef.current = true;
      }
    );

    return () => unsubscribe();
  }, [loading, user, role]);

  const openChat = () => {
    if (!toast) return;
    const myRole = role === "admin" || role === "mainAdmin" ? "admin" : "client";
    const path = myRole === "admin" ? "/admin/requests" : "/dashboard";
    router.push(`${path}?chat=${toast.requestId}`);
    setToast(null);
  };

  return (
    <ChatNotificationContext.Provider value={undefined}>
      {children}
      {toast && (
        <ChatToast
          key={toast.key}
          toast={toast}
          onOpen={openChat}
          onDismiss={() => setToast(null)}
        />
      )}
    </ChatNotificationContext.Provider>
  );
}

function ChatToast({
  toast,
  onOpen,
  onDismiss,
}: {
  toast: ChatToastData;
  onOpen: () => void;
  onDismiss: () => void;
}) {
  useEffect(() => {
    const t = setTimeout(onDismiss, TOAST_DURATION_MS);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toast.key]);

  return (
    <div className="chat-toast" role="button" onClick={onOpen}>
      <button
        type="button"
        className="chat-toast-close"
        onClick={(e) => {
          e.stopPropagation();
          onDismiss();
        }}
        aria-label="Dismiss"
      >
        <FaTimes />
      </button>

      <div className="chat-toast-header">
        <span className="chat-toast-icon">
          <FaCommentDots />
        </span>
        <div>
          <p className="chat-toast-title">
            {toast.senderRole === "admin" ? "New message from PIXORA" : "New message from client"}
          </p>
          <p className="chat-toast-sub">{toast.category}</p>
        </div>
      </div>

      <p className="chat-toast-text">{toast.text}</p>

      <div className="chat-toast-bar-track">
        <div className="chat-toast-bar-fill" style={{ animationDuration: `${TOAST_DURATION_MS}ms` }} />
      </div>
    </div>
  );
}

// exported for consistency even though no consumer needs shared state yet
export function useChatNotifications() {
  return useContext(ChatNotificationContext);
}
