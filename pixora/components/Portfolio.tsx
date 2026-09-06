"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion } from "framer-motion";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { useSiteData } from "@/context/SiteDataContext";

export default function Portfolio() {
  const { projects, loading } = useSiteData();
  const trackRef = useRef<HTMLDivElement>(null);

  if (!loading && projects.length === 0) return null;

  const scroll = (dir: 1 | -1) => {
    trackRef.current?.scrollBy({ left: dir * 340, behavior: "smooth" });
  };

  return (
    <section className="portfolio" id="portfolio">
      <div className="container portfolio-layout">

        <div className="portfolio-intro">
          <span>FEATURED WORK</span>
          <h2>
            Designs That<br />
            <em>Define Brands</em>
          </h2>
          <p>Every project is an opportunity to create something unique and impactful.</p>
          <a href="#portfolio" className="outline-btn">
            View All Projects →
          </a>
        </div>

        <div className="portfolio-track-wrap">
          <div className="portfolio-arrows">
            <button onClick={() => scroll(-1)} aria-label="Previous">
              <FaArrowLeft />
            </button>
            <button onClick={() => scroll(1)} className="active" aria-label="Next">
              <FaArrowRight />
            </button>
          </div>

          <div className="portfolio-track" ref={trackRef}>
            {projects.map((project, index) => (
              <motion.div
                key={project.id}
                className="portfolio-card"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: (index % 4) * .1 }}
                viewport={{ once: true }}
              >
                <div className="portfolio-image">
                  <Image
                    src={project.imageUrl}
                    alt={project.title}
                    width={600}
                    height={450}
                    unoptimized
                  />
                </div>
                <div className="portfolio-info">
                  <h3>{project.title}</h3>
                  {project.category && <span>{project.category}</span>}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
