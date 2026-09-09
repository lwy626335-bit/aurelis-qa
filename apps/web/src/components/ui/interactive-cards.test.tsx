import { cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { BorderGlow } from "./border-glow";
import { SpotlightCard } from "./spotlight-card";

afterEach(cleanup);

function bounds(width = 100, height = 80): DOMRect {
  return {
    bottom: height,
    height,
    left: 0,
    right: width,
    top: 0,
    width,
    x: 0,
    y: 0,
    toJSON: () => ({}),
  };
}

describe("interactive card surfaces", () => {
  it("tracks the pointer position for the spotlight", () => {
    const { container } = render(<SpotlightCard>Score</SpotlightCard>);
    const card = container.firstElementChild as HTMLDivElement;
    vi.spyOn(card, "getBoundingClientRect").mockReturnValue(bounds());

    fireEvent.pointerMove(card, { clientX: 25, clientY: 30 });

    expect(card.style.getPropertyValue("--mouse-x")).toBe("25px");
    expect(card.style.getPropertyValue("--mouse-y")).toBe("30px");
  });

  it("activates the edge glow near the border and resets on leave", () => {
    const { container } = render(<BorderGlow colors={[]}>Action</BorderGlow>);
    const card = container.firstElementChild as HTMLDivElement;
    vi.spyOn(card, "getBoundingClientRect").mockReturnValue(bounds());

    fireEvent.pointerMove(card, { clientX: 100, clientY: 40 });

    expect(card.style.getPropertyValue("--edge-proximity")).toBe("100.000");
    expect(card.style.getPropertyValue("--cursor-angle")).toBe("90.000deg");

    fireEvent.pointerLeave(card);
    expect(card.style.getPropertyValue("--edge-proximity")).toBe("0");
  });
});
