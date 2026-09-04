import { z } from "zod";
import { createExperiment, listExperiments } from "@/features/research/service";
import { authorizeRequest } from "@/lib/access-control";
import { workerAvailable } from "@/lib/worker-availability";
const schema = z.object({ name: z.string().trim().min(2).max(100), runCount: z.number().int().min(1).max(10), sourceEvaluationId: z.string().cuid() });
export async function GET(request: Request) { const unauthorized = authorizeRequest(request); if (unauthorized) return unauthorized; return Response.json({ experiments: await listExperiments() }); }
export async function POST(request: Request) { const unauthorized = authorizeRequest(request); if (unauthorized) return unauthorized; const parsed = schema.safeParse(await request.json().catch(() => null)); if (!parsed.success) return Response.json({ code: "INVALID_INPUT" }, { status: 400 }); if (!(await workerAvailable())) return Response.json({ code: "WORKER_UNAVAILABLE" }, { status: 503 }); try { const experiment = await createExperiment(parsed.data.sourceEvaluationId, parsed.data.name, parsed.data.runCount); return Response.json({ experimentId: experiment.id }, { status: 201 }); } catch { return Response.json({ code: "EXPERIMENT_CREATE_FAILED" }, { status: 409 }); } }
