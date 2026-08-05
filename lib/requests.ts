import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "./firebase";
import { ProjectRequest } from "./types";

const REQUESTS_COL = collection(db, "pixora_requests");

export async function uploadRequestImage(file: File): Promise<string> {
  const path = `pixora-requests/${Date.now()}-${file.name}`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}

export async function uploadRequestImages(files: File[]): Promise<string[]> {
  return Promise.all(files.map((f) => uploadRequestImage(f)));
}

export async function createRequest(data: {
  clientId: string;
  clientEmail: string;
  category: string;
  description: string;
  imageUrls: string[];
}): Promise<void> {
  await addDoc(REQUESTS_COL, {
    ...data,
    status: "pending",
    createdAt: serverTimestamp(),
  });
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
  data: { rating: number; comment: string }
): Promise<void> {
  await updateDoc(doc(db, "pixora_requests", id), {
    rating: data.rating,
    comment: data.comment,
    ratedAt: serverTimestamp(),
  });
}

export async function deleteRequest(id: string): Promise<void> {
  await deleteDoc(doc(db, "pixora_requests", id));
}
