"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { listAllRequests, approveRequest, completeRequest, deleteRequest } from "@/lib/requests";
import { ProjectRequest } from "@/lib/types";

const statusLabel: Record<ProjectRequest["status"], string> = {
  pending: "Pending",
  approved: "Approved",
  completed: "Completed",
};

function CompleteForm({
  request,
  adminEmail,
  onDone,
}: {
  request: ProjectRequest;
  adminEmail: string;
  onDone: () => void;
}) {
  const [deliverableUrl, setDeliverableUrl] = useState("");
  const [deliverableNote, setDeliverableNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleComplete = async () => {
    if (!deliverableUrl.trim()) {
      setError("Add a link to the finished project files.");
      return;
    }
    setError("");
    setSaving(true);
    try {
      await completeRequest(request.id, {
        deliverableUrl,
        deliverableNote,
        completedBy: adminEmail,
      });
      onDone();
    } catch {
      setError("Could not mark this project complete. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-complete-form">
      <label>
        Final Files Link (Google Drive, Dropbox, etc.)
        <input
          value={deliverableUrl}
          onChange={(e) => setDeliverableUrl(e.target.value)}
          placeholder="https://drive.google.com/..."
        />
      </label>
      <label>
        Note to client (optional)
        <textarea
          rows={2}
          value={deliverableNote}
          onChange={(e) => setDeliverableNote(e.target.value)}
        />
      </label>
      {error && <p className="admin-auth-error">{error}</p>}
      <button
        type="button"
        className="primary-btn"
        onClick={handleComplete}
        disabled={saving}
      >
        {saving ? "Sending..." : "Mark Complete & Send to Client"}
      </button>
    </div>
  );
}

export default function AdminRequestsPage() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<ProjectRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [openCompleteId, setOpenCompleteId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const data = await listAllRequests();
    setRequests(data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleApprove = async (req: ProjectRequest) => {
    if (!user?.email) return;
    await approveRequest(req.id, { email: user.email, uid: user.uid });
    await load();
  };

  const handleDelete = async (req: ProjectRequest) => {
    if (!confirm(`Delete the completed request from ${req.clientEmail}?`)) return;
    await deleteRequest(req.id);
    await load();
  };

  const categories = Array.from(new Set(requests.map((r) => r.category))).sort();
  const visible =
    categoryFilter === "all" ? requests : requests.filter((r) => r.category === categoryFilter);

  return (
    <div className="admin-page">
      <h1>Client Requests</h1>
      <p className="admin-subtitle">
        Review project requests sent in through the website, organized by category.
      </p>

      {categories.length > 0 && (
        <div className="admin-category-filter">
          <button
            className={categoryFilter === "all" ? "active" : ""}
            onClick={() => setCategoryFilter("all")}
          >
            All ({requests.length})
          </button>
          {categories.map((c) => (
            <button
              key={c}
              className={categoryFilter === c ? "active" : ""}
              onClick={() => setCategoryFilter(c)}
            >
              {c} ({requests.filter((r) => r.category === c).length})
            </button>
          ))}
        </div>
      )}

      <div className="admin-table-wrap">
        {loading ? (
          <p>Loading...</p>
        ) : visible.length === 0 ? (
          <p>No requests in this category yet.</p>
        ) : (
          <div className="admin-request-list">
            {visible.map((req) => (
              <div key={req.id} className={`admin-request-card status-${req.status}`}>
                <div className="admin-request-top">
                  <div>
                    <span className="client-request-category">{req.category}</span>
                    <h3>{req.clientEmail}</h3>
                  </div>
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

                {req.status === "pending" && (
                  <div className="admin-form-actions">
                    <button className="primary-btn" onClick={() => handleApprove(req)}>
                      Approve Project
                    </button>
                  </div>
                )}

                {req.status === "approved" && (
                  <>
                    <p className="admin-approved-tag">
                      Approved by <strong>{req.approvedBy}</strong>
                    </p>
                    {openCompleteId === req.id ? (
                      <CompleteForm
                        request={req}
                        adminEmail={user?.email ?? ""}
                        onDone={() => {
                          setOpenCompleteId(null);
                          load();
                        }}
                      />
                    ) : (
                      <div className="admin-form-actions">
                        <button
                          className="primary-btn"
                          onClick={() => setOpenCompleteId(req.id)}
                        >
                          Mark Project Complete
                        </button>
                      </div>
                    )}
                  </>
                )}

                {req.status === "completed" && (
                  <>
                    <p className="admin-approved-tag">
                      Approved by <strong>{req.approvedBy}</strong> · Completed by{" "}
                      <strong>{req.completedBy}</strong>
                    </p>
                    {req.rating ? (
                      <p className="client-request-rated">
                        Client rated this project {req.rating} / 5 ⭐
                        {req.comment && ` — "${req.comment}"`}
                      </p>
                    ) : (
                      <p className="admin-subtitle">Waiting for client&apos;s rating.</p>
                    )}
                    <div className="admin-form-actions">
                      <button
                        type="button"
                        className="request-delete-btn"
                        onClick={() => handleDelete(req)}
                      >
                        Delete Request
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
