"use client";

import { useEffect, useState, FormEvent } from "react";
import { getSiteConfig, updateSiteConfig } from "@/lib/siteConfig";
import { SiteConfig, defaultSiteConfig } from "@/lib/types";

export default function AdminSettingsPage() {
  const [config, setConfig] = useState<SiteConfig>(defaultSiteConfig);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getSiteConfig().then((c) => {
      setConfig(c);
      setLoading(false);
    });
  }, []);

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    await updateSiteConfig(config);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const updateStat = (index: number, key: "number" | "text", value: string) => {
    const stats = [...config.stats];
    stats[index] = { ...stats[index], [key]: value };
    setConfig({ ...config, stats });
  };

  if (loading) return <div className="admin-page"><p>Loading...</p></div>;

  return (
    <div className="admin-page">
      <h1>Site Settings</h1>
      <p className="admin-subtitle">
        Everything here updates the live website instantly.
      </p>

      <form className="admin-form admin-settings-form" onSubmit={handleSave}>
        <h2>Brand</h2>
        <div className="admin-form-row">
          <label>
            Site Name
            <input
              value={config.siteName}
              onChange={(e) => setConfig({ ...config, siteName: e.target.value })}
            />
          </label>
          <label>
            Tagline
            <input
              value={config.tagline}
              onChange={(e) => setConfig({ ...config, tagline: e.target.value })}
            />
          </label>
        </div>

        <h2>Hero Section</h2>
        <label>
          Hero Tag
          <input
            value={config.heroTag}
            onChange={(e) => setConfig({ ...config, heroTag: e.target.value })}
          />
        </label>
        <label>
          Hero Title
          <input
            value={config.heroTitle}
            onChange={(e) => setConfig({ ...config, heroTitle: e.target.value })}
          />
        </label>
        <label>
          Hero Description
          <textarea
            rows={3}
            value={config.heroDescription}
            onChange={(e) =>
              setConfig({ ...config, heroDescription: e.target.value })
            }
          />
        </label>

        <h2>About Section</h2>
        <label>
          About Title
          <input
            value={config.aboutTitle}
            onChange={(e) => setConfig({ ...config, aboutTitle: e.target.value })}
          />
        </label>
        <label>
          About Text
          <textarea
            rows={3}
            value={config.aboutText}
            onChange={(e) => setConfig({ ...config, aboutText: e.target.value })}
          />
        </label>

        <h2>Stats</h2>
        <div className="admin-form-row admin-stats-row">
          {config.stats.map((stat, i) => (
            <div key={i} className="admin-stat-input">
              <input
                value={stat.number}
                onChange={(e) => updateStat(i, "number", e.target.value)}
                placeholder="250+"
              />
              <input
                value={stat.text}
                onChange={(e) => updateStat(i, "text", e.target.value)}
                placeholder="Projects Completed"
              />
            </div>
          ))}
        </div>

        <h2>Call To Action (stats bar)</h2>
        <div className="admin-form-row">
          <label>
            CTA Title
            <input
              value={config.ctaTitle}
              onChange={(e) => setConfig({ ...config, ctaTitle: e.target.value })}
            />
          </label>
          <label>
            CTA Button Text
            <input
              value={config.ctaButtonText}
              onChange={(e) => setConfig({ ...config, ctaButtonText: e.target.value })}
            />
          </label>
        </div>

        <h2>Contact</h2>
        <div className="admin-form-row">
          <label>
            Contact Email
            <input
              value={config.contactEmail}
              onChange={(e) => setConfig({ ...config, contactEmail: e.target.value })}
            />
          </label>
          <label>
            Contact Phone (display)
            <input
              value={config.contactPhone}
              onChange={(e) => setConfig({ ...config, contactPhone: e.target.value })}
            />
          </label>
        </div>
        <label>
          Address
          <input
            value={config.address}
            onChange={(e) => setConfig({ ...config, address: e.target.value })}
          />
        </label>

        <h2>WhatsApp</h2>
        <div className="admin-form-row">
          <label>
            WhatsApp Number (with country code, no + or spaces)
            <input
              value={config.whatsappNumber}
              onChange={(e) =>
                setConfig({ ...config, whatsappNumber: e.target.value })
              }
              placeholder="94771234567"
            />
          </label>
        </div>
        <label>
          Default WhatsApp Message
          <textarea
            rows={2}
            value={config.whatsappMessage}
            onChange={(e) =>
              setConfig({ ...config, whatsappMessage: e.target.value })
            }
          />
        </label>

        <h2>Project Categories</h2>
        <p className="admin-inline-note">
          These show up as the &quot;Project Type&quot; options clients choose from when they
          submit a request.
        </p>
        <div className="admin-category-list">
          {config.projectCategories.map((cat, i) => (
            <div key={i} className="admin-category-item">
              <input
                value={cat}
                onChange={(e) => {
                  const categories = [...config.projectCategories];
                  categories[i] = e.target.value;
                  setConfig({ ...config, projectCategories: categories });
                }}
              />
              <button
                type="button"
                className="danger"
                onClick={() => {
                  const categories = config.projectCategories.filter((_, idx) => idx !== i);
                  setConfig({ ...config, projectCategories: categories });
                }}
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            className="outline-btn"
            onClick={() =>
              setConfig({
                ...config,
                projectCategories: [...config.projectCategories, ""],
              })
            }
          >
            + Add Category
          </button>
        </div>

        <h2>Social Media Links</h2>
        <p className="admin-inline-note">
          Manage these on the dedicated <strong>Social Media</strong> page in the sidebar.
        </p>

        <div className="admin-form-actions">
          <button type="submit" className="primary-btn" disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </button>
          {saved && <span className="admin-saved-msg">Saved ✓</span>}
        </div>
      </form>
    </div>
  );
}
