"use client";

import { useEffect, useState, FormEvent } from "react";
import { getSiteConfig, updateSiteConfig } from "@/lib/siteConfig";
import { SiteConfig, defaultSiteConfig, SocialLinks } from "@/lib/types";

const fields: { key: keyof SocialLinks; label: string; placeholder: string }[] = [
  { key: "facebook", label: "Facebook", placeholder: "https://facebook.com/yourpage" },
  { key: "instagram", label: "Instagram", placeholder: "https://instagram.com/yourpage" },
  { key: "tiktok", label: "TikTok", placeholder: "https://tiktok.com/@yourpage" },
  { key: "youtube", label: "YouTube", placeholder: "https://youtube.com/@yourpage" },
  { key: "linkedin", label: "LinkedIn", placeholder: "https://linkedin.com/company/yourpage" },
  { key: "whatsapp", label: "WhatsApp", placeholder: "https://wa.me/94771234567" },
];

export default function AdminSocialPage() {
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

  if (loading) return <div className="admin-page"><p>Loading...</p></div>;

  return (
    <div className="admin-page">
      <h1>Social Media</h1>
      <p className="admin-subtitle">
        These links power the icons in your navbar and footer.
      </p>

      <form className="admin-form" onSubmit={handleSave}>
        <h2>Manage Links</h2>

        {fields.map((f) => (
          <label key={f.key}>
            {f.label}
            <input
              value={config.socialLinks[f.key] ?? ""}
              onChange={(e) =>
                setConfig({
                  ...config,
                  socialLinks: { ...config.socialLinks, [f.key]: e.target.value },
                })
              }
              placeholder={f.placeholder}
            />
          </label>
        ))}

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
