import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  setDoc,
  serverTimestamp,
  orderBy,
  query,
} from "firebase/firestore";
import { db, default as firebaseApp } from "./firebase";
import { getAuth, createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { getApp, initializeApp } from "firebase/app";
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


/**
 * Creates an admin account without a Next.js API route. This keeps the
 * GitHub Pages/static-export deployment compatible while preserving the
 * existing Firebase Auth + Firestore admin workflow. A secondary Firebase
 * app is used so the currently signed-in main admin is not logged out.
 */
export async function createAdminAccount(
  email: string,
  password: string,
  createdByUid: string
): Promise<void> {
  if (!email || !password) throw new Error("Email and password are required.");
  if (password.length < 6) throw new Error("Password must be at least 6 characters.");

  const mainUser = await getDoc(doc(db, "pixora_users", createdByUid));
  if (!mainUser.exists() || mainUser.data()?.role !== "mainAdmin") {
    throw new Error("Only the main admin can add new admins.");
  }

  const appName = "pixora-admin-account-creator";
  const secondaryApp = (() => {
    try { return getApp(appName); }
    catch { return initializeApp(firebaseApp.options, appName); }
  })();
  const secondaryAuth = getAuth(secondaryApp);

  try {
    const credential = await createUserWithEmailAndPassword(secondaryAuth, email, password);
    await setDoc(doc(db, "pixora_users", credential.user.uid), {
      email,
      role: "admin",
      createdAt: serverTimestamp(),
    });
  } finally {
    try { await signOut(secondaryAuth); } catch { /* best effort */ }
  }
}
