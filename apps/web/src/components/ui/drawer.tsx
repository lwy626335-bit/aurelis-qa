"use client";

import { useEffect, useRef } from "react";

import styles from "./drawer.module.css";

export function Drawer({ children, closeLabel, onClose, open, title }: {
  children: React.ReactNode;
  closeLabel: string;
  onClose: () => void;
  open: boolean;
  title: string;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    if (open && !element.open) {
      returnFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      element.showModal();
    } else if (!open && element.open) {
      element.close();
      returnFocus.current?.focus();
    }
  }, [open]);

  return (
    <dialog aria-labelledby="dashboard-drawer-title" className={styles.drawer} id="dashboard-drawer" ref={dialog} onCancel={(event) => { event.preventDefault(); onClose(); }}>
      <h2 className="sr-only" id="dashboard-drawer-title">{title}</h2>
      <button aria-label={closeLabel} className={styles.overlay} onClick={onClose} tabIndex={-1} type="button" />
      <aside aria-label={title} className={styles.panel}>{children}</aside>
    </dialog>
  );
}
