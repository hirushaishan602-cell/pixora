import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env."AIzaSyCLDCkyTs17_DTdvwHEjnbPbDrb_alUoac",
  authDomain: process.env."pixora-ad6a8.firebaseapp.com",
  projectId: process.env."pixora-ad6a8",
  storageBucket: process.env."pixora-ad6a8.firebasestorage.app",
  messagingSenderId: process.env."612800173987",
  appId: process.env."1:612800173987:web:4292963f3c3825fe86ac16",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
