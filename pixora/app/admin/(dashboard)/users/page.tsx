"use client";

import { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { listUsers, setUserRole } from "@/lib/users";
import { AppUser } from "@/lib/types";

export default function AdminUsersPage() {
  const { user, role } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (role && role !== "mainAdmin") {
      router.replace("/admin");
    }
  }, [role, router]);

  const load = async () => {
    setLoading(true);
    const data = await listUsers();
    setUsers(data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setCreating(true);
    try {
      const idToken = await user?.getIdToken();
      const res = await fetch("/api/admin/create-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create admin");
      }
      setSuccess(`${email} was added as an admin.`);
      setEmail("");
      setPassword("");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create admin");
    } finally {
      setCreating(false);
    }
  };

  const handleDemote = async (targetUid: string) => {
    if (!confirm("Remove admin access for this user?")) return;
    await setUserRole(targetUid, "user");
    await load();
  };

  const handlePromote = async (targetUid: string) => {
    await setUserRole(targetUid, "admin");
    await load();
  };

  if (role !== "mainAdmin") return null;

  return (
    <div className="admin-page">
      <h1>Admin Users</h1>
      <p className="admin-subtitle">
        As the main admin, you can add new admins for this site.
      </p>

      <form className="admin-form" onSubmit={handleCreate}>
        <h2>Add New Admin</h2>
        <div className="admin-form-row">
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
            Temporary Password
            <input
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              required
            />
          </label>
        </div>

        {error && <p className="admin-auth-error">{error}</p>}
        {success && <p className="admin-saved-msg">{success}</p>}

        <div className="admin-form-actions">
          <button type="submit" className="primary-btn" disabled={creating}>
            {creating ? "Adding..." : "Add Admin"}
          </button>
        </div>
      </form>

      <div className="admin-table-wrap">
        {loading ? (
          <p>Loading...</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Role</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.uid}>
                  <td>{u.email}</td>
                  <td>
                    <span className="admin-role-tag">
                      {u.role === "mainAdmin" ? "Main Admin" : u.role}
                    </span>
                  </td>
                  <td>
                    {u.role === "admin" && (
                      <button onClick={() => handleDemote(u.uid)} className="danger">
                        Remove Admin
                      </button>
                    )}
                    {u.role === "user" && (
                      <button onClick={() => handlePromote(u.uid)}>
                        Make Admin
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
