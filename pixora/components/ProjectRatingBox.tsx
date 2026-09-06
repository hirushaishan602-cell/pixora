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
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (rating === 0) {
      setError("Please select a star rating.");
      return;
    }
    setError("");
    setSaving(true);
    try {
      await rateRequest(request.id, { rating, comment });
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
