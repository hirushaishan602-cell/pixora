import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization") || "";
    const idToken = authHeader.replace("Bearer ", "");

    if (!idToken) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const decoded = await adminAuth.verifyIdToken(idToken);
    const requesterDoc = await adminDb.collection("pixora_users").doc(decoded.uid).get();
    const requesterRole = requesterDoc.exists ? requesterDoc.data()?.role : null;

    if (requesterRole !== "mainAdmin") {
      return NextResponse.json(
        { error: "Only the main admin can add new admins" },
        { status: 403 }
      );
    }

    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    const newUser = await adminAuth.createUser({ email, password });

    await adminDb.collection("pixora_users").doc(newUser.uid).set({
      email,
      role: "admin",
      createdAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ uid: newUser.uid, email });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create user";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
