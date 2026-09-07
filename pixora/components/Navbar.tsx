"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaTiktok } from "react-icons/fa";
import { useSiteData } from "@/context/SiteDataContext";
import { useAuth } from "@/context/AuthContext";

const links = [
  { name: "Home", href: "#" },
  { name: "About", href: "#about" },
  { name: "Services", href: "#services" },
  { name: "Portfolio", href: "#portfolio" },
  { name: "Contact", href: "#contact" },
];

export default function Navbar() {
  const { config } = useSiteData();
  const { user, role, loading } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [logoError, setLogoError] = useState(false);

  const isAdmin = role === "admin" || role === "mainAdmin";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);

    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const rail = [
    { href: config.socialLinks.facebook, icon: <FaFacebookF /> },
    { href: config.socialLinks.linkedin, icon: <FaLinkedinIn /> },
    { href: config.socialLinks.instagram, icon: <FaInstagram /> },
    { href: config.socialLinks.tiktok, icon: <FaTiktok /> },
  ].filter((s) => s.href);

  return (
    <>
      <header className={`navbar ${scrolled ? "navbar-scrolled" : ""}`}>
        <div className="container navbar-inner">
          <Link href="/" className="navbar-logo">
            {logoError ? (
              <span className="navbar-logo-text">{config.siteName}</span>
            ) : (
              <Image
                src="/images/logo.png"
                alt={config.siteName}
                width={170}
                height={48}
                priority
                onError={() => setLogoError(true)}
              />
            )}
            <span className="navbar-logo-tag">{config.tagline}</span>
          </Link>

          <nav className="navbar-links">
            {links.map((link) => (
              <Link key={link.name} href={link.href}>
                {link.name}
              </Link>
            ))}
          </nav>

          <div className="navbar-auth">
            {loading ? null : !user ? (
              <>
                <Link href="/login" className="outline-btn navbar-login-btn">
                  Login
                </Link>
                <Link href="/signup" className="primary-btn">
                  Sign Up →
                </Link>
              </>
            ) : isAdmin ? (
              <Link href="/admin" className="primary-btn">
                Dashboard →
              </Link>
            ) : (
              <Link href="/request" className="primary-btn">
                Let's Talk →
              </Link>
            )}
          </div>
        </div>
      </header>

      {rail.length > 0 && (
        <div className="navbar-social-rail">
          {rail.map((s, i) => (
            <a key={i} href={s.href} target="_blank" rel="noopener noreferrer">
              {s.icon}
            </a>
          ))}
        </div>
      )}
    </>
  );
}
