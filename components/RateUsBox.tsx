"use client";

import { useState } from "react";
import RatingStars from "./RatingStars";
import { ratePublicReview, uploadRatingAvatar } from "@/lib/requests";

export default function RateUsBox({ onRated }: { onRated: () => void }) {
  const [rating, setRating] = useState(0);
  const [clientName, setClientName] = useState("");
  const [email, setEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleAvatar = async (file?: File) => {
    if (!file) return;
    setError("");
    setUploading(true);
    try {
      setAvatarUrl(await uploadRatingAvatar(file));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not upload your profile photo.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!rating) return setError("Please select a star rating.");
    if (!comment.trim()) return setError("Please tell us about your experience.");
    if (email.trim() && !/^\S+@\S+\.\S+$/.test(email.trim())) return setError("Please enter a valid email address.");

    setError("");
    setSaving(true);
    try {
      await ratePublicReview({
        rating,
        comment: comment.trim(),
        clientName: clientName.trim(),
        clientEmail: email.trim(),
        avatarUrl,
      });
      onRated();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save your rating. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const initial = clientName.trim().slice(0, 1).toUpperCase() || "C";

  return (
    <div className="project-rating-box public-rate-us-box">
      <div className="rating-profile-head">
        <div className="rating-avatar-preview">
          {avatarUrl ? <img src={avatarUrl} alt="Your profile" /> : <span>{initial}</span>}
        </div>
        <div>
          <p className="project-rating-title">Share your PIXORA experience</p>
          <span className="rating-photo-hint">No project completion or client account is required.</span>
        </div>
      </div>

      <label className="rating-name-field">
        <span>Your name <small>(optional)</small></span>
        <input type="text" value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="Enter your name" maxLength={80} autoComplete="name" />
      </label>

      <label className="rating-name-field">
        <span>Email <small>(optional — kept private)</small></span>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="yourname@gmail.com" maxLength={160} autoComplete="email" />
      </label>

      <label className="rating-photo-upload">
        <input type="file" accept="image/png,image/jpeg,image/webp" onChange={(e) => handleAvatar(e.target.files?.[0])} />
        <span>{uploading ? "Uploading photo..." : avatarUrl ? "Change profile photo" : "Add profile photo"}</span>
        <small>PNG, JPG or WEBP · max 5 MB</small>
      </label>

      <RatingStars value={rating} onChange={setRating} />
      <textarea rows={4} placeholder="Tell us about your experience..." value={comment} onChange={(e) => setComment(e.target.value)} maxLength={500} />
      {error && <p className="admin-auth-error">{error}</p>}
      <button type="button" className="primary-btn rating-submit-btn" onClick={handleSubmit} disabled={saving || uploading}>
        {saving ? "Submitting..." : "Submit Rating"}
      </button>
    </div>
  );
}
