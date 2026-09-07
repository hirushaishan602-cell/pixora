import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebaseAdmin";

export const runtime = "nodejs";

function maskPublicEmail(email: string): string {
  if (!email || !email.includes("@")) return "";
  const [local, domain] = email.split("@", 2);
  const visible = local.length <= 2 ? local.slice(0, 1) : local.slice(0, 2);
  return `${visible}${"*".repeat(Math.max(4, local.length - visible.length))}@${domain}`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const rating = Number(body?.rating);
    const comment = typeof body?.comment === "string" ? body.comment.trim() : "";
    const clientName = typeof body?.clientName === "string" ? body.clientName.trim() : "";
    const clientEmail = typeof body?.clientEmail === "string" ? body.clientEmail.trim() : "";
    const avatarUrl = typeof body?.avatarUrl === "string" ? body.avatarUrl.trim() : "";

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating must be between 1 and 5." }, { status: 400 });
    }
    if (!comment || comment.length > 500 || clientName.length > 80 || clientEmail.length > 254) {
      return NextResponse.json({ error: "Please check the rating details." }, { status: 400 });
    }
    if (clientEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clientEmail)) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }
    if (avatarUrl.length > 2000) {
      return NextResponse.json({ error: "Profile photo URL is too long." }, { status: 400 });
    }

    const ref = getAdminDb().collection("pixora_testimonials").doc();
    await ref.set({
      rating,
      comment,
      ...(clientName ? { clientName } : {}),
      ...(clientEmail ? { clientEmail: maskPublicEmail(clientEmail) } : {}),
      ...(avatarUrl ? { avatarUrl } : {}),
      category: "Client Feedback",
      featured: false,
      source: "public",
      status: "pending",
      createdAt: FieldValue.serverTimestamp(),
      ratedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    console.error("Pixora rating API error", error);
    return NextResponse.json({ error: "Could not save your rating. Please try again." }, { status: 500 });
  }
}
