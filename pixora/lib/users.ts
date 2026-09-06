import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  orderBy,
  query,
} from "firebase/firestore";
import { db } from "./firebase";
import { AppUser, Role } from "./types";

const USERS_COL = collection(db, "pixora_users");

export async function getUserRole(uid: string): Promise<Role | null> {
  const snap = await getDoc(doc(db, "pixora_users", uid));
  if (!snap.exists()) return null;
  return (snap.data().role as Role) ?? "user";
}

export async function listUsers(): Promise<AppUser[]> {
  const q = query(USERS_COL, orderBy("createdAt", "asc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ uid: d.id, ...(d.data() as Omit<AppUser, "uid">) }));
}

export async function setUserRole(uid: string, role: Role): Promise<void> {
  await updateDoc(doc(db, "pixora_users", uid), { role });
}
