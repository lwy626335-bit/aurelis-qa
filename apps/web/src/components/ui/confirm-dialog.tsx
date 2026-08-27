"use client";

import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { useEffect, useRef } from "react";

import { AsyncStatus } from "@/components/ui/async-status";
import { Button } from "@/components/ui/button";

if (typeof window !== "undefined") gsap.registerPlugin(useGSAP);

export function ConfirmDialog({
  busy = false,
  cancelLabel,
  confirmLabel,
  description,
  error,
  onClose,
  onConfirm,
  open,
  title,
}: {
  busy?: boolean;
  cancelLabel: string;
  confirmLabel: string;
  description: string;
  error?: string;
  onClose: () => void;
  onConfirm: () => void;
  open: boolean;
  title: string;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);

  useGSAP(
    () => {
      const element = dialog.current;
      const panelElement = panel.current;
      if (!element || !panelElement) return;

      if (open) {
        returnFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        if (!element.open) element.showModal();
        if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
          gsap.fromTo(panelElement, { autoAlpha: 0, y: 12, scale: 0.985 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.3, ease: "power3.out" });
        }
        return;
      }

      if (element.open) {
        element.close();
        returnFocus.current?.focus();
      }
    },
    { dependencies: [open], revertOnUpdate: true, scope: dialog },
  );

  useEffect(() => () => returnFocus.current?.focus(), []);

  return (
    <dialog
      aria-labelledby="confirm-dialog-title"
      className="m-auto w-[30rem] max-w-[calc(100%_-_2rem)] rounded-[var(--radius-card)] border border-white/10 bg-[var(--surface-raised)] p-0 text-[var(--text)] shadow-[var(--shadow-panel)] backdrop:bg-[#07080b]/78 backdrop:backdrop-blur-sm"
      onCancel={(event) => {
        event.preventDefault();
        if (!busy) onClose();
      }}
      ref={dialog}
    >
      <div className="p-6" ref={panel}>
        <h2 className="text-xl font-medium tracking-[-0.03em]" id="confirm-dialog-title">{title}</h2>
        <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">{description}</p>
        {error && <div className="mt-5"><AsyncStatus tone="error">{error}</AsyncStatus></div>}
        <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button disabled={busy} onClick={onClose} tone="secondary" type="button">{cancelLabel}</Button>
          <Button busy={busy} onClick={onConfirm} tone="danger" type="button">{confirmLabel}</Button>
        </div>
      </div>
    </dialog>
  );
}
