import {
  collection,
  addDoc,
  doc,
  updateDoc,
  query,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  Unsubscribe,
} from "firebase/firestore";
import { db } from "./firebase";
import { ChatMessage } from "./types";
import { uploadToCloudinary } from "./cloudinary";

function messagesCol(requestId: string) {
  return collection(db, "pixora_requests", requestId, "messages");
}

export async function uploadChatImage(file: File): Promise<string> {
  return uploadToCloudinary(file, "pixora-chat");
}

export async function sendMessage(
  requestId: string,
  data: {
    clientId: string;
    senderId: string;
    senderRole: "admin" | "client";
    senderEmail: string;
    text?: string;
    imageUrl?: string;
  }
): Promise<void> {
  // Firestore's addDoc() throws on any field whose value is `undefined`
  // (e.g. imageUrl when there's no attachment) — strip those out first so
  // a text-only or image-only message can actually be sent.
  const payload: Record<string, unknown> = { createdAt: serverTimestamp() };
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) payload[key] = value;
  }

  await addDoc(messagesCol(requestId), payload);
}

// Live-updating chat thread — calls `cb` with the full message list every
// time something changes. Call the returned function to stop listening.
//
// Deliberately NOT using orderBy("createdAt") in the query: Firestore
// excludes a doc from an *ordered* snapshot until its serverTimestamp()
// field is resolved by the server, which — combined with this
// collection's security rules needing an extra get() to validate writes —
// meant a client's own message would flash on screen and then vanish
// entirely instead of just appearing a little late. Fetching unordered
// and sorting in JS avoids that class of bug altogether.
export function subscribeToMessages(
  requestId: string,
  cb: (messages: ChatMessage[]) => void,
  onError?: (err: unknown) => void
): Unsubscribe {
  const q = query(messagesCol(requestId));
  return onSnapshot(
    q,
    (snap) => {
      const items = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<ChatMessage, "id">),
      }));
      items.sort((a, b) => {
        const aMs = (a.createdAt as unknown as Timestamp | undefined)?.toMillis?.() ?? Infinity;
        const bMs = (b.createdAt as unknown as Timestamp | undefined)?.toMillis?.() ?? Infinity;
        return aMs - bMs;
      });
      cb(items);
    },
    (err) => {
      // surfaced so a permission/network problem shows up in devtools
      // instead of silently looking like "no messages" in the UI
      console.error("Pixora: chat listener error", requestId, err);
      onError?.(err);
    }
  );
}

// Marks the chat as "seen" for whichever side (admin/client) is currently
// looking at it — lets the other side see a "Seen" tag under their last
// message, the same way both admin and client can see when they were read.
export async function markRequestSeen(
  requestId: string,
  role: "admin" | "client"
): Promise<void> {
  const field = role === "admin" ? "adminLastSeenAt" : "clientLastSeenAt";
  await updateDoc(doc(db, "pixora_requests", requestId), {
    [field]: serverTimestamp(),
  });
}

// Live "seen" timestamps for both sides of a request's chat.
export function subscribeToSeenStatus(
  requestId: string,
  cb: (seen: { clientLastSeenAt: Timestamp | null; adminLastSeenAt: Timestamp | null }) => void,
  onError?: (err: unknown) => void
): Unsubscribe {
  return onSnapshot(
    doc(db, "pixora_requests", requestId),
    (snap) => {
      const data = snap.data();
      cb({
        clientLastSeenAt: (data?.clientLastSeenAt as Timestamp) ?? null,
        adminLastSeenAt: (data?.adminLastSeenAt as Timestamp) ?? null,
      });
    },
    (err) => {
      console.error("Pixora: seen-status listener error", requestId, err);
      onError?.(err);
    }
  );
}
