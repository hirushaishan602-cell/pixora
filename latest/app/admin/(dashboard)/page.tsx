"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getProjects } from "@/lib/projects";
import { listAllRequests } from "@/lib/requests";
import { useAuth } from "@/context/AuthContext";

export default function AdminDashboardHome() {
  const { role } = useAuth();
  const [projectCount, setProjectCount] = useState<number | null>(null);
  const [pendingCount, setPendingCount] = useState<number | null>(null);

  useEffect(() => {
    getProjects().then((p) => setProjectCount(p.length));
    listAllRequests().then((r) =>
      setPendingCount(r.filter((req) => req.status === "pending").length)
    );
  }, []);

  return (
    <div className="admin-page">
      <h1>Dashboard</h1>
      <p className="admin-subtitle">A quick overview of your site.</p>

      <div className="admin-cards">
        <Link href="/admin/requests" className="admin-card">
          <span className="admin-card-value">
            {pendingCount === null ? "..." : pendingCount}
          </span>
          <span className="admin-card-label">Pending Client Requests</span>
        </Link>

        <Link href="/admin/projects" className="admin-card">
          <span className="admin-card-value">
            {projectCount === null ? "..." : projectCount}
          </span>
          <span className="admin-card-label">Portfolio Projects</span>
        </Link>

        <Link href="/admin/social" className="admin-card">
          <span className="admin-card-value">🔗</span>
          <span className="admin-card-label">Social Media</span>
        </Link>

        <Link href="/admin/settings" className="admin-card">
          <span className="admin-card-value">⚙</span>
          <span className="admin-card-label">Site Settings</span>
        </Link>

        {role === "mainAdmin" && (
          <Link href="/admin/users" className="admin-card">
            <span className="admin-card-value">👤</span>
            <span className="admin-card-label">Admin Users</span>
          </Link>
        )}
      </div>
    </div>
  );
}
