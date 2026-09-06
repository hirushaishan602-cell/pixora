"use client";

import { useEffect, useState, FormEvent } from "react";
import Image from "next/image";
import {
  getProjects,
  addProject,
  updateProject,
  deleteProject,
  uploadProjectImage,
} from "@/lib/projects";
import { Project } from "@/lib/types";

const emptyForm = { title: "", category: "", description: "" };

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [file, setFile] = useState<File | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    const data = await getProjects();
    setProjects(data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setFile(null);
    setEditingId(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!editingId && !file) {
      setError("Please choose an image for the project.");
      return;
    }

    setSaving(true);
    try {
      if (editingId) {
        const updates: Partial<Omit<Project, "id">> = { ...form };
        if (file) {
          updates.imageUrl = await uploadProjectImage(file);
        }
        await updateProject(editingId, updates);
      } else {
        const imageUrl = await uploadProjectImage(file as File);
        await addProject({
          ...form,
          imageUrl,
          order: projects.length,
        });
      }
      resetForm();
      await load();
    } catch {
      setError("Something went wrong while saving the project.");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (project: Project) => {
    setEditingId(project.id);
    setForm({
      title: project.title,
      category: project.category,
      description: project.description,
    });
    setFile(null);
  };

  const handleDelete = async (project: Project) => {
    if (!confirm(`Delete "${project.title}"?`)) return;
    await deleteProject(project.id, project.imageUrl);
    await load();
  };

  return (
    <div className="admin-page">
      <h1>Projects</h1>
      <p className="admin-subtitle">
        These show up in the Portfolio section on your homepage.
      </p>

      <form className="admin-form" onSubmit={handleSubmit}>
        <h2>{editingId ? "Edit Project" : "Add New Project"}</h2>

        <div className="admin-form-row">
          <label>
            Title
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
          </label>

          <label>
            Category
            <input
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              placeholder="e.g. Branding, Social Media"
              required
            />
          </label>
        </div>

        <label>
          Description
          <textarea
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </label>

        <label>
          Project Image {editingId && "(leave empty to keep current image)"}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </label>

        {error && <p className="admin-auth-error">{error}</p>}

        <div className="admin-form-actions">
          <button type="submit" className="primary-btn" disabled={saving}>
            {saving ? "Saving..." : editingId ? "Update Project" : "Add Project"}
          </button>
          {editingId && (
            <button type="button" className="outline-btn" onClick={resetForm}>
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="admin-table-wrap">
        {loading ? (
          <p>Loading...</p>
        ) : projects.length === 0 ? (
          <p>No projects yet. Add your first one above.</p>
        ) : (
          <div className="admin-project-grid">
            {projects.map((project) => (
              <div key={project.id} className="admin-project-card">
                <div className="admin-project-image">
                  <Image
                    src={project.imageUrl}
                    alt={project.title}
                    width={300}
                    height={220}
                    unoptimized
                  />
                </div>
                <div className="admin-project-info">
                  <span>{project.category}</span>
                  <h3>{project.title}</h3>
                  <div className="admin-project-actions">
                    <button onClick={() => handleEdit(project)}>Edit</button>
                    <button onClick={() => handleDelete(project)} className="danger">
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
