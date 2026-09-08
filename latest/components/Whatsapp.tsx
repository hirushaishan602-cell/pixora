"use client";

import { FaWhatsapp } from "react-icons/fa";
import { useSiteData } from "@/context/SiteDataContext";

export default function WhatsApp() {
  const { config } = useSiteData();

  const link = `https://wa.me/${config.whatsappNumber}?text=${encodeURIComponent(
    config.whatsappMessage
  )}`;

  return (
    <a href={link} target="_blank" className="whatsapp" rel="noopener noreferrer">
      <FaWhatsapp />
    </a>
  );
}
