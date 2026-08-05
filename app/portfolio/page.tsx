"use client";

import { useMemo, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsApp from "@/components/Whatsapp";
import ScrollTop from "@/components/ScrollTop";
import { useSiteData } from "@/context/SiteDataContext";

export default function PortfolioPage() {
  const { projects, loading, config } = useSiteData();
  const [activeCategory, setActiveCategory] = useState("All");

  const categories = useMemo(() => {
    const set = new Set(
      projects.map((p) => p.category).filter((c): c is string => Boolean(c))
    );
    return ["All", ...Array.from(set)];
  }, [projects]);

  const visibleProjects = useMemo(() => {
    if (activeCategory === "All") return projects;
    return projects.filter((p) => p.category === activeCategory);
  }, [projects, activeCategory]);

  return (
    <>
      <Navbar />

      <section className="portfolio-page">
        <div className="container">
          <div className="portfolio-page-intro">
            <span>OUR WORK</span>
            <h1>
              Full <em>Portfolio</em>
            </h1>
            <p>
              A complete look at the branding, print and digital design
              projects {config.siteName} has delivered for our clients.
            </p>
          </div>

          {categories.length > 1 && (
            <div className="portfolio-filter-bar">
              {categories.map((cat) => (
                <button
                  key={cat}
                  className={activeCategory === cat ? "active" : ""}
                  onClick={() => setActiveCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          {loading ? (
            <div className="portfolio-page-state">
              <p>Loading projects...</p>
            </div>
          ) : visibleProjects.length === 0 ? (
            <div className="portfolio-page-state">
              <p>
                {projects.length === 0
                  ? "No projects have been added yet. Check back soon!"
                  : "No projects in this category yet."}
              </p>
            </div>
          ) : (
            <div className="portfolio-masonry">
              {visibleProjects.map((project) => (
                <div key={project.id} className="portfolio-masonry-item">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={project.imageUrl} alt={project.title} loading="lazy" />
                  <div className="portfolio-masonry-caption">
                    {project.category && <span>{project.category}</span>}
                    <h3>{project.title}</h3>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
      <WhatsApp />
      <ScrollTop />
    </>
  );
}
