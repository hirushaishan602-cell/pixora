"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { listAllRequests, approveRequest, completeRequest, deleteRequest, setRequestFeatured, listPublicRatingsForAdmin, approvePublicRating, hidePublicRating, deletePublicRating } from "@/lib/requests";
import { ProjectRequest } from "@/lib/types";
import RequestChat from "@/components/RequestChat";

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
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <AdminRequestsInner />
    </Suspense>
  );
}

function AdminRequestsInner() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const chatRequestId = searchParams.get("chat");
  const [requests, setRequests] = useState<ProjectRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [openCompleteId, setOpenCompleteId] = useState<string | null>(null);
  const [publicRatings, setPublicRatings] = useState<ProjectRequest[]>([]);
  const [ratingsLoading, setRatingsLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const [requestData, ratingData] = await Promise.all([listAllRequests(), listPublicRatingsForAdmin()]);
    setRequests(requestData);
    setPublicRatings(ratingData);
    setRatingsLoading(false);
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

  const handleToggleFeatured = async (req: ProjectRequest) => {
    await setRequestFeatured(req.id, !req.featured);
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

      <section className="admin-ratings-panel">
        <div className="admin-ratings-header">
          <div>
            <h2>Client Ratings</h2>
            <p className="admin-subtitle">Review public Rate Us submissions before they appear on What Our Clients Say.</p>
          </div>
          <span className="admin-rating-count">{publicRatings.filter((r) => r.featured).length} approved</span>
        </div>

        {ratingsLoading ? (
          <p>Loading ratings...</p>
        ) : publicRatings.length === 0 ? (
          <p className="admin-subtitle">No public ratings yet.</p>
        ) : (
          <div className="admin-rating-list">
            {publicRatings.map((rating) => (
              <article key={rating.id} className={`admin-rating-card ${rating.featured ? "is-approved" : "is-pending"}`}>
                <div className="admin-rating-avatar">
                  {rating.avatarUrl ? <img src={rating.avatarUrl} alt="" /> : <span>{(rating.clientName || "C").slice(0, 1).toUpperCase()}</span>}
                </div>
                <div className="admin-rating-body">
                  <div className="admin-rating-topline">
                    <div>
                      <strong>{rating.clientName || rating.clientEmail || "Happy Client"}</strong>
                      <div className="admin-rating-stars">{"★".repeat(Math.max(0, Math.min(5, rating.rating || 0)))}</div>
                    </div>
                    <span className={`client-request-status status-${rating.featured ? "completed" : "pending"}`}>
                      {rating.featured ? "Approved" : "Pending Review"}
                    </span>
                  </div>
                  <p>{rating.comment}</p>
                  {rating.clientEmail && <small>{rating.clientEmail}</small>}
                  <div className="admin-form-actions">
                    {!rating.featured && (
                      <button className="primary-btn" onClick={async () => { await approvePublicRating(rating.id); await load(); }}>
                        Approve & Show on Website
                      </button>
                    )}
                    {rating.featured && (
                      <button className="outline-btn" onClick={async () => { await hidePublicRating(rating.id); await load(); }}>
                        Hide from Website
                      </button>
                    )}
                    <button className="request-delete-btn" onClick={async () => { if (confirm("Delete this rating permanently?")) { await deletePublicRating(rating.id); await load(); } }}>
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

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
                      <>
                        <CompleteForm
                          request={req}
                          adminEmail={user?.email ?? ""}
                          onDone={() => {
                            setOpenCompleteId(null);
                            load();
                          }}
                        />
                        <div className="admin-form-actions">
                          <RequestChat
                            requestId={req.id}
                            clientId={req.clientId}
                            currentUid={user?.uid ?? ""}
                            currentEmail={user?.email ?? ""}
                            currentRole="admin"
                            locked={false}
                            initiallyOpen={chatRequestId === req.id}
                          />
                        </div>
                      </>
                    ) : (
                      <div className="admin-form-actions">
                        <RequestChat
                          requestId={req.id}
                          clientId={req.clientId}
                          currentUid={user?.uid ?? ""}
                          currentEmail={user?.email ?? ""}
                          currentRole="admin"
                          locked={false}
                          initiallyOpen={chatRequestId === req.id}
                        />
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
                      <RequestChat
                        requestId={req.id}
                        clientId={req.clientId}
                        currentUid={user?.uid ?? ""}
                        currentEmail={user?.email ?? ""}
                        currentRole="admin"
                        locked={true}
                        initiallyOpen={chatRequestId === req.id}
                      />
                      {req.rating ? (
                        <button
                          type="button"
                          className={
                            req.featured ? "outline-btn featured-btn active" : "outline-btn featured-btn"
                          }
                          onClick={() => handleToggleFeatured(req)}
                        >
                          {req.featured
                            ? "✓ Showing on Website"
                            : "Show on Website"}
                        </button>
                      ) : null}
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
