"use client";

import { useState } from "react";
import { useSiteData } from "@/context/SiteDataContext";

export default function Contact() {
  const { config } = useSiteData();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const lines = [
      `Name: ${name}`,
      email && `Email: ${email}`,
      phone && `Phone: ${phone}`,
      message && `Message: ${message}`,
    ].filter(Boolean);

    const text = lines.length ? lines.join("\n") : config.whatsappMessage;
    const link = `https://wa.me/${config.whatsappNumber}?text=${encodeURIComponent(text)}`;

    window.open(link, "_blank");
  };

  return (
    <section className="contact" id="contact">
      <div className="container contact-grid">

        <div>

          <span>CONTACT US</span>

          <h2>Let's Build Your Brand Together.</h2>

          <p>
            Ready to start your next project?
            Contact {config.siteName} today.
          </p>

        </div>

        <form className="contact-form" onSubmit={handleSubmit}>

          <input
            placeholder="Your Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            placeholder="Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          <textarea
            rows={6}
            placeholder="Your Message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          ></textarea>

          <button className="primary-btn" type="submit">
            Send via WhatsApp
          </button>

        </form>

      </div>
    </section>
  );
}
