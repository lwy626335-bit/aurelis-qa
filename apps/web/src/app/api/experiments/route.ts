import { z } from "zod";
import { createExperiment, listExperiments } from "@/features/research/service";
const schema = z.object({ name: z.string().trim().min(2).max(100), runCount: z.number().int().min(1).max(10), sourceEvaluationId: z.string().cuid() });
export async function GET() { return Response.json({ experiments: await listExperiments() }); }
export async function POST(request: Request) { const parsed = schema.safeParse(await request.json().catch(() => null)); if (!parsed.success) return Response.json({ code: "INVALID_INPUT" }, { status: 400 }); try { const experiment = await createExperiment(parsed.data.sourceEvaluationId, parsed.data.name, parsed.data.runCount); return Response.json({ experimentId: experiment.id }, { status: 201 }); } catch { return Response.json({ code: "EXPERIMENT_CREATE_FAILED" }, { status: 409 }); } }
