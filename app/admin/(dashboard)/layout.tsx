"use client";

import { useEffect, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import BackButton from "@/components/BackButton";

export default function AdminDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { user, role, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/admin/login");
      return;
    }
    if (role !== "admin" && role !== "mainAdmin") {
      router.replace("/admin/login");
    }
  }, [loading, user, role, router]);

  if (loading || !user || (role !== "admin" && role !== "mainAdmin")) {
    return (
      <div className="admin-auth-screen">
        <p>Loading...</p>
      </div>
    );
  }

  const navItems = [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/projects", label: "Portfolio Projects" },
    { href: "/admin/requests", label: "Client Requests" },
    { href: "/admin/social", label: "Social Media" },
    { href: "/admin/settings", label: "Site Settings" },
    ...(role === "mainAdmin"
      ? [{ href: "/admin/users", label: "Admin Users" }]
      : []),
  ];

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <BackButton fallbackHref="/" label="Back" />
        <div className="admin-logo">PIXORA Admin</div>

        <nav className="admin-nav">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={pathname === item.href ? "active" : ""}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <p>{user.email}</p>
          <span className="admin-role-tag">{role === "mainAdmin" ? "Main Admin" : "Admin"}</span>
          <button onClick={() => logout().then(() => router.push("/admin/login"))}>
            Log Out
          </button>
        </div>
      </aside>

      <main className="admin-content">{children}</main>
    </div>
  );
}
