"use client";

import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { useEffect, useRef } from "react";

if (typeof window !== "undefined") gsap.registerPlugin(useGSAP);

export function Drawer({
  children,
  closeLabel,
  onClose,
  open,
  title,
}: {
  children: React.ReactNode;
  closeLabel: string;
  onClose: () => void;
  open: boolean;
  title: string;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const panel = useRef<HTMLElement>(null);
  const overlay = useRef<HTMLButtonElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const { contextSafe } = useGSAP({ scope: dialog });

  useEffect(() => {
    const element = dialog.current;
    const panelElement = panel.current;
    const overlayElement = overlay.current;
    if (!element || !panelElement || !overlayElement) return;

    const update = contextSafe(() => {
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      if (open) {
        returnFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        if (!element.open) element.showModal();
        gsap.killTweensOf([panelElement, overlayElement]);
        if (reduceMotion) {
          gsap.set(panelElement, { clearProps: "transform" });
          gsap.set(overlayElement, { autoAlpha: 1 });
          return;
        }
        gsap.fromTo(panelElement, { xPercent: -100 }, { xPercent: 0, duration: 0.36, ease: "power3.out", overwrite: "auto" });
        gsap.fromTo(overlayElement, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.24, ease: "power2.out", overwrite: "auto" });
        return;
      }

      if (!element.open) return;
      const finish = () => {
        element.close();
        gsap.set([panelElement, overlayElement], { clearProps: "all" });
        returnFocus.current?.focus();
      };
      if (reduceMotion) {
        finish();
        return;
      }
      gsap.to(panelElement, { xPercent: -100, duration: 0.26, ease: "power2.in", overwrite: "auto" });
      gsap.to(overlayElement, { autoAlpha: 0, duration: 0.2, ease: "power2.in", overwrite: "auto", onComplete: finish });
    });

    update();
  }, [contextSafe, open]);

  return (
    <dialog
      aria-labelledby="dashboard-drawer-title"
      className="fixed inset-0 m-0 h-full max-h-none w-full max-w-none bg-transparent p-0 text-[var(--text)] backdrop:bg-transparent lg:hidden"
      id="dashboard-drawer"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      ref={dialog}
    >
      <h2 className="sr-only" id="dashboard-drawer-title">{title}</h2>
      <button
        aria-label={closeLabel}
        className="absolute inset-0 bg-[#07080b]/88"
        onClick={onClose}
        ref={overlay}
        type="button"
      />
      <aside
        aria-label={title}
        className="relative flex h-full w-[min(86vw,320px)] flex-col border-r border-white/10 bg-[var(--surface)] shadow-2xl"
        ref={panel}
      >
        {children}
      </aside>
    </dialog>
  );
}
