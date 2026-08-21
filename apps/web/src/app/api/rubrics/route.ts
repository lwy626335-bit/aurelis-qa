import { createRubricSchema } from "@/features/rubrics/schema";
import { createRubric, listRubrics } from "@/features/rubrics/service";

export async function GET() { return Response.json({ rubrics: await listRubrics() }); }
export async function POST(request: Request) { const parsed = createRubricSchema.safeParse(await request.json().catch(() => null)); if (!parsed.success) return Response.json({ code: "INVALID_INPUT", issues: parsed.error.issues }, { status: 400 }); try { const rubric = await createRubric(parsed.data); return Response.json({ rubricId: rubric.id }, { status: 201 }); } catch { return Response.json({ code: "VERSION_EXISTS" }, { status: 409 }); } }
