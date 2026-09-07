import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCLDCkyTs17_DTdvwHEjnbPbDrb_alUoac",
  authDomain: "pixora-ad6a8.firebaseapp.com",
  databaseURL: "https://pixora-ad6a8-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "pixora-ad6a8",
  storageBucket: "pixora-ad6a8.firebasestorage.app",
  messagingSenderId: "612800173987",
  appId: "1:612800173987:web:4292963f3c3825fe86ac16",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
