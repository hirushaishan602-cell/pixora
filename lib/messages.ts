import {
  collection,
  addDoc,
  doc,
  updateDoc,
  query,
  orderBy,
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
export function subscribeToMessages(
  requestId: string,
  cb: (messages: ChatMessage[]) => void
): Unsubscribe {
  const q = query(messagesCol(requestId), orderBy("createdAt", "asc"));
  return onSnapshot(q, (snap) => {
    const items = snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<ChatMessage, "id">),
    }));
    cb(items);
  });
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
  cb: (seen: { clientLastSeenAt: Timestamp | null; adminLastSeenAt: Timestamp | null }) => void
): Unsubscribe {
  return onSnapshot(doc(db, "pixora_requests", requestId), (snap) => {
    const data = snap.data();
    cb({
      clientLastSeenAt: (data?.clientLastSeenAt as Timestamp) ?? null,
      adminLastSeenAt: (data?.adminLastSeenAt as Timestamp) ?? null,
    });
  });
}
