"use client";

import { motion } from "framer-motion";
import { useSiteData } from "@/context/SiteDataContext";

export default function Stats() {
  const { config } = useSiteData();

  const link = `https://wa.me/${config.whatsappNumber}?text=${encodeURIComponent(
    config.whatsappMessage
  )}`;

  return (
    <section className="stats">
      <div className="container stats-bar">

        {config.stats.slice(0, 3).map((item, index) => (
          <motion.div
            key={index}
            className="stat-box"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: index * .15 }}
            viewport={{ once: true }}
          >
            <h2>{item.number}</h2>
            <p>{item.text}</p>
          </motion.div>
        ))}

        <motion.div
          className="stats-cta"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: .45 }}
          viewport={{ once: true }}
        >
          <h3>{config.ctaTitle}</h3>
          <a href={link} target="_blank" rel="noopener noreferrer" className="primary-btn">
            {config.ctaButtonText} →
          </a>
        </motion.div>

      </div>
    </section>
  );
}
