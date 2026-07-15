"use client";

import { useEffect, useRef, useState, useCallback } from "react";

/**
 * Zero-dependency carousel. Drop-in replacement for the small subset of
 * react-slideshow-image's <Slide> / react-slick's <Slider> API that this
 * project actually used: autoplay, dot indicators, swipe.
 *
 * Props:
 * - duration: ms between auto-advances (default 3000)
 * - indicators: show dot indicators (default true)
 * - autoplay: default true
 * - children: slides (array of nodes)
 */
export default function SimpleSlider({
  children,
  duration = 3000,
  indicators = true,
  autoplay = true,
}) {
  const slides = Array.isArray(children) ? children.filter(Boolean) : [children];
  const [index, setIndex] = useState(0);
  const timerRef = useRef(null);
  const touchStartX = useRef(null);

  const goTo = useCallback(
    (i) => {
      if (slides.length === 0) return;
      setIndex(((i % slides.length) + slides.length) % slides.length);
    },
    [slides.length]
  );

  const next = useCallback(() => goTo(index + 1), [goTo, index]);

  useEffect(() => {
    if (!autoplay || slides.length <= 1) return;
    timerRef.current = setInterval(next, duration);
    return () => clearInterval(timerRef.current);
  }, [autoplay, duration, next, slides.length]);

  if (slides.length === 0) return null;

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) > 40) {
      goTo(delta < 0 ? index + 1 : index - 1);
    }
    touchStartX.current = null;
  };

  return (
    <div
      className="simple-slider"
      style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden" }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          transform: `translateX(-${index * 100}%)`,
          transition: "transform 0.5s ease",
        }}
      >
        {slides.map((slide, i) => (
          <div key={i} style={{ flex: "0 0 100%", width: "100%", height: "100%" }}>
            {slide}
          </div>
        ))}
      </div>

      {indicators && slides.length > 1 && (
        <div
          style={{
            position: "absolute",
            bottom: "8px",
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            gap: "6px",
            zIndex: 2,
          }}
        >
          {slides.map((_, i) => (
            <button
              key={i}
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => goTo(i)}
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                border: "none",
                padding: 0,
                cursor: "pointer",
                background: i === index ? "#ffffff" : "rgba(255,255,255,0.5)",
                boxShadow: "0 0 2px rgba(0,0,0,0.6)",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Named export too, so existing `import { Slide } from "..."` call sites
// need only change the import path, not the usage.
export { SimpleSlider as Slide };
