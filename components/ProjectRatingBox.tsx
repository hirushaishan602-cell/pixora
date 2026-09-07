"use client";

import { useState } from "react";
import RatingStars from "./RatingStars";
import { rateRequest } from "@/lib/requests";
import { ProjectRequest } from "@/lib/types";

export default function ProjectRatingBox({
  request,
  onRated,
}: {
  request: ProjectRequest;
  onRated: () => void;
}) {
  const [rating, setRating] = useState(0);
  const [clientName, setClientName] = useState(request.clientName ?? "");
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!clientName.trim()) {
      setError("Please enter your name.");
      return;
    }
    if (rating === 0) {
      setError("Please select a star rating.");
      return;
    }
    setError("");
    setSaving(true);
    try {
      await rateRequest(request.id, { rating, comment, clientName: clientName.trim() });
      onRated();
    } catch {
      setError("Could not save your rating. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="project-rating-box">
      <p className="project-rating-title">How was your finished project?</p>
      <label className="rating-name-field">
        <span>Your name</span>
        <input
          type="text"
          value={clientName}
          onChange={(e) => setClientName(e.target.value)}
          placeholder="Enter your name"
          maxLength={80}
          autoComplete="name"
        />
      </label>
      <RatingStars value={rating} onChange={setRating} />
      <textarea
        rows={2}
        placeholder="Leave a comment (optional)"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />
      {error && <p className="admin-auth-error">{error}</p>}
      <button
        type="button"
        className="primary-btn rating-submit-btn"
        onClick={handleSubmit}
        disabled={saving}
      >
        {saving ? "Saving..." : "Submit Rating"}
      </button>
    </div>
  );
}
