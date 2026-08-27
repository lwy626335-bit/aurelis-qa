"use client";

import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef } from "react";

if (typeof window !== "undefined") gsap.registerPlugin(useGSAP, ScrollTrigger);

export function LandingMotion({ children }: { children: React.ReactNode }) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const media = gsap.matchMedia();

      media.add(
        {
          motionAllowed: "(prefers-reduced-motion: no-preference)",
          desktop: "(min-width: 1024px)",
        },
        (context) => {
          const { motionAllowed, desktop } = context.conditions ?? {};

          if (!motionAllowed) {
            gsap.set("[data-hero-eyebrow], [data-hero-title] > span, [data-hero-description], [data-hero-actions], [data-hero-rule] > span, [data-hero-visual], [data-hero-layer], [data-hero-axis], [data-reveal], [data-principle], [data-principle-line], [data-method-step], [data-method-line], [data-score-panel]", { clearProps: "all" });
            gsap.set("[data-hero-scan]", { autoAlpha: 0, clearProps: "transform" });
            return;
          }

          const heroVisual = root.current?.querySelector<HTMLElement>("[data-hero-visual]");
          const heroScan = root.current?.querySelector<HTMLElement>("[data-hero-scan]");
          const hero = gsap.timeline({ defaults: { ease: "power3.out" } });

          hero
            .from("[data-hero-eyebrow]", { autoAlpha: 0, y: 10, duration: 0.46 }, 0.05)
            .from("[data-hero-title] > span", { autoAlpha: 0, y: 34, duration: 0.82 }, 0.16)
            .from("[data-hero-visual]", { autoAlpha: 0, scale: 0.985, duration: 0.7 }, 0.18)
            .from("[data-hero-layer]", { autoAlpha: 0, y: 24, scale: 0.985, duration: 0.72, stagger: 0.18 }, 0.46)
            .from("[data-hero-description]", { autoAlpha: 0, y: 18, duration: 0.68 }, 0.64)
            .from("[data-hero-actions]", { autoAlpha: 0, y: 14, duration: 0.58 }, 0.82)
            .from("[data-hero-rule] > span", { scaleX: 0, transformOrigin: "left center", duration: 0.8 }, 0.92)
            .from("[data-hero-axis]", { autoAlpha: 0, x: -10, duration: 0.5 }, 1.12);

          if (heroVisual && heroScan) {
            hero
              .fromTo(
                heroScan,
                { autoAlpha: 0, y: 0 },
                {
                  autoAlpha: 0.9,
                  y: () => Math.max(heroVisual.offsetHeight - 1, 0),
                  duration: 1.3,
                  ease: "power2.inOut",
                },
                0.3,
              )
              .to(heroScan, { autoAlpha: 0, duration: 0.24 }, 1.54);
          }

          gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((element) => {
            gsap.from(element, {
              autoAlpha: 0,
              y: 14,
              duration: 0.56,
              ease: "power3.out",
              scrollTrigger: {
                trigger: element,
                start: "top 86%",
                once: true,
              },
            });
          });

          gsap.from("[data-principle]", {
            autoAlpha: 0,
            x: (index) => (index % 2 === 0 ? -10 : 12),
            duration: 0.58,
            ease: "power3.out",
            stagger: 0.08,
            scrollTrigger: {
              trigger: "[data-principles]",
              start: "top 84%",
              once: true,
            },
          });

          gsap.fromTo(
            "[data-principle-line]",
            { scaleY: 0, transformOrigin: "top center" },
            {
              scaleY: 1,
              duration: 1.1,
              ease: "power2.out",
              scrollTrigger: {
                trigger: "[data-principles]",
                start: "top 84%",
                once: true,
              },
            },
          );

          gsap.from("[data-method-step]", {
            autoAlpha: 0,
            y: 16,
            duration: 0.58,
            ease: "power3.out",
            stagger: 0.1,
            scrollTrigger: {
              trigger: "[data-methodology]",
              start: "top 82%",
              once: true,
            },
          });

          gsap.from("[data-score-panel]", {
            autoAlpha: 0,
            y: 18,
            duration: 0.64,
            ease: "power3.out",
            stagger: 0.14,
            scrollTrigger: {
              trigger: "[data-score-panel]",
              start: "top 82%",
              once: true,
            },
          });

          if (desktop) {
            const layers = gsap.utils.toArray<HTMLElement>("[data-hero-layer]");
            const moveLayer = layers.map((layer, index) => gsap.quickTo(layer, "x", {
              duration: 0.45 + index * 0.04,
              ease: "power3.out",
            }));
            const handlePointerMove = (event: PointerEvent) => {
              if (!heroVisual) return;
              const bounds = heroVisual.getBoundingClientRect();
              const offset = (event.clientX - bounds.left) / bounds.width - 0.5;
              moveLayer.forEach((move, index) => move(offset * (4 + index * 2)));
            };
            const resetPointer = () => moveLayer.forEach((move) => move(0));

            heroVisual?.addEventListener("pointermove", handlePointerMove);
            heroVisual?.addEventListener("pointerleave", resetPointer);

            gsap.fromTo(
              "[data-method-line]",
              { scaleX: 0, transformOrigin: "left center" },
              {
                scaleX: 1,
                ease: "none",
                scrollTrigger: {
                  trigger: "[data-methodology]",
                  start: "top 78%",
                  end: "bottom 58%",
                  scrub: 0.55,
                },
              },
            );

            gsap.to("[data-ambient]", {
              yPercent: 8,
              ease: "none",
              scrollTrigger: {
                trigger: "[data-hero]",
                start: "top top",
                end: "bottom top",
                scrub: 0.7,
              },
            });

            return () => {
              heroVisual?.removeEventListener("pointermove", handlePointerMove);
              heroVisual?.removeEventListener("pointerleave", resetPointer);
            };
          }
        },
      );

      return () => media.revert();
    },
    { scope: root },
  );

  return <div ref={root}>{children}</div>;
}
