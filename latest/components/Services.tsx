"use client";

import { motion } from "framer-motion";
import { FaPalette, FaPen, FaFileAlt, FaDesktop, FaArrowRight } from "react-icons/fa";

const services = [
  {
    icon: <FaPalette />,
    title: "Brand Identity",
    text: "We create unique brand identities that define your business and connect with your audience.",
  },
  {
    icon: <FaPen />,
    title: "Logo Design",
    text: "Memorable logos that represent your brand's personality and values.",
  },
  {
    icon: <FaFileAlt />,
    title: "Print Design",
    text: "Brochures, flyers, posters and more — designed to communicate your message effectively.",
  },
  {
    icon: <FaDesktop />,
    title: "Digital Design",
    text: "Social media designs, banners, ads and digital assets that engage and convert.",
  },
];

export default function Services() {
  return (
    <section className="services" id="services">
      <div className="container">
        <div className="services-strip">
          {services.map((s, index) => (
            <motion.div
              key={s.title}
              className="service-item"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * .1 }}
              viewport={{ once: true }}
            >
              <div className="service-icon">{s.icon}</div>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
              <a href="#contact" className="service-arrow" aria-label={`Learn more about ${s.title}`}>
                <FaArrowRight />
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
