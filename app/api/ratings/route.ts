import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebaseAdmin";

export const runtime = "nodejs";

function clean(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export async function GET() {
  try {
    const snap = await getAdminDb()
      .collection("pixora_testimonials")
      .where("featured", "==", true)
      .get();

    const ratings = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json({ ratings });
  } catch (error) {
    console.error("Public ratings GET failed:", error);
    return NextResponse.json({ ratings: [], error: "Unable to load ratings" }, { status: 200 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const rating = Number(body?.rating);
    const comment = clean(body?.comment, 500);
    const clientName = clean(body?.clientName, 80);
    const clientEmail = clean(body?.clientEmail ?? body?.email, 254);
    const avatarUrl = clean(body?.avatarUrl, 2000);

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating must be between 1 and 5." }, { status: 400 });
    }
    if (!comment) {
      return NextResponse.json({ error: "Comment is required." }, { status: 400 });
    }
    if (clientEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clientEmail)) {
      return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
    }

    const local = clientEmail.split("@")[0] ?? "";
    const domain = clientEmail.split("@")[1] ?? "";
    const maskedEmail = clientEmail
      ? `${(local.slice(0, 2) || local.slice(0, 1))}${"*".repeat(Math.max(4, local.length - 2))}@${domain}`
      : "";

    const ref = await getAdminDb().collection("pixora_testimonials").add({
      rating,
      comment,
      ...(clientName ? { clientName } : {}),
      ...(maskedEmail ? { clientEmail: maskedEmail } : {}),
      ...(avatarUrl ? { avatarUrl } : {}),
      category: "Client Feedback",
      featured: false,
      source: "public",
      status: "pending",
      createdAt: FieldValue.serverTimestamp(),
      ratedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ id: ref.id, saved: true }, { status: 201 });
  } catch (error) {
    console.error("Public rating POST failed:", error);
    return NextResponse.json({ error: "Unable to save rating." }, { status: 500 });
  }
}
