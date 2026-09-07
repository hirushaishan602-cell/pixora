import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import { Project } from "./types";
import { uploadToCloudinary } from "./cloudinary";

const PROJECTS_COL = collection(db, "pixora_projects");

export async function getProjects(): Promise<Project[]> {
  // Do not require every legacy project document to have an `order` field.
  // Firestore orderBy() silently excludes documents missing that field, which
  // can make an existing portfolio suddenly appear empty after a data update.
  const snap = await getDocs(PROJECTS_COL);
  const items = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Project, "id">) }));
  return items.sort((a, b) => {
    const orderA = typeof a.order === "number" ? a.order : Number.MAX_SAFE_INTEGER;
    const orderB = typeof b.order === "number" ? b.order : Number.MAX_SAFE_INTEGER;
    if (orderA !== orderB) return orderA - orderB;
    const createdA = typeof a.createdAt === "number" ? a.createdAt : 0;
    const createdB = typeof b.createdAt === "number" ? b.createdAt : 0;
    return createdB - createdA;
  });
}

export async function uploadProjectImage(file: File): Promise<string> {
  return uploadToCloudinary(file, "pixora-projects");
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

export async function deleteProject(id: string, _imageUrl: string = ""): Promise<void> {
  // Note: the Cloudinary image itself isn't deleted here — deleting a
  // Cloudinary asset requires a signed request (API secret), which can't
  // be done safely from the browser. Only the Firestore record is removed;
  // the now-unused image can be cleaned up from the Cloudinary dashboard
  // if needed.
  await deleteDoc(doc(db, "pixora_projects", id));
}
