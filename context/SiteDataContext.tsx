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
    // Keep each public Firebase collection independent. A permission/index
    // problem in testimonials must never prevent projects or site settings
    // from rendering. This is especially important because public ratings
    // are intentionally stored separately from private requests.
    setLoading(true);

    const [cfgResult, projectsResult, testimonialsResult] = await Promise.allSettled([
      getSiteConfig(),
      getProjects(),
      listFeaturedTestimonials(),
    ]);

    if (cfgResult.status === "fulfilled") {
      setConfig(cfgResult.value);
    } else {
      console.error("Pixora: failed to load site config", cfgResult.reason);
    }

    if (projectsResult.status === "fulfilled") {
      setProjects(projectsResult.value);
    } else {
      console.error("Pixora: failed to load projects from Firebase", projectsResult.reason);
    }

    if (testimonialsResult.status === "fulfilled") {
      setTestimonials(testimonialsResult.value);
    } else {
      // Testimonials are optional public content. Never blank the rest of
      // the site when this collection is unavailable.
      console.error("Pixora: failed to load public testimonials", testimonialsResult.reason);
    }

    setLoading(false);
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
