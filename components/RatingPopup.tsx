"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { listRequestsForClient } from "@/lib/requests";
import { ProjectRequest } from "@/lib/types";
import ProjectRatingBox from "./ProjectRatingBox";

export const RATE_US_EVENT = "pixora:open-rate-us";

export default function RatingPopup() {
  const { user, role, loading } = useAuth();
  const [pending, setPending] = useState<ProjectRequest | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const openRateUs = () => {
      setOpen(true);
    };

    window.addEventListener(RATE_US_EVENT, openRateUs);
    return () => window.removeEventListener(RATE_US_EVENT, openRateUs);
  }, []);

  useEffect(() => {
    if (!open) return;
    setPending(null);

    // Rate Us is public: visitors do not need an account, a WhatsApp
    // conversation, or a completed project. For signed-in clients we can
    // optionally attach an unfinished project rating when one exists, but
    // the public form remains the fallback at all times.
    if (loading || !user || role === "admin" || role === "mainAdmin") return;

    listRequestsForClient(user.uid).then((requests) => {
      const unrated = requests.find((r) => r.status === "completed" && !r.rating);
      setPending(unrated ?? null);
    }).catch(() => {
      // Ignore private-request read failures; public Rate Us still works.
      setPending(null);
    });
  }, [open, loading, user, role]);

  if (!open) return null;

  const close = () => {
    setOpen(false);
    setPending(null);
  };

  return (
    <div className="rating-popup-overlay" role="presentation" onMouseDown={(e) => {
      if (e.target === e.currentTarget) close();
    }}>
      <div className="rating-popup-card" role="dialog" aria-modal="true" aria-labelledby="rate-us-title">
        <button
          className="rating-popup-close"
          aria-label="Close rating form"
          onClick={close}
        >
          ×
        </button>

        <div className="rating-popup-badge">★ RATE US</div>
        <h3 id="rate-us-title">How was your PIXORA experience?</h3>
        <p>Choose your rating, add your name if you want, and tell us what you think.</p>

        {pending ? (
          <ProjectRatingBox request={pending} onRated={close} />
        ) : (
          <ProjectRatingBox onRated={close} />
        )}
      </div>
    </div>
  );
}
