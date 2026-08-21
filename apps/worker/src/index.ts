export type WorkerCapability = {
  id: "lighthouse" | "html-validator" | "accessibility" | "brand-ai";
  status: "not-implemented";
  phase: number;
};

export const workerCapabilities: WorkerCapability[] = [
  { id: "lighthouse", status: "not-implemented", phase: 3 },
  { id: "html-validator", status: "not-implemented", phase: 3 },
  { id: "accessibility", status: "not-implemented", phase: 3 },
  { id: "brand-ai", status: "not-implemented", phase: 4 },
];

if (process.env.NODE_ENV !== "test") {
  console.info("AURELIS evaluation worker skeleton");
  console.info(JSON.stringify({ status: "idle", capabilities: workerCapabilities }));
}
