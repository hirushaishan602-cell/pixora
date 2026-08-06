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

  // Nothing to show until an admin marks at least one rated project as
  // featured — stay blank instead of showing fake/placeholder reviews.
  if (testimonials.length === 0) return null;

  return (
    <section className="testimonials">
      <div className="container">

        <div className="section-title">
          <span>TESTIMONIALS</span>
          <h2>What Our Clients Say</h2>
        </div>

        <div className="testimonial-grid">
          {testimonials.map((item) => (
            <motion.div
              key={item.id}
              className="testimonial-card"
              whileHover={{ y: -10 }}
            >
              <div className="testimonial-stars">
                {[1, 2, 3, 4, 5].map((n) => (
                  <FaStar
                    key={n}
                    className={n <= (item.rating ?? 0) ? "star-filled" : "star-empty"}
                  />
                ))}
              </div>

              {item.comment && <p>"{item.comment}"</p>}

              <h3>{displayName(item)}</h3>

              <span>{item.category}</span>

            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
