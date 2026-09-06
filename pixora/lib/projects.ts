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
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { db, storage } from "./firebase";
import { Project } from "./types";

const PROJECTS_COL = collection(db, "pixora_projects");

export async function getProjects(): Promise<Project[]> {
  const q = query(PROJECTS_COL, orderBy("order", "asc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Project, "id">) }));
}

export async function uploadProjectImage(file: File): Promise<string> {
  const path = `pixora-projects/${Date.now()}-${file.name}`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
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

export async function deleteProject(id: string, imageUrl?: string): Promise<void> {
  await deleteDoc(doc(db, "pixora_projects", id));
  if (imageUrl) {
    try {
      const imageRef = ref(storage, imageUrl);
      await deleteObject(imageRef);
    } catch {
      // image may already be gone or not a storage URL - ignore
    }
  }
}
