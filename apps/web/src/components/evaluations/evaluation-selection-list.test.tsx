import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { EvaluationSelectionList, type EvaluationSelectionLabels } from "./evaluation-selection-list";

const { refresh } = vi.hoisted(() => ({ refresh: vi.fn() }));

vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh }) }));

const labels: EvaluationSelectionLabels = {
  cancelConfirm: "Cancel tasks",
  cancelDescription: "Cancel {cancellable}; skip {skipped}.",
  cancelFailed: "Cancelled none; {failed} failed; {skipped} skipped.",
  cancelPartial: "Cancelled {success}; {failed} failed; {skipped} skipped.",
  cancelSelected: "Cancel selected tasks",
  cancelSuccess: "Cancelled {success}; {skipped} skipped.",
  cancelling: "Cancelling",
  clearSelection: "Clear selection",
  closeDialog: "Keep tasks",
  confirmTitle: "Cancel selected tasks?",
  created: "Created",
  inputType: "Input",
  listLabel: "Evaluation list",
  open: "Open evaluation",
  selectAll: "Select current page",
  selectItem: "Select {label}",
  selected: "{count} selected",
  selectionSummary: "{cancellable} cancellable · {skipped} skipped",
  status: "Status",
  statusLabels: {
    CANCELLED: "Cancelled",
    COMPLETED: "Completed",
    FAILED: "Failed",
    QUEUED: "Queued",
    RUNNING: "Running",
  },
  target: "Target",
};

const evaluations = [
  { createdAt: "2026-08-30T00:00:00.000Z", id: "queued", inputType: "URL", projectName: "Alpha", status: "QUEUED", websiteLabel: "Queued site" },
  { createdAt: "2026-08-30T00:01:00.000Z", id: "running", inputType: "URL", projectName: "Beta", status: "RUNNING", websiteLabel: "Running site" },
  { createdAt: "2026-08-30T00:02:00.000Z", id: "completed", inputType: "HTML", projectName: "Gamma", status: "COMPLETED", websiteLabel: "Completed site" },
];

beforeAll(() => {
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: vi.fn().mockImplementation((media: string) => ({
      addEventListener: vi.fn(),
      addListener: vi.fn(),
      dispatchEvent: vi.fn(),
      matches: media === "(prefers-reduced-motion: no-preference)",
      media,
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
  refresh.mockReset();
  vi.restoreAllMocks();
});

afterEach(cleanup);

describe("EvaluationSelectionList", () => {
  it("does not animate missing selection targets", async () => {
    const user = userEvent.setup();
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    render(<EvaluationSelectionList dateLocale="en-US" evaluations={evaluations} labels={labels} />);

    await user.click(screen.getByRole("checkbox", { name: labels.selectAll }));
    await user.click(screen.getAllByRole("button", { name: labels.clearSelection })[0]);

    expect(warn.mock.calls.flat().join(" ")).not.toContain("GSAP target");
  });

  it("selects the current page and clears the selection", async () => {
    const user = userEvent.setup();
    render(<EvaluationSelectionList dateLocale="en-US" evaluations={evaluations} labels={labels} />);

    await user.click(screen.getByRole("checkbox", { name: labels.selectAll }));

    expect(screen.getByText("3 selected")).toBeInTheDocument();
    for (const checkbox of screen.getAllByRole("checkbox")) expect(checkbox).toBeChecked();

    await user.click(screen.getAllByRole("button", { name: labels.clearSelection })[0]);

    expect(screen.getByText("0 selected")).toBeInTheDocument();
    for (const checkbox of screen.getAllByRole("checkbox")) expect(checkbox).not.toBeChecked();
  });

  it("cancels eligible tasks, skips completed items, and keeps failures selected", async () => {
    const user = userEvent.setup();
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(new Response(null, { status: 200 }))
      .mockResolvedValueOnce(new Response(null, { status: 503 }));
    render(<EvaluationSelectionList dateLocale="en-US" evaluations={evaluations} labels={labels} />);

    await user.click(screen.getByRole("checkbox", { name: labels.selectAll }));
    await user.click(screen.getAllByRole("button", { name: labels.cancelSelected })[0]);

    expect(screen.getByText("Cancel 2; skip 1.")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: labels.cancelConfirm }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    expect(fetchMock).toHaveBeenNthCalledWith(1, "/api/evaluations/queued", { method: "DELETE" });
    expect(fetchMock).toHaveBeenNthCalledWith(2, "/api/evaluations/running", { method: "DELETE" });
    expect(await screen.findByText("Cancelled 1; 1 failed; 1 skipped.")).toBeInTheDocument();
    expect(refresh).toHaveBeenCalledOnce();
    for (const checkbox of screen.getAllByRole("checkbox", { name: "Select Queued site" })) expect(checkbox).not.toBeChecked();
    for (const checkbox of screen.getAllByRole("checkbox", { name: "Select Running site" })) expect(checkbox).toBeChecked();
    for (const checkbox of screen.getAllByRole("checkbox", { name: "Select Completed site" })) expect(checkbox).toBeChecked();
  });
});
