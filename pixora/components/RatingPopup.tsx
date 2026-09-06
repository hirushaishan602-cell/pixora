"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { listRequestsForClient } from "@/lib/requests";
import { ProjectRequest } from "@/lib/types";
import ProjectRatingBox from "./ProjectRatingBox";

export default function RatingPopup() {
  const { user, role, loading } = useAuth();
  const [pending, setPending] = useState<ProjectRequest | null>(null);
  const [closed, setClosed] = useState(false);

  useEffect(() => {
    if (loading || !user || role === "admin" || role === "mainAdmin") return;

    listRequestsForClient(user.uid).then((requests) => {
      const unrated = requests.find((r) => r.status === "completed" && !r.rating);
      setPending(unrated ?? null);
    });
  }, [loading, user, role]);

  if (!pending || closed) return null;

  return (
    <div className="rating-popup-overlay">
      <div className="rating-popup-card">
        <button
          className="rating-popup-close"
          aria-label="Close"
          onClick={() => setClosed(true)}
        >
          ×
        </button>
        <h3>Loved your {pending.category} project?</h3>
        <p>Let us know how we did — it only takes a second.</p>
        <ProjectRatingBox request={pending} onRated={() => setPending(null)} />
      </div>
    </div>
  );
}
