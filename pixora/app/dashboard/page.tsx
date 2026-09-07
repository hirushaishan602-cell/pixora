"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { listRequestsForClient } from "@/lib/requests";
import { ProjectRequest } from "@/lib/types";
import ProjectRatingBox from "@/components/ProjectRatingBox";
import BackButton from "@/components/BackButton";

const statusLabel: Record<ProjectRequest["status"], string> = {
  pending: "Awaiting Review",
  approved: "In Progress",
  completed: "Completed",
};

export default function ClientDashboardPage() {
  const { user, role, loading, logout } = useAuth();
  const router = useRouter();
  const [requests, setRequests] = useState<ProjectRequest[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(true);

  const load = async (uid: string) => {
    setLoadingRequests(true);
    const data = await listRequestsForClient(uid);
    setRequests(data);
    setLoadingRequests(false);
  };

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (role === "admin" || role === "mainAdmin") {
      router.replace("/admin");
      return;
    }
    load(user.uid);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, user, role, router]);

  if (loading || !user || role === "admin" || role === "mainAdmin") {
    return (
      <div className="admin-auth-screen">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="client-dashboard">
      <BackButton fallbackHref="/" />
      <div className="client-dashboard-header">
        <div>
          <h1>My Projects</h1>
          <p className="admin-subtitle">{user.email}</p>
        </div>
        <div className="client-dashboard-actions">
          <Link href="/request" className="primary-btn">
            New Project Request →
          </Link>
          <button className="outline-btn" onClick={() => logout().then(() => router.push("/"))}>
            Log Out
          </button>
        </div>
      </div>

      {loadingRequests ? (
        <p>Loading your projects...</p>
      ) : requests.length === 0 ? (
        <div className="client-empty-state">
          <p>You haven&apos;t sent any project requests yet.</p>
          <Link href="/request" className="primary-btn">
            Start Your First Project →
          </Link>
        </div>
      ) : (
        <div className="client-request-list">
          {requests.map((req) => (
            <div key={req.id} className={`client-request-card status-${req.status}`}>
              <div className="client-request-top">
                <span className="client-request-category">{req.category}</span>
                <span className={`client-request-status status-${req.status}`}>
                  {statusLabel[req.status]}
                </span>
              </div>

              <p className="client-request-desc">{req.description}</p>

              {req.imageUrls.length > 0 && (
                <div className="client-request-images">
                  {req.imageUrls.map((url, i) => (
                    <div key={i} className="client-request-image">
                      <Image src={url} alt="" width={90} height={90} unoptimized />
                    </div>
                  ))}
                </div>
              )}

              {req.status === "approved" && (
                <p className="client-request-note">
                  Your project is being worked on. We&apos;ll notify you here once it&apos;s
                  complete.
                </p>
              )}

              {req.status === "completed" && (
                <div className="client-request-delivery">
                  <h4>Your Project Is Ready 🎉</h4>
                  {req.deliverableNote && <p>{req.deliverableNote}</p>}
                  {req.deliverableUrl && (
                    <a
                      href={req.deliverableUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="outline-btn"
                    >
                      View / Download →
                    </a>
                  )}

                  {req.rating ? (
                    <p className="client-request-rated">
                      You rated this project {req.rating} / 5 ⭐
                      {req.comment && ` — "${req.comment}"`}
                    </p>
                  ) : (
                    <ProjectRatingBox request={req} onRated={() => load(user.uid)} />
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
