"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useSiteData } from "@/context/SiteDataContext";

export default function About() {
  const { config } = useSiteData();

  return (
    <section className="about" id="about">
      <div className="container about-grid">

        <motion.div
          className="about-image"
          initial={{ opacity: 0, x: -80 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: .7 }}
          viewport={{ once: true }}
        >
          <Image
            src="/images/work1.jpg"
            alt={`About ${config.siteName}`}
            width={700}
            height={700}
          />
        </motion.div>

        <motion.div
          className="about-content"
          initial={{ opacity: 0, x: 80 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: .7 }}
          viewport={{ once: true }}
        >
          <span>ABOUT {config.siteName}</span>

          <h2>
            {config.aboutTitle}
          </h2>

          <p>
            {config.aboutText}
          </p>

          <div className="about-list">
            <div>✔ Professional Branding</div>
            <div>✔ Modern UI & Graphic Design</div>
            <div>✔ Print & Advertising Solutions</div>
            <div>✔ Fast Delivery & Support</div>
          </div>

          <a href="#contact" className="primary-btn">
            Let's Work Together →
          </a>

        </motion.div>

      </div>
    </section>
  );
}
