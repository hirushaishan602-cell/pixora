"use client";

import { useMemo, useState } from "react";
import { FaChevronLeft, FaChevronRight, FaStar } from "react-icons/fa";
import { useSiteData } from "@/context/SiteDataContext";
import { ProjectRequest } from "@/lib/types";

function maskEmail(email?: string): string {
  if (!email || !email.includes("@")) return "Happy Client";
  const [local, domain] = email.split("@");
  if (!local) return `***@${domain}`;
  const visible = local.length <= 2 ? local[0] : local.slice(0, 2);
  return `${visible}${"*".repeat(Math.max(3, local.length - visible.length))}@${domain}`;
}

function displayName(item: ProjectRequest): string {
  return item.clientName?.trim() || maskEmail(item.clientEmail);
}

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase() || "C";
}

export default function Testimonials() {
  const { testimonials } = useSiteData();
  const [active, setActive] = useState(0);
  const items = useMemo(() => testimonials, [testimonials]);

  if (!items.length) return null;

  const go = (step: number) => setActive((current) => (current + step + items.length) % items.length);
  const card = (offset: number) => items[(active + offset + items.length) % items.length];

  const renderCard = (item: ProjectRequest, position: "side-left" | "center" | "side-right") => {
    const name = displayName(item);
    const rating = Math.min(5, Math.max(0, item.rating ?? 0));
    return (
      <article className={`testimonial-showcase-card ${position}`} key={`${item.id}-${position}`}>
        <div className="testimonial-card-glow" />
        <div className="testimonial-avatar-wrap">
          {item.avatarUrl ? (
            <img src={item.avatarUrl} alt="Client profile" className="testimonial-avatar-image" />
          ) : <span>{initials(name)}</span>}
        </div>
        <div className="testimonial-client-copy">
          <h3>{name}</h3>
          <span>{item.category}</span>
        </div>
        <div className="testimonial-stars" aria-label={`${rating} out of 5 stars`}>
          {[1, 2, 3, 4, 5].map((n) => <FaStar key={n} className={n <= rating ? "star-filled" : "star-empty"} />)}
        </div>
        <p className="testimonial-comment">{item.comment || "Thank you for choosing PIXORA!"}</p>
        <div className="testimonial-card-meta">
          <span>Verified client</span>
          <strong>{rating}/5</strong>
        </div>
      </article>
    );
  };

  return (
    <section className="testimonials" id="testimonials">
      <div className="container">
        <div className="section-title testimonials-heading">
          <span>CLIENT LOVE</span>
          <h2>What Our Clients Say <em>About Us</em></h2>
          <p>Real feedback from clients who trusted PIXORA with their projects.</p>
        </div>

        <div className="testimonial-carousel" aria-live="polite">
          {items.length > 1 && <button className="testimonial-nav testimonial-nav-left" onClick={() => go(-1)} aria-label="Previous testimonial"><FaChevronLeft /></button>}
          <div className="testimonial-stage">
            {items.length > 2 && renderCard(card(-1), "side-left")}
            {renderCard(card(0), "center")}
            {items.length > 1 && renderCard(card(1), "side-right")}
          </div>
          {items.length > 1 && <button className="testimonial-nav testimonial-nav-right" onClick={() => go(1)} aria-label="Next testimonial"><FaChevronRight /></button>}
        </div>

        {items.length > 1 && <div className="testimonial-dots">{items.map((item, index) => <button key={item.id} className={index === active ? "active" : ""} onClick={() => setActive(index)} aria-label={`Show testimonial ${index + 1}`} />)}</div>}
      </div>
    </section>
  );
}
