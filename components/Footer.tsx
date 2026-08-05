"use client";

import Image from "next/image";
import {
  FaFacebookF,
  FaInstagram,
  FaTiktok,
  FaYoutube,
  FaLinkedinIn,
} from "react-icons/fa";
import { useSiteData } from "@/context/SiteDataContext";

export default function Footer() {
  const { config } = useSiteData();
  const { socialLinks } = config;

  const socials = [
    { href: socialLinks.facebook, icon: <FaFacebookF />, label: "Facebook" },
    { href: socialLinks.instagram, icon: <FaInstagram />, label: "Instagram" },
    { href: socialLinks.tiktok, icon: <FaTiktok />, label: "TikTok" },
    { href: socialLinks.youtube, icon: <FaYoutube />, label: "YouTube" },
    { href: socialLinks.linkedin, icon: <FaLinkedinIn />, label: "LinkedIn" },
  ].filter((s) => s.href);

  return (
    <footer className="footer">

      <div className="container footer-content">

        <div>

          <Image
            src="/images/logo.png"
            alt={config.siteName}
            width={680}
            height={192}
            className="footer-logo"
          />

          <p>{config.tagline}</p>

          {socials.length > 0 && (
            <div className="footer-socials">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                >
                  {s.icon}
                </a>
              ))}
            </div>
          )}

        </div>

        <div>

          <h4>Quick Links</h4>

          <ul>
            <li><a href="#">Home</a></li>
            <li><a href="#services">Services</a></li>
            <li><a href="#portfolio">Portfolio</a></li>
            <li><a href="#contact">Contact</a></li>
          </ul>

        </div>

        <div>

          <h4>Contact</h4>

          <p>{config.contactEmail}</p>

          <p>{config.contactPhone}</p>

          <p>{config.address}</p>

        </div>

      </div>

      <div className="copyright">
        © {new Date().getFullYear()} {config.siteName}. All Rights Reserved.
      </div>

    </footer>
  );
}
