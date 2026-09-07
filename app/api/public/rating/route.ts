import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebaseAdmin";

export const runtime = "nodejs";

const MAX_COMMENT = 500;
const MAX_NAME = 80;
const MAX_EMAIL = 254;
const MAX_AVATAR_URL = 2000;

function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  const visible = local.length <= 2 ? local.slice(0, 1) : local.slice(0, 2);
  return `${visible}${"*".repeat(Math.max(3, local.length - visible.length))}@${domain}`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rating = Number(body?.rating);
    const comment = typeof body?.comment === "string" ? body.comment.trim() : "";
    const clientName = typeof body?.clientName === "string" ? body.clientName.trim() : "";
    const clientEmail = typeof body?.clientEmail === "string" ? body.clientEmail.trim().toLowerCase() : "";
    const avatarUrl = typeof body?.avatarUrl === "string" ? body.avatarUrl.trim() : "";

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating must be between 1 and 5." }, { status: 400 });
    }
    if (!comment || comment.length > MAX_COMMENT) {
      return NextResponse.json({ error: "Please enter a review of 1–500 characters." }, { status: 400 });
    }
    if (clientName.length > MAX_NAME || clientEmail.length > MAX_EMAIL || avatarUrl.length > MAX_AVATAR_URL) {
      return NextResponse.json({ error: "One of the fields is too long." }, { status: 400 });
    }
    if (clientEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clientEmail)) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }
    if (avatarUrl && !/^https:\/\//i.test(avatarUrl)) {
      return NextResponse.json({ error: "Invalid profile photo URL." }, { status: 400 });
    }

    await adminDb.collection("pixora_testimonials").add({
      rating,
      comment,
      ...(clientName ? { clientName } : {}),
      ...(clientEmail ? { clientEmail: maskEmail(clientEmail) } : {}),
      ...(avatarUrl ? { avatarUrl } : {}),
      category: "Client Feedback",
      featured: true,
      source: "public",
      createdAt: FieldValue.serverTimestamp(),
      ratedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    console.error("Pixora: public rating save failed", error);
    return NextResponse.json({ error: "Could not save your rating." }, { status: 500 });
  }
}
