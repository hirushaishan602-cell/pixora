import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  query,
  where,
  orderBy,
  serverTimestamp,
  Unsubscribe,
} from "firebase/firestore";
import { db } from "./firebase";
import { ProjectRequest } from "./types";
import { uploadToCloudinary } from "./cloudinary";

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

const REQUESTS_COL = collection(db, "pixora_requests");

export async function uploadRequestImage(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) throw new Error("Only image files are allowed.");
  if (file.size > MAX_UPLOAD_BYTES) throw new Error("Image must be 5 MB or smaller.");
  return uploadToCloudinary(file, "pixora-requests");
}

export async function uploadRatingAvatar(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) throw new Error("Only image files are allowed.");
  if (file.size > MAX_UPLOAD_BYTES) throw new Error("Profile image must be 5 MB or smaller.");
  return uploadToCloudinary(file, "pixora-rating-avatars");
}

export async function uploadRequestImages(files: File[]): Promise<string[]> {
  return Promise.all(files.map((f) => uploadRequestImage(f)));
}

export async function createRequest(data: {
  clientId: string;
  clientEmail: string;
  clientName?: string;
  category: string;
  description: string;
  imageUrls: string[];
}): Promise<void> {
  // same Firestore quirk as the chat: addDoc() rejects any `undefined`
  // field (clientName is optional), so strip those out before sending
  const payload: Record<string, unknown> = {
    status: "pending",
    createdAt: serverTimestamp(),
  };
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) payload[key] = value;
  }

  await addDoc(REQUESTS_COL, payload);
}

export async function listAllRequests(): Promise<ProjectRequest[]> {
  const q = query(REQUESTS_COL, orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<ProjectRequest, "id">) }));
}

export async function listRequestsForClient(uid: string): Promise<ProjectRequest[]> {
  const q = query(REQUESTS_COL, where("clientId", "==", uid));
  const snap = await getDocs(q);
  const items = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<ProjectRequest, "id">) }));
  return items.sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
}

export async function approveRequest(
  id: string,
  admin: { email: string; uid: string }
): Promise<void> {
  await updateDoc(doc(db, "pixora_requests", id), {
    status: "approved",
    approvedBy: admin.email,
    approvedByUid: admin.uid,
    approvedAt: serverTimestamp(),
  });
}

export async function completeRequest(
  id: string,
  data: { deliverableUrl: string; deliverableNote: string; completedBy: string }
): Promise<void> {
  await updateDoc(doc(db, "pixora_requests", id), {
    status: "completed",
    deliverableUrl: data.deliverableUrl,
    deliverableNote: data.deliverableNote,
    completedBy: data.completedBy,
    completedAt: serverTimestamp(),
  });
}

export async function rateRequest(
  id: string,
  data: { rating: number; comment: string; clientName?: string; avatarUrl?: string }
): Promise<void> {
  await updateDoc(doc(db, "pixora_requests", id), {
    rating: data.rating,
    comment: data.comment,
    ...(data.clientName?.trim() ? { clientName: data.clientName.trim() } : {}),
    ...(data.avatarUrl ? { avatarUrl: data.avatarUrl } : {}),
    ratedAt: serverTimestamp(),
  });
}

// Public ratings are intentionally stored separately from private project
// requests so a visitor coming from WhatsApp can rate without creating a
// client account or gaining access to private request documents.
function maskPublicEmail(email: string): string {
  if (!email || !email.includes("@")) return "";
  const [local, domain] = email.split("@", 2);
  if (!local || !domain) return "";
  const visible = local.length <= 2 ? local.slice(0, 1) : local.slice(0, 2);
  return `${visible}${"*".repeat(Math.max(4, local.length - visible.length))}@${domain}`;
}

/**
 * Public Rate Us compatibility API.
 * Kept as a named export because the RateUsBox component uses this name.
 * It delegates to the same validated public-rating writer, so there is only
 * one save path and the existing portfolio/request flows are untouched.
 */
export async function ratePublicReview(data: {
  rating: number;
  comment: string;
  clientName?: string;
  clientEmail?: string;
  email?: string;
  avatarUrl?: string;
}): Promise<void> {
  return createPublicRating({
    rating: data.rating,
    comment: data.comment,
    clientName: data.clientName,
    clientEmail: data.clientEmail ?? data.email,
    avatarUrl: data.avatarUrl,
  });
}

export async function createPublicRating(data: {
  rating: number;
  comment: string;
  clientName?: string;
  clientEmail?: string;
  avatarUrl?: string;
}): Promise<void> {
  if (!Number.isInteger(data.rating) || data.rating < 1 || data.rating > 5) {
    throw new Error("Rating must be between 1 and 5.");
  }
  const comment = data.comment.trim();
  const clientName = data.clientName?.trim() || "";
  const clientEmail = data.clientEmail?.trim() || "";
  if (comment.length > 500 || clientName.length > 80 || clientEmail.length > 254) {
    throw new Error("Your rating contains too much text.");
  }
  if (clientEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clientEmail)) {
    throw new Error("Please enter a valid email address.");
  }
  await addDoc(collection(db, "pixora_testimonials"), {
    rating: data.rating,
    comment,
    ...(clientName ? { clientName } : {}),
    ...(clientEmail ? { clientEmail: maskPublicEmail(clientEmail) } : {}),
    ...(data.avatarUrl ? { avatarUrl: data.avatarUrl } : {}),
    category: "Client Feedback",
    featured: false,
    source: "public",
    status: "pending",
    createdAt: serverTimestamp(),
    ratedAt: serverTimestamp(),
  });
}

export async function deleteRequest(id: string): Promise<void> {
  await deleteDoc(doc(db, "pixora_requests", id));
}

export async function setRequestFeatured(
  id: string,
  featured: boolean
): Promise<void> {
  await updateDoc(doc(db, "pixora_requests", id), { featured });
}

// Public — used on the homepage "What Our Clients Say" section. Only
// requests an admin has explicitly marked as featured are returned, so
// nothing shows up until an admin picks it.
export async function listPublicRatingsForAdmin(): Promise<ProjectRequest[]> {
  const snap = await getDocs(collection(db, "pixora_testimonials"));
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      clientId: "public",
      clientEmail: typeof data.clientEmail === "string" ? data.clientEmail : "",
      clientName: typeof data.clientName === "string" ? data.clientName : undefined,
      avatarUrl: typeof data.avatarUrl === "string" ? data.avatarUrl : undefined,
      category: typeof data.category === "string" ? data.category : "Client Feedback",
      description: "",
      imageUrls: [],
      status: data.status === "approved" ? "completed" : "pending",
      rating: typeof data.rating === "number" ? data.rating : 0,
      comment: typeof data.comment === "string" ? data.comment : "",
      ratedAt: typeof data.ratedAt?.toMillis === "function" ? data.ratedAt.toMillis() : undefined,
      featured: data.featured === true,
    } as ProjectRequest;
  }).sort((a, b) => (b.ratedAt ?? 0) - (a.ratedAt ?? 0));
}

export async function approvePublicRating(id: string): Promise<void> {
  await updateDoc(doc(db, "pixora_testimonials", id), {
    status: "approved",
    featured: true,
    approvedAt: serverTimestamp(),
  });
}

export async function hidePublicRating(id: string): Promise<void> {
  await updateDoc(doc(db, "pixora_testimonials", id), {
    status: "pending",
    featured: false,
  });
}

export async function deletePublicRating(id: string): Promise<void> {
  await deleteDoc(doc(db, "pixora_testimonials", id));
}

export async function listFeaturedTestimonials(): Promise<ProjectRequest[]> {
  // IMPORTANT: this function is used by the public website. Never read
  // pixora_requests here because those documents are private to clients/admins.
  // Reading them from a public page causes PERMISSION_DENIED and makes a
  // successful Rate Us submission look like it failed when onRated() refreshes.
  try {
    const publicSnap = await getDocs(
      query(collection(db, "pixora_testimonials"), where("featured", "==", true))
    );

    const publicItems = publicSnap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        clientId: "public",
        clientEmail: typeof data.clientEmail === "string" ? data.clientEmail : "",
        clientName: typeof data.clientName === "string" ? data.clientName : undefined,
        avatarUrl: typeof data.avatarUrl === "string" ? data.avatarUrl : undefined,
        category: typeof data.category === "string" ? data.category : "Client Feedback",
        description: "",
        imageUrls: [],
        status: "completed" as const,
        rating: typeof data.rating === "number" ? data.rating : 0,
        comment: typeof data.comment === "string" ? data.comment : "",
        ratedAt: typeof data.ratedAt?.toMillis === "function" ? data.ratedAt.toMillis() : undefined,
        featured: true,
      };
    });

    return publicItems.sort((a, b) => (b.ratedAt ?? 0) - (a.ratedAt ?? 0));
  } catch (error) {
    // Public testimonials are optional. A Firebase rules/index problem here
    // must not break portfolio, hero, settings, or other Firebase-backed UI.
    console.error("Pixora: public testimonials unavailable", error);
    return [];
  }
}

// Live list of every request that could currently have an active chat —
// a client's own requests, or (for an admin) every approved request site
// -wide. This is deliberately the ONLY chat-related listener that's kept
// open on every page, so the site-wide "new message" toast can work no
// matter what page you're on without opening a listener per chat thread.
export function subscribeToRequestsForNotifications(
  role: "admin" | "client",
  uid: string,
  cb: (requests: ProjectRequest[]) => void,
  onError?: (err: unknown) => void
): Unsubscribe {
  const q =
    role === "admin"
      ? query(REQUESTS_COL, where("status", "==", "approved"))
      : query(REQUESTS_COL, where("clientId", "==", uid));

  return onSnapshot(
    q,
    (snap) => {
      cb(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<ProjectRequest, "id">) })));
    },
    (err) => {
      console.error("Pixora: request-notification listener error", err);
      onError?.(err);
    }
  );
}
