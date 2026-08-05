"use client";

import { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useSiteData } from "@/context/SiteDataContext";
import { createRequest, uploadRequestImages } from "@/lib/requests";
import BackButton from "@/components/BackButton";

export default function RequestProjectPage() {
  const { user, role, loading } = useAuth();
  const { config } = useSiteData();
  const router = useRouter();

  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (role === "admin" || role === "mainAdmin") {
      router.replace("/admin");
    }
  }, [loading, user, role, router]);

  useEffect(() => {
    if (!category && config.projectCategories.length > 0) {
      setCategory(config.projectCategories[0]);
    }
  }, [config.projectCategories, category]);

  if (loading || !user || role === "admin" || role === "mainAdmin") {
    return (
      <div className="admin-auth-screen">
        <p>Loading...</p>
      </div>
    );
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!description.trim()) {
      setError("Please describe what you need.");
      return;
    }

    setSubmitting(true);
    try {
      const imageUrls = files.length > 0 ? await uploadRequestImages(files) : [];
      await createRequest({
        clientId: user.uid,
        clientEmail: user.email ?? "",
        category,
        description,
        imageUrls,
      });
      setDone(true);
    } catch {
      setError("Something went wrong while sending your request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="admin-auth-screen">
        <BackButton fallbackHref="/dashboard" />
        <div className="admin-auth-card request-success-card">
          <h1>Request Sent 🎉</h1>
          <p>
            Thanks! Our team will review your project and get back to you soon.
            You can track its progress on your dashboard.
          </p>
          <Link href="/dashboard" className="primary-btn">
            Go to My Dashboard →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-auth-screen">
      <BackButton fallbackHref="/dashboard" />
      <form className="admin-auth-card request-form-card" onSubmit={handleSubmit}>
        <h1>Let&apos;s Talk About Your Project</h1>
        <p>Tell us what you need and we&apos;ll take it from here.</p>

        <label>
          Project Type
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            {config.projectCategories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>

        <label>
          Explain your project
          <textarea
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Tell us about your brand, style preferences, deadlines, or anything else that helps..."
            required
          />
        </label>

        <label>
          Reference Photos (optional)
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
          />
        </label>

        {files.length > 0 && (
          <p className="request-file-count">{files.length} photo(s) selected</p>
        )}

        {error && <p className="admin-auth-error">{error}</p>}

        <button type="submit" className="primary-btn" disabled={submitting}>
          {submitting ? "Sending..." : "Send Request"}
        </button>
      </form>
    </div>
  );
}
