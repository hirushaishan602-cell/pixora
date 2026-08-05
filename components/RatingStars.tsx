"use client";

import { useState } from "react";
import { FaStar } from "react-icons/fa";

export default function RatingStars({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: number) => void;
}) {
  const [hover, setHover] = useState(0);

  return (
    <div className="rating-stars">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          className="rating-star-btn"
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(n)}
          aria-label={`Rate ${n} star${n > 1 ? "s" : ""}`}
        >
          <FaStar className={n <= (hover || value) ? "star-filled" : "star-empty"} />
        </button>
      ))}
    </div>
  );
}
