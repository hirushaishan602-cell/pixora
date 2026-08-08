import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
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
  await addDoc(messagesCol(requestId), {
    ...data,
    createdAt: serverTimestamp(),
  });
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
