import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../generated/prisma/client";

function connectionString() {
  const configured = process.env.DATABASE_URL?.trim();
  if (configured) return configured;
  if (process.env.NODE_ENV === "production") throw new Error("DATABASE_URL_REQUIRED");
  return "postgresql://aurelis:aurelis_dev@localhost:5432/aurelis?schema=public";
}

const globalDatabase = globalThis as typeof globalThis & {
  aurelisDatabase?: PrismaClient;
};

export const database =
  globalDatabase.aurelisDatabase ??
  new PrismaClient({ adapter: new PrismaPg({ connectionString: connectionString() }) });

if (process.env.NODE_ENV !== "production") {
  globalDatabase.aurelisDatabase = database;
}

export * from "../generated/prisma/enums";
