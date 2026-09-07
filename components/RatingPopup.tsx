"use client";

import { useEffect, useState } from "react";
import RateUsBox from "./RateUsBox";

export const RATE_US_EVENT = "pixora:open-rate-us";

export default function RatingPopup() {
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

  if (!open) return null;

  const close = () => {
    setOpen(false);
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

        <RateUsBox onRated={() => {
          setMessage("Thank you for rating PIXORA!");
          setTimeout(close, 700);
        }} />
        {message && <p className="rating-success-message">{message}</p>}
      </div>
    </div>
  );
}
