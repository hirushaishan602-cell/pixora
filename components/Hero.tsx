"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSiteData } from "@/context/SiteDataContext";

const SLIDE_INTERVAL_MS = 4000;

export default function Hero() {
  const { config } = useSiteData();
  const firstStat = config.stats[0];
  const artworks =
    config.heroArtworks && config.heroArtworks.length > 0
      ? config.heroArtworks
      : ["/images/hero.png"];
  const [activeIndex, setActiveIndex] = useState(0);

  // auto-advance to the next artwork every few seconds — pauses itself
  // automatically whenever there's only one image to show
  useEffect(() => {
    if (artworks.length <= 1) return;
    const timer = setInterval(() => {
      setActiveIndex((i) => (i + 1) % artworks.length);
    }, SLIDE_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [artworks.length]);

  // if artwork is removed in admin and the active index is now out of
  // range, just clamp it for rendering instead of a blank frame
  const safeIndex = activeIndex < artworks.length ? activeIndex : 0;

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

          <div className="hero-artwork-stage">
            <AnimatePresence mode="sync">
              <motion.div
                key={artworks[safeIndex]}
                className="hero-artwork-slide"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.7, ease: "easeInOut" }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={artworks[safeIndex]} alt={config.siteName} />
              </motion.div>
            </AnimatePresence>
          </div>

          {artworks.length > 1 && (
            <div className="hero-artwork-dots">
              {artworks.map((src, i) => (
                <button
                  key={src + i}
                  type="button"
                  className={i === safeIndex ? "active" : ""}
                  aria-label={`Show artwork ${i + 1}`}
                  onClick={() => setActiveIndex(i)}
                />
              ))}
            </div>
          )}

        </motion.div>

      </div>

    </section>
  );
}
