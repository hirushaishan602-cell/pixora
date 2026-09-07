"use client";

import { useState } from "react";
import RatingStars from "./RatingStars";
import { rateRequest, uploadRatingAvatar } from "@/lib/requests";
import { ProjectRequest } from "@/lib/types";

export default function ProjectRatingBox({ request, onRated }: { request: ProjectRequest; onRated: () => void }) {
  const [rating, setRating] = useState(0);
  const [clientName, setClientName] = useState(request.clientName ?? "");
  const [avatarUrl, setAvatarUrl] = useState(request.avatarUrl ?? "");
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleAvatar = async (file?: File) => {
    if (!file) return;
    setError("");
    setUploading(true);
    try {
      const url = await uploadRatingAvatar(file);
      setAvatarUrl(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not upload your profile photo.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (rating === 0) { setError("Please select a star rating."); return; }
    setError("");
    setSaving(true);
    try {
      await rateRequest(request.id, { rating, comment: comment.trim(), clientName: clientName.trim(), avatarUrl });
      onRated();
    } catch {
      setError("Could not save your rating. Please try again.");
    } finally { setSaving(false); }
  };

  return (
    <div className="project-rating-box">
      <div className="rating-profile-head">
        <div className="rating-avatar-preview">
          {avatarUrl ? <img src={avatarUrl} alt="Your profile" /> : <span>{clientName.trim().slice(0, 1).toUpperCase() || "C"}</span>}
        </div>
        <div>
          <p className="project-rating-title">How was your finished project?</p>
          <span className="rating-photo-hint">Add a profile photo if you'd like.</span>
        </div>
      </div>

      <label className="rating-name-field">
        <span>Your name <small>(optional)</small></span>
        <input type="text" value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="Enter your name" maxLength={80} autoComplete="name" />
      </label>

      <label className="rating-photo-upload">
        <input type="file" accept="image/png,image/jpeg,image/webp" onChange={(e) => handleAvatar(e.target.files?.[0])} />
        <span>{uploading ? "Uploading photo..." : avatarUrl ? "Change profile photo" : "Add profile photo"}</span>
        <small>PNG, JPG or WEBP · max 5 MB</small>
      </label>

      <RatingStars value={rating} onChange={setRating} />
      <textarea rows={3} placeholder="Tell us about your experience..." value={comment} onChange={(e) => setComment(e.target.value)} maxLength={500} />
      {error && <p className="admin-auth-error">{error}</p>}
      <button type="button" className="primary-btn rating-submit-btn" onClick={handleSubmit} disabled={saving || uploading}>
        {saving ? "Saving..." : "Submit Rating"}
      </button>
    </div>
  );
}
