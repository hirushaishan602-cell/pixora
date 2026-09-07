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
  const [message, setMessage] = useState("");

  useEffect(() => {
    const openRateUs = () => {
      setMessage("");
      setOpen(true);
    };

    window.addEventListener(RATE_US_EVENT, openRateUs);
    return () => window.removeEventListener(RATE_US_EVENT, openRateUs);
  }, []);

  useEffect(() => {
    if (!open || loading || !user || role === "admin" || role === "mainAdmin") return;

    listRequestsForClient(user.uid).then((requests) => {
      const unrated = requests.find((r) => r.status === "completed" && !r.rating);
      setPending(unrated ?? null);
      if (!unrated) {
        setMessage("You don't have a completed project waiting for a rating yet.");
      }
    }).catch(() => {
      setMessage("We couldn't load your completed projects. Please try again.");
    });
  }, [open, loading, user, role]);

  if (!open) return null;

  const close = () => {
    setOpen(false);
    setPending(null);
    setMessage("");
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

        {!user ? (
          <div className="rating-empty-state">
            <strong>Please sign in first.</strong>
            <span>You need a client account to rate a completed project.</span>
          </div>
        ) : role === "admin" || role === "mainAdmin" ? (
          <div className="rating-empty-state">
            <strong>Client ratings only</strong>
            <span>Sign in with a client account to submit a project rating.</span>
          </div>
        ) : pending ? (
          <ProjectRatingBox request={pending} onRated={close} />
        ) : (
          <div className="rating-empty-state">
            <strong>No project ready to rate</strong>
            <span>{message || "Complete a project first and the rating form will appear here."}</span>
          </div>
        )}
      </div>
    </div>
  );
}
