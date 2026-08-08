"use client";

import { useEffect, useRef, useState } from "react";
import { FaPaperPlane, FaImage, FaTimes } from "react-icons/fa";
import { subscribeToMessages, sendMessage, uploadChatImage } from "@/lib/messages";
import { ChatMessage } from "@/lib/types";

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
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const unsubscribe = subscribeToMessages(requestId, setMessages);
    return () => unsubscribe();
  }, [requestId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

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
    if (!text.trim() && !imageFile) return;
    setError("");
    setSending(true);
    try {
      let imageUrl: string | undefined;
      if (imageFile) {
        imageUrl = await uploadChatImage(imageFile);
      }
      await sendMessage(requestId, {
        clientId,
        senderId: currentUid,
        senderRole: currentRole,
        senderEmail: currentEmail,
        text: text.trim() || undefined,
        imageUrl,
      });
      setText("");
      clearImage();
    } catch {
      setError("Message couldn't be sent. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
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
              disabled={sending || (!text.trim() && !imageFile)}
              aria-label="Send message"
            >
              <FaPaperPlane />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
