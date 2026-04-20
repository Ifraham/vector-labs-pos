import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/app/generated/prisma/client";

// Create the PostgreSQL adapter using the DATABASE_URL from .env.
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

// Extend the global object so we can cache one Prisma client in development.
const globalForPrisma = globalThis as typeof globalThis & {
  prisma?: PrismaClient;
};

// Reuse the existing Prisma client if it already exists.
// Otherwise create a new one with the PostgreSQL adapter.
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
  });

// In development, store the client on the global object.
// This prevents creating too many database connections during hot reloads.
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
