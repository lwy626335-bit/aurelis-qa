import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../generated/prisma/client";

const connectionString =
  process.env.DATABASE_URL ??
  "postgresql://aurelis:aurelis_dev@localhost:5432/aurelis?schema=public";

const globalDatabase = globalThis as typeof globalThis & {
  aurelisDatabase?: PrismaClient;
};

export const database =
  globalDatabase.aurelisDatabase ??
  new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

if (process.env.NODE_ENV !== "production") {
  globalDatabase.aurelisDatabase = database;
}

export * from "../generated/prisma/enums";
