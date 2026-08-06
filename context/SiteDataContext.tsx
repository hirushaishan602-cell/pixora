"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { getSiteConfig } from "@/lib/siteConfig";
import { getProjects } from "@/lib/projects";
import { listFeaturedTestimonials } from "@/lib/requests";
import { SiteConfig, Project, ProjectRequest, defaultSiteConfig } from "@/lib/types";

type SiteDataContextValue = {
  config: SiteConfig;
  projects: Project[];
  testimonials: ProjectRequest[];
  loading: boolean;
  refresh: () => Promise<void>;
};

const SiteDataContext = createContext<SiteDataContextValue | undefined>(
  undefined
);

export function SiteDataProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<SiteConfig>(defaultSiteConfig);
  const [projects, setProjects] = useState<Project[]>([]);
  const [testimonials, setTestimonials] = useState<ProjectRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const [cfg, projs, reviews] = await Promise.all([
        getSiteConfig(),
        getProjects(),
        listFeaturedTestimonials(),
      ]);
      setConfig(cfg);
      setProjects(projs);
      setTestimonials(reviews);
    } catch (err) {
      // keep defaults if Firebase isn't configured yet — but log so it's
      // easy to spot in devtools if projects/config aren't showing up
      console.error("Pixora: failed to load site data from Firebase", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <SiteDataContext.Provider
      value={{ config, projects, testimonials, loading, refresh: load }}
    >
      {children}
    </SiteDataContext.Provider>
  );
}

export function useSiteData() {
  const ctx = useContext(SiteDataContext);
  if (!ctx) throw new Error("useSiteData must be used within SiteDataProvider");
  return ctx;
}
