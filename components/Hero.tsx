"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useSiteData } from "@/context/SiteDataContext";

export default function Hero() {
  const { config } = useSiteData();
  const firstStat = config.stats[0];

  return (
    <section className="hero">

      <div className="hero-blur blur-one"></div>
      <div className="hero-blur blur-two"></div>

      <div className="container hero-wrapper">

        <motion.div
          className="hero-content"
          initial={{ opacity: 0, x: -80 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: .8 }}
        >

          <span className="hero-tag">
            {config.heroTag}
          </span>

          <h1>
            {config.heroTitle}
          </h1>

          <p>
            {config.heroDescription}
          </p>

          <div className="hero-buttons">

            <a href="/portfolio" className="primary-btn">
              View Portfolio →
            </a>

            <a href="#contact" className="outline-btn">
              Get Started
            </a>

          </div>

          {firstStat && (
            <div className="hero-rating">

              <div className="circle">5★</div>

              <div>

                <strong>{firstStat.number}</strong>

                <p>{firstStat.text}</p>

              </div>

            </div>
          )}

        </motion.div>

        <motion.div
          className="hero-image"
          initial={{ opacity: 0, y: 80 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: .8 }}
        >

          <div className="image-glow"></div>

          <Image
            src="/images/hero.png"
            alt={config.siteName}
            width={900}
            height={900}
            priority
          />

        </motion.div>

      </div>

    </section>
  );
}
