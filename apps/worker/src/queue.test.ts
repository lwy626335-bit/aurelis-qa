import { beforeEach, describe, expect, it, vi } from "vitest";

const { evaluationJob, evaluation, transaction } = vi.hoisted(() => {
  const evaluationJob = { findUnique: vi.fn(), updateMany: vi.fn() };
  const evaluation = { update: vi.fn() };
  return { evaluation, evaluationJob, transaction: { evaluation, evaluationJob } };
});

vi.mock("@aurelis/database/client", () => ({
  database: {
    $transaction: vi.fn((callback: (client: typeof transaction) => unknown) => callback(transaction)),
    evaluation,
    evaluationJob,
  },
}));

import { assertJobActive, finishCancellationIfRequested, renewLease, type ClaimedJob } from "./queue.js";

const job: ClaimedJob = { attemptCount: 1, evaluationId: "evaluation-1", id: "job-1", leaseToken: "lease-1", maxAttempts: 2 };

beforeEach(() => vi.clearAllMocks());

describe("queue lease control", () => {
  it("renews only the active uncancelled lease", async () => {
    evaluationJob.updateMany.mockResolvedValue({ count: 1 });
    await expect(renewLease(job)).resolves.toBe(true);
    expect(evaluationJob.updateMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { cancelRequestedAt: null, id: job.id, leaseToken: job.leaseToken, status: "RUNNING" },
    }));
  });

  it("rejects work after cancellation is requested", async () => {
    evaluationJob.findUnique.mockResolvedValue({ cancelRequestedAt: new Date(), leaseToken: job.leaseToken, status: "RUNNING" });
    await expect(assertJobActive(job)).rejects.toThrow("JOB_CANCELLED");
  });

  it("finishes a cancellation only for the worker that owns the lease", async () => {
    evaluationJob.updateMany.mockResolvedValue({ count: 1 });
    evaluation.update.mockResolvedValue({});
    await expect(finishCancellationIfRequested(job)).resolves.toBe(true);
    expect(evaluation.update).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ status: "CANCELLED" }),
      where: { id: job.evaluationId },
    }));
  });
});
