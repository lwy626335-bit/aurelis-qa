"use client";

import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef } from "react";

if (typeof window !== "undefined") gsap.registerPlugin(useGSAP, ScrollTrigger);

export function DashboardOverviewMotion({ children }: { children: React.ReactNode }) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (typeof window.matchMedia !== "function") return;
      const media = gsap.matchMedia();
      media.add("(prefers-reduced-motion: no-preference)", () => {
        const intro = gsap.timeline({ defaults: { duration: 0.48, ease: "power3.out" } });
        intro
          .fromTo("[data-demo-header]", { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0 })
          .fromTo("[data-demo-mode]", { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0 }, "-=0.3")
          .fromTo("[data-score-summary]", { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.58 }, "-=0.24")
          .fromTo("[data-priority-finding]", { autoAlpha: 0, x: 12 }, { autoAlpha: 1, x: 0, stagger: 0.07 }, "-=0.34");

        gsap.utils.toArray<HTMLElement>("[data-demo-section]").forEach((section) => {
          gsap.fromTo(
            section,
            { autoAlpha: 0.68, y: 12 },
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.52,
              ease: "power3.out",
              scrollTrigger: { trigger: section, start: "top 86%", once: true },
            },
          );
        });
      });
      media.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set("[data-demo-header], [data-demo-mode], [data-score-summary], [data-priority-finding], [data-demo-section]", {
          clearProps: "transform,opacity,visibility",
        });
      });
      return () => media.revert();
    },
    { scope: root },
  );

  return <div className="contents" ref={root}>{children}</div>;
}
