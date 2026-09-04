import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { DeleteEvaluationButton } from "./delete-evaluation-button";

const { push, refresh } = vi.hoisted(() => ({ push: vi.fn(), refresh: vi.fn() }));

vi.mock("next/navigation", () => ({ useRouter: () => ({ push, refresh }) }));

beforeAll(() => {
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: vi.fn().mockImplementation(() => ({
      addEventListener: vi.fn(),
      addListener: vi.fn(),
      dispatchEvent: vi.fn(),
      matches: true,
      media: "(prefers-reduced-motion: reduce)",
      onchange: null,
      removeEventListener: vi.fn(),
      removeListener: vi.fn(),
    })),
  });
  HTMLDialogElement.prototype.showModal = function showModal() {
    this.open = true;
  };
  HTMLDialogElement.prototype.close = function close() {
    this.open = false;
  };
});

beforeEach(() => {
  push.mockReset();
  refresh.mockReset();
  vi.restoreAllMocks();
});

afterEach(cleanup);

describe("DeleteEvaluationButton", () => {
  it("deletes a logo evaluation through the logo endpoint", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(null, { status: 204 }));
    render(<DeleteEvaluationButton evaluationId="logo-123" evaluationType="logo" locale="en" />);

    await user.click(screen.getByRole("button", { name: "Delete evaluation" }));
    await user.click(screen.getByRole("button", { name: "Permanently delete" }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith("/api/logo-evaluations/logo-123", { method: "DELETE" }));
    expect(push).toHaveBeenCalledWith("/dashboard/history");
    expect(refresh).toHaveBeenCalledOnce();
  });
});
