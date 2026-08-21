"use client";

import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef } from "react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export function LandingMotion({ children }: { children: React.ReactNode }) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const media = gsap.matchMedia();

      media.add(
        {
          motionAllowed: "(prefers-reduced-motion: no-preference)",
          desktop: "(min-width: 768px)",
        },
        (context) => {
          const { motionAllowed, desktop } = context.conditions ?? {};

          if (!motionAllowed) {
            gsap.set("[data-motion]", { clearProps: "all" });
            return;
          }

          const hero = gsap.timeline({ defaults: { ease: "power3.out" } });
          hero
            .from("[data-hero-copy] > *", { autoAlpha: 0, y: 24, duration: 0.72, stagger: 0.075 })
            .from("[data-hero-visual]", { autoAlpha: 0, x: 28, scale: 0.985, duration: 0.9 }, "-=0.54")
            .from("[data-hero-rule]", { scaleX: 0, transformOrigin: "left center", duration: 0.75 }, "-=0.64");

          gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((element) => {
            gsap.from(element, {
              autoAlpha: 0,
              y: 34,
              duration: 0.78,
              ease: "power3.out",
              scrollTrigger: {
                trigger: element,
                start: "top 84%",
                once: true,
              },
            });
          });

          if (desktop) {
            gsap.to("[data-ambient]", {
              yPercent: 12,
              ease: "none",
              scrollTrigger: {
                trigger: "[data-hero]",
                start: "top top",
                end: "bottom top",
                scrub: 0.7,
              },
            });
          }
        },
      );

      return () => media.revert();
    },
    { scope: root },
  );

  return <div ref={root}>{children}</div>;
}
