"use client";

import { motion } from "framer-motion";
import { FaStar } from "react-icons/fa";
import { useSiteData } from "@/context/SiteDataContext";
import { ProjectRequest } from "@/lib/types";

// Never show the client's email publicly. Prefer their saved name; if
// they signed up without one, turn the email's local part into a
// presentable name instead (e.g. "kasun.perera92" -> "Kasun Perera").
function displayName(item: ProjectRequest): string {
  if (item.clientName && item.clientName.trim()) return item.clientName.trim();

  const local = item.clientEmail?.split("@")[0] ?? "";
  const cleaned = local.replace(/[\d._+-]+/g, " ").trim();
  if (!cleaned) return "Happy Client";

  return cleaned
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" ");
}

export default function Testimonials() {
  const { testimonials } = useSiteData();

  if (testimonials.length === 0) return null;

  return (
    <section className="testimonials" id="testimonials">
      <div className="container">
        <div className="section-title testimonials-heading">
          <span>CLIENT LOVE</span>
          <h2>What Our Clients Say</h2>
          <p>Real feedback from clients who trusted PIXORA with their projects.</p>
        </div>

        <div className="testimonial-grid">
          {testimonials.map((item, index) => {
            const name = displayName(item);
            const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
            const rating = Math.min(5, Math.max(0, item.rating ?? 0));

            return (
              <motion.article
                key={item.id}
                className="testimonial-card"
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.45, delay: index * 0.06 }}
                whileHover={{ y: -7 }}
              >
                <div className="testimonial-card-top">
                  <div className="testimonial-avatar" aria-hidden="true">{initials || "C"}</div>
                  <div className="testimonial-client">
                    <h3>{name}</h3>
                    <span>{item.category}</span>
                  </div>
                  <div className="testimonial-quote">“</div>
                </div>

                <div className="testimonial-stars" aria-label={`${rating} out of 5 stars`}>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <FaStar key={n} className={n <= rating ? "star-filled" : "star-empty"} />
                  ))}
                </div>

                <p className="testimonial-comment">{item.comment || "Thank you for choosing PIXORA!"}</p>
                <div className="testimonial-footer">
                  <span>Verified client</span>
                  <strong>{rating}.0 / 5</strong>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
