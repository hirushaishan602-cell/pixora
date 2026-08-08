"use client";

import { useEffect, useRef, useState } from "react";
import { FaPaperPlane, FaImage, FaTimes, FaCheckDouble, FaComments } from "react-icons/fa";
import {
  subscribeToMessages,
  sendMessage,
  uploadChatImage,
  markRequestSeen,
  subscribeToSeenStatus,
} from "@/lib/messages";
import { ChatMessage } from "@/lib/types";
import { Timestamp } from "firebase/firestore";

export default function RequestChat({
  requestId,
  clientId,
  currentUid,
  currentEmail,
  currentRole,
  locked,
}: {
  requestId: string;
  clientId: string;
  currentUid: string;
  currentEmail: string;
  currentRole: "admin" | "client";
  locked: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [mySeenAt, setMySeenAt] = useState<Timestamp | null>(null);
  const [otherSeenAt, setOtherSeenAt] = useState<Timestamp | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // messages + seen status are tracked in the background at all times
  // (even collapsed) so the unread "new message" badge stays accurate
  useEffect(() => {
    const unsubscribe = subscribeToMessages(requestId, setMessages);
    return () => unsubscribe();
  }, [requestId]);

  useEffect(() => {
    const unsubscribe = subscribeToSeenStatus(requestId, (seen) => {
      const mine = currentRole === "admin" ? seen.adminLastSeenAt : seen.clientLastSeenAt;
      const other = currentRole === "admin" ? seen.clientLastSeenAt : seen.adminLastSeenAt;
      setMySeenAt(mine);
      setOtherSeenAt(other);
    });
    return () => unsubscribe();
  }, [requestId, currentRole]);

  // mark as seen only while the panel is actually open, and whenever a new
  // message arrives while it's open — this is also what clears the badge
  useEffect(() => {
    if (locked || !open) return;
    markRequestSeen(requestId, currentRole).catch(() => {});
  }, [requestId, currentRole, locked, open, messages.length]);

  useEffect(() => {
    if (!open) return;
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, open]);

  const handlePickImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSend = async () => {
    const outgoingText = text.trim();
    const outgoingFile = imageFile;
    if (!outgoingText && !outgoingFile) return;

    // clear the box immediately so it never feels locked while the
    // upload/send happens in the background — the message appears in
    // the thread itself the moment it's actually saved
    setText("");
    clearImage();
    setError("");

    try {
      let imageUrl: string | undefined;
      if (outgoingFile) {
        imageUrl = await uploadChatImage(outgoingFile);
      }
      await sendMessage(requestId, {
        clientId,
        senderId: currentUid,
        senderRole: currentRole,
        senderEmail: currentEmail,
        text: outgoingText || undefined,
        imageUrl,
      });
    } catch {
      setError("A message couldn't be sent. Please try again.");
    }
  };

  // find the last message *I* sent, so a single "Seen" tag can sit under it
  const lastMineId = [...messages].reverse().find((m) => m.senderRole === currentRole)?.id;

  const isSeenByOther = (m: ChatMessage) => {
    if (m.id !== lastMineId || !otherSeenAt) return false;
    const createdAt = m.createdAt as unknown as Timestamp | undefined;
    if (!createdAt?.toMillis) return false;
    return otherSeenAt.toMillis() >= createdAt.toMillis();
  };

  // red "unread" dot on the Chat button: the other side sent the newest
  // message and I haven't opened the chat since
  const lastFromOther = [...messages].reverse().find((m) => m.senderRole !== currentRole);
  const hasUnread = (() => {
    if (!lastFromOther) return false;
    const createdAt = lastFromOther.createdAt as unknown as Timestamp | undefined;
    if (!createdAt?.toMillis) return false;
    if (!mySeenAt) return true;
    return createdAt.toMillis() > mySeenAt.toMillis();
  })();

  return (
    <div className={`request-chat-wrap ${open ? "open" : ""}`}>
      <button
        type="button"
        className="request-chat-toggle"
        onClick={() => setOpen((v) => !v)}
      >
        <FaComments />
        Chat
        {hasUnread && <span className="request-chat-badge" />}
      </button>

      {open && (
        <div className="request-chat">
          <div className="request-chat-messages">
            {messages.length === 0 ? (
              <p className="request-chat-empty">
                {locked
                  ? "No messages were sent for this project."
                  : "Say hello — samples and updates for this project will show up here."}
              </p>
            ) : (
              messages.map((m) => (
                <div
                  key={m.id}
                  className={`request-chat-bubble ${m.senderRole === currentRole ? "mine" : "theirs"}`}
                >
                  <span className="request-chat-sender">
                    {m.senderRole === "admin" ? "PIXORA Team" : "Client"}
                  </span>
                  {m.imageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={m.imageUrl} alt="Shared attachment" />
                  )}
                  {m.text && <p>{m.text}</p>}
                  {isSeenByOther(m) && (
                    <span className="request-chat-seen">
                      <FaCheckDouble /> Seen
                    </span>
                  )}
                </div>
              ))
            )}
            <div ref={bottomRef} />
          </div>

          {locked ? (
            <p className="request-chat-locked">
              🔒 This project is completed — the chat is closed.
            </p>
          ) : (
            <div className="request-chat-input">
              {imagePreview && (
                <div className="request-chat-preview">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imagePreview} alt="Selected attachment" />
                  <button type="button" onClick={clearImage} aria-label="Remove image">
                    <FaTimes />
                  </button>
                </div>
              )}
              {error && <p className="admin-auth-error">{error}</p>}
              <div className="request-chat-row">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handlePickImage}
                />
                <button
                  type="button"
                  className="request-chat-attach"
                  onClick={() => fileInputRef.current?.click()}
                  aria-label="Attach an image"
                >
                  <FaImage />
                </button>
                <input
                  type="text"
                  value={text}
                  placeholder={
                    currentRole === "admin"
                      ? "Send a sample or an update..."
                      : "Type a message..."
                  }
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                />
                <button
                  type="button"
                  className="request-chat-send"
                  onClick={handleSend}
                  disabled={!text.trim() && !imageFile}
                  aria-label="Send message"
                >
                  <FaPaperPlane />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
