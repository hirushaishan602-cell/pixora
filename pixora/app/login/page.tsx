"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getUserRole } from "@/lib/users";
import { auth } from "@/lib/firebase";
import BackButton from "@/components/BackButton";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      // figure out where to send them: admins go to the admin dashboard,
      // everyone else goes back to the site.
      const currentUser = auth.currentUser;
      if (currentUser) {
        // make sure a first-time mainAdmin (matching MAIN_ADMIN_EMAIL) is
        // promoted before we check their role, so the redirect is correct
        // the very first time they log in.
        try {
          const idToken = await currentUser.getIdToken();
          await fetch("/api/admin/sync-role", {
            method: "POST",
            headers: { Authorization: `Bearer ${idToken}` },
          });
        } catch {
          // ignore - not critical
        }

        const role = await getUserRole(currentUser.uid);
        if (role === "admin" || role === "mainAdmin") {
          router.push("/admin");
          return;
        }
      }
      router.push("/");
    } catch {
      setError("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-auth-screen">
      <BackButton />
      <form className="admin-auth-card" onSubmit={handleSubmit}>
        <h1>Welcome Back</h1>
        <p>Log in to your PIXORA account.</p>

        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>

        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>

        {error && <p className="admin-auth-error">{error}</p>}

        <button type="submit" className="primary-btn" disabled={loading}>
          {loading ? "Signing in..." : "Log In"}
        </button>

        <p className="auth-switch-link">
          Don&apos;t have an account? <Link href="/signup">Sign up</Link>
        </p>
      </form>
    </div>
  );
}
