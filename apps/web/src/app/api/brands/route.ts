import { createBrandSchema } from "@/features/brands/schema";
import { createBrand, listBrands } from "@/features/brands/service";
import { authorizeRequest } from "@/lib/access-control";

export async function GET(request: Request) {
  const unauthorized = authorizeRequest(request);
  if (unauthorized) return unauthorized;
  try {
    return Response.json({ brands: await listBrands() });
  } catch {
    return Response.json({ code: "DATABASE_UNAVAILABLE" }, { status: 503 });
  }
}

export async function POST(request: Request) {
  const unauthorized = authorizeRequest(request);
  if (unauthorized) return unauthorized;
  const parsed = createBrandSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ code: "INVALID_INPUT", issues: parsed.error.issues }, { status: 400 });
  try {
    const brand = await createBrand(parsed.data);
    return Response.json({ brandId: brand.id }, { status: 201 });
  } catch {
    return Response.json({ code: "DATABASE_UNAVAILABLE" }, { status: 503 });
  }
}
