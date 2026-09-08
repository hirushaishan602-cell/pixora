import {
  collection,
  doc,
  updateDoc,
  writeBatch,
  query,
  where,
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
  // Firestore rejects any field whose value is `undefined` (e.g. imageUrl
  // when there's no attachment), so only include fields that are set.
  const payload: Record<string, unknown> = { createdAt: serverTimestamp() };
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) payload[key] = value;
  }

  // Written in one batch: the message itself, plus a "last message"
  // preview denormalized onto the parent request doc. That preview is
  // what powers the site-wide notification toast — it lets us watch just
  // the (small) requests collection instead of opening a live listener on
  // every request's messages subcollection everywhere in the app.
  const batch = writeBatch(db);
  batch.set(doc(messagesCol(requestId)), payload);
  batch.update(doc(db, "pixora_requests", requestId), {
    lastMessageAt: serverTimestamp(),
    lastMessageSenderRole: data.senderRole,
    lastMessageText: data.text ? data.text.slice(0, 120) : "📷 Photo",
  });
  await batch.commit();
}

// Live-updating chat thread — calls `cb` with the full message list every
// time something changes. Call the returned function to stop listening.
//
// Two deliberate choices here, both working around real Firestore quirks:
//
// 1. NOT using orderBy("createdAt"): Firestore excludes a doc from an
//    *ordered* snapshot until its serverTimestamp() field is resolved by
//    the server, which can make a just-sent message vanish instead of
//    just appearing a little late. Sorting in JS avoids that entirely.
//
// 2. For a client, the query itself is filtered with where("clientId",
//    "==", uid) even though every doc in this subcollection already
//    belongs to that one client. This isn't for extra filtering — it's
//    because Firestore validates security rules against the *query
//    shape* for list operations, not just per returned document. A
//    completely unconstrained collection query couldn't be proven safe
//    against a rule that depends on resource.data.clientId, and got
//    rejected outright with permission-denied for clients (while an
//    admin's query worked, since isPixoraAdmin() doesn't depend on the
//    document at all). Matching the query's where() to the rule's
//    condition is the fix Firestore itself recommends for this.
export function subscribeToMessages(
  requestId: string,
  viewer: { role: "admin" | "client"; clientId: string },
  cb: (messages: ChatMessage[]) => void,
  onError?: (err: unknown) => void
): Unsubscribe {
  const q =
    viewer.role === "admin"
      ? query(messagesCol(requestId))
      : query(messagesCol(requestId), where("clientId", "==", viewer.clientId));

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
      console.error("Pixora: chat listener error", requestId, err);
      onError?.(err);
    }
  );
}

// Marks the chat as "seen" for whichever side (admin/client) is currently
// looking at it — lets the other side see a "Seen" tag under their last
// message, and clears this side's unread notification badge.
export async function markRequestSeen(
  requestId: string,
  role: "admin" | "client"
): Promise<void> {
  const field = role === "admin" ? "adminLastSeenAt" : "clientLastSeenAt";
  await updateDoc(doc(db, "pixora_requests", requestId), {
    [field]: serverTimestamp(),
  });
}

export type RequestMeta = {
  clientLastSeenAt: Timestamp | null;
  adminLastSeenAt: Timestamp | null;
  lastMessageAt: Timestamp | null;
  lastMessageSenderRole: "admin" | "client" | null;
};

// One lightweight live listener on the parent request doc, covering both
// "seen" receipts and the last-message preview — used inside an open chat
// panel to know instantly when the other side has read a message.
export function subscribeToRequestMeta(
  requestId: string,
  cb: (meta: RequestMeta) => void,
  onError?: (err: unknown) => void
): Unsubscribe {
  return onSnapshot(
    doc(db, "pixora_requests", requestId),
    (snap) => {
      const data = snap.data();
      cb({
        clientLastSeenAt: (data?.clientLastSeenAt as Timestamp) ?? null,
        adminLastSeenAt: (data?.adminLastSeenAt as Timestamp) ?? null,
        lastMessageAt: (data?.lastMessageAt as Timestamp) ?? null,
        lastMessageSenderRole: (data?.lastMessageSenderRole as "admin" | "client") ?? null,
      });
    },
    (err) => {
      console.error("Pixora: request-meta listener error", requestId, err);
      onError?.(err);
    }
  );
}
