"use client";

import { motion } from "framer-motion";

const testimonials = [
  {
    name: "Kasun Perera",
    role: "Business Owner",
    review:
      "PIXORA transformed our brand identity with outstanding creativity and professionalism.",
  },
  {
    name: "Nadeesha Silva",
    role: "Restaurant Owner",
    review:
      "Amazing logo design and social media creatives. Highly recommended!",
  },
  {
    name: "Tharindu Fernando",
    role: "Startup Founder",
    review:
      "Professional service, fast delivery and premium quality designs.",
  },
];

export default function Testimonials() {
  return (
    <section className="testimonials">
      <div className="container">

        <div className="section-title">
          <span>TESTIMONIALS</span>
          <h2>What Our Clients Say</h2>
        </div>

        <div className="testimonial-grid">
          {testimonials.map((item, index) => (
            <motion.div
              key={index}
              className="testimonial-card"
              whileHover={{ y: -10 }}
            >
              <p>"{item.review}"</p>

              <h3>{item.name}</h3>

              <span>{item.role}</span>

            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}