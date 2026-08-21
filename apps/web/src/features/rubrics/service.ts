import "server-only";
import { database } from "@aurelis/database/client";
import type { z } from "zod";
import { createRubricSchema } from "./schema";

export function listRubrics() { return database.rubric.findMany({ include: { dimensions: { orderBy: { sortOrder: "asc" } } }, orderBy: { createdAt: "desc" } }); }
export function createRubric(input: z.infer<typeof createRubricSchema>) { return database.rubric.create({ data: { description: input.description, dimensions: { create: input.dimensions.map((item, sortOrder) => ({ ...item, description: item.label, sortOrder })) }, name: input.name, version: input.version }, include: { dimensions: true } }); }
