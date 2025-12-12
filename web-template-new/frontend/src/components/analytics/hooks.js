// src/components/analytics/hooks.js
import { useEffect, useRef } from "react";

export function useSlideUpOnView() {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const bars = entry.target.querySelectorAll(".bar");
            bars.forEach((bar, index) => {
              bar.style.animation = "slideUp 0.5s ease-out forwards";
              bar.style.animationDelay = `${index * 0.1}s`;
            });
          }
        });
      },
      { threshold: 0.5 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return ref;
}

export function useMetricsAnimation() {
  const ref = useRef(null);

  useEffect(() => {
    const grid = ref.current;
    if (!grid) return;

    const items = grid.querySelectorAll(".metric-item");
    items.forEach((item) => {
      item.style.transform = "translateY(20px)";
      item.style.opacity = "0";
      item.style.transition = "all 0.5s ease";
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const metrics = entry.target.querySelectorAll(".metric-item");
            metrics.forEach((metric, index) => {
              setTimeout(() => {
                metric.style.transform = "translateY(0)";
                metric.style.opacity = "1";
              }, index * 100);
            });
          }
        });
      },
      { threshold: 0.3 }
    );

    observer.observe(grid);
    return () => observer.disconnect();
  }, []);

  return ref;
}
