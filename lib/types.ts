export type SocialLinks = {
  facebook?: string;
  instagram?: string;
  tiktok?: string;
  youtube?: string;
  linkedin?: string;
  whatsapp?: string;
};

export type StatItem = {
  number: string;
  text: string;
};

export type SiteConfig = {
  siteName: string;
  tagline: string;
  heroTag: string;
  heroTitle: string;
  heroDescription: string;
  aboutTitle: string;
  aboutText: string;
  contactEmail: string;
  contactPhone: string;
  whatsappNumber: string;
  whatsappMessage: string;
  address: string;
  ctaTitle: string;
  ctaButtonText: string;
  socialLinks: SocialLinks;
  stats: StatItem[];
  projectCategories: string[];
};

export const defaultSiteConfig: SiteConfig = {
  siteName: "PIXORA",
  tagline: "Graphic Design | Branding | Advertising",
  heroTag: "PIXORA GRAPHIC DESIGN",
  heroTitle: "We Create Premium Branding & Digital Experiences",
  heroDescription:
    "Logo Design, Brand Identity, Social Media Designs, Packaging, Printing and everything your business needs to stand out.",
  aboutTitle: "Building Powerful Brands Through Creative Design.",
  aboutText:
    "At PIXORA, we specialize in branding, logo design, advertising, social media creatives and print solutions. Every design is crafted to make your business memorable and professional.",
  contactEmail: "info@pixora.com",
  contactPhone: "+94 77 123 4567",
  whatsappNumber: "94700000000",
  whatsappMessage: "Hi PIXORA, I'd like to know more about your services.",
  address: "Colombo, Sri Lanka",
  ctaTitle: "Ready to start your project?",
  ctaButtonText: "Let's Create Something Great",
  socialLinks: {
    facebook: "",
    instagram: "",
    tiktok: "",
    youtube: "",
    linkedin: "",
  },
  stats: [
    { number: "250+", text: "Projects Completed" },
    { number: "120+", text: "Happy Clients" },
    { number: "5+", text: "Years Experience" },
    { number: "99%", text: "Client Satisfaction" },
  ],
  projectCategories: [
    "Logo Design",
    "Brand Identity",
    "Social Media Design",
    "Packaging Design",
    "Print & Advertising",
    "Web / UI Design",
  ],
};

export type Project = {
  id: string;
  title: string;
  category: string;
  description: string;
  imageUrl: string;
  order: number;
  createdAt?: number;
};

export type Role = "mainAdmin" | "admin" | "user";

export type AppUser = {
  uid: string;
  email: string;
  name?: string;
  role: Role;
  createdAt?: number;
};

export type RequestStatus = "pending" | "approved" | "completed";

export type ProjectRequest = {
  id: string;
  clientId: string;
  clientEmail: string;
  clientName?: string;
  category: string;
  description: string;
  imageUrls: string[];
  status: RequestStatus;
  createdAt?: number;

  approvedBy?: string; // admin email who approved
  approvedByUid?: string;
  approvedAt?: number;

  deliverableUrl?: string;
  deliverableNote?: string;
  completedBy?: string; // admin email who completed
  completedAt?: number;

  rating?: number;
  comment?: string;
  ratedAt?: number;

  // set by an admin once they decide a client's rating/comment is good
  // enough to show publicly in the homepage "What Our Clients Say" section
  featured?: boolean;
};
