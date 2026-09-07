import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";

/**
 * Called once right after a user logs in / signs up.
 * If their email matches MAIN_ADMIN_EMAIL (set in .env.local), they are
 * automatically promoted to "mainAdmin" — no need to open Firebase Console
 * and manually create a pixora_users document with a copy-pasted UID.
 *
 * Safe to call every time: it's a no-op once the role is already correct,
 * and it does nothing at all if MAIN_ADMIN_EMAIL isn't configured.
 */
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization") || "";
    const idToken = authHeader.replace("Bearer ", "");
    if (!idToken) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const decoded = await adminAuth.verifyIdToken(idToken);
    const mainAdminEmail = process.env.MAIN_ADMIN_EMAIL?.toLowerCase().trim();

    if (!mainAdminEmail || decoded.email?.toLowerCase() !== mainAdminEmail) {
      return NextResponse.json({ promoted: false });
    }

    const userRef = adminDb.collection("pixora_users").doc(decoded.uid);
    const snap = await userRef.get();

    if (snap.exists && snap.data()?.role === "mainAdmin") {
      return NextResponse.json({ promoted: false });
    }

    await userRef.set(
      {
        email: decoded.email,
        role: "mainAdmin",
        ...(snap.exists ? {} : { createdAt: FieldValue.serverTimestamp() }),
      },
      { merge: true }
    );

    return NextResponse.json({ promoted: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to sync role";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
