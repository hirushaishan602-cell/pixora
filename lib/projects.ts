import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import { Project } from "./types";

const PROJECTS_COL = collection(db, "pixora_projects");

// Project images are hosted on Cloudinary (unsigned upload preset) instead
// of Firebase Storage — only the resulting image URL is stored in Firestore.
const CLOUDINARY_CLOUD_NAME = "drf1c9d3o";
const CLOUDINARY_UPLOAD_PRESET = "pixora";

export async function getProjects(): Promise<Project[]> {
  const q = query(PROJECTS_COL, orderBy("order", "asc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Project, "id">) }));
}

export async function uploadProjectImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
  formData.append("folder", "pixora-projects");

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
    { method: "POST", body: formData }
  );

  if (!res.ok) {
    throw new Error("Cloudinary upload failed. Check the cloud name / upload preset.");
  }

  const data = await res.json();
  return data.secure_url as string;
}

export async function addProject(
  data: Omit<Project, "id" | "createdAt">
): Promise<void> {
  await addDoc(PROJECTS_COL, {
    ...data,
    createdAt: serverTimestamp(),
  });
}

export async function updateProject(
  id: string,
  data: Partial<Omit<Project, "id">>
): Promise<void> {
  await updateDoc(doc(db, "pixora_projects", id), data);
}

export async function deleteProject(id: string): Promise<void> {
  // Note: the Cloudinary image itself isn't deleted here — deleting a
  // Cloudinary asset requires a signed request (API secret), which can't
  // be done safely from the browser. Only the Firestore record is removed;
  // the now-unused image can be cleaned up from the Cloudinary dashboard
  // if needed.
  await deleteDoc(doc(db, "pixora_projects", id));
}
