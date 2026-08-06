"use client";

import { motion } from "framer-motion";
import { FaStar } from "react-icons/fa";
import { useSiteData } from "@/context/SiteDataContext";

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

              <h3>{item.clientName || item.clientEmail}</h3>

              <span>{item.category}</span>

            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
