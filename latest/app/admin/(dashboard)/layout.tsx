"use client";

import { useEffect, useState, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { FaBars, FaTimes } from "react-icons/fa";
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
  const [menuOpen, setMenuOpen] = useState(false);

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

  // collapse the mobile menu whenever the page changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMenuOpen(false);
  }, [pathname]);

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
      <aside className={`admin-sidebar ${menuOpen ? "menu-open" : ""}`}>
        <div className="admin-sidebar-top">
          <BackButton fallbackHref="/" label="Back" />
          <div className="admin-logo">PIXORA Admin</div>
          <button
            type="button"
            className="admin-sidebar-burger"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>

        <div className="admin-sidebar-collapsible">
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
        </div>
      </aside>

      {menuOpen && (
        <div className="admin-sidebar-backdrop" onClick={() => setMenuOpen(false)} />
      )}

      <main className="admin-content">{children}</main>
    </div>
  );
}
