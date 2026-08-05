"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaTiktok, FaBars, FaTimes } from "react-icons/fa";
import { useSiteData } from "@/context/SiteDataContext";
import { useAuth } from "@/context/AuthContext";

const links = [
  { name: "Home", href: "/" },
  { name: "About", href: "/#about" },
  { name: "Services", href: "/#services" },
  { name: "Portfolio", href: "/portfolio" },
  { name: "Contact", href: "/#contact" },
];

export default function Navbar() {
  const { config } = useSiteData();
  const { user, role, loading, logout } = useAuth();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const isAdmin = role === "admin" || role === "mainAdmin";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);

    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // close the mobile menu on route change / resize back to desktop
  useEffect(() => {
    if (!menuOpen) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

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
              <>
                <Link href="/dashboard" className="outline-btn navbar-login-btn">
                  Dashboard
                </Link>
                <Link href="/request" className="primary-btn">
                  Let's Talk →
                </Link>
                <button
                  className="outline-btn navbar-login-btn"
                  onClick={() => logout().then(() => router.push("/"))}
                >
                  Log Out
                </button>
              </>
            )}
          </div>

          <button
            className={`navbar-burger ${menuOpen ? "open" : ""}`}
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </header>

      <div className={`navbar-mobile-menu ${menuOpen ? "open" : ""}`}>
        <nav>
          {links.map((link) => (
            <Link key={link.name} href={link.href} onClick={closeMenu}>
              {link.name}
            </Link>
          ))}
        </nav>

        <div className="navbar-mobile-auth">
          {loading ? null : !user ? (
            <>
              <Link href="/login" className="outline-btn" onClick={closeMenu}>
                Login
              </Link>
              <Link href="/signup" className="primary-btn" onClick={closeMenu}>
                Sign Up →
              </Link>
            </>
          ) : isAdmin ? (
            <Link href="/admin" className="primary-btn" onClick={closeMenu}>
              Dashboard →
            </Link>
          ) : (
            <>
              <Link href="/dashboard" className="outline-btn" onClick={closeMenu}>
                Dashboard
              </Link>
              <Link href="/request" className="primary-btn" onClick={closeMenu}>
                Let's Talk →
              </Link>
              <button
                className="outline-btn"
                onClick={() => {
                  closeMenu();
                  logout().then(() => router.push("/"));
                }}
              >
                Log Out
              </button>
            </>
          )}
        </div>
      </div>

      {menuOpen && <div className="navbar-mobile-backdrop" onClick={closeMenu}></div>}

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
