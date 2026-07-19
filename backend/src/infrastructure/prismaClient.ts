import { PrismaClient } from '@prisma/client';

/**
 * Shared PrismaClient singleton.
 *
 * Instantiating PrismaClient in every model, service and controller opens a new
 * database connection pool per module. This module centralises a single client
 * instance and reuses it across the whole backend. The instance is cached on the
 * global object outside production so hot-reloading in development does not
 * exhaust database connections.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma: PrismaClient = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma;
}

export default prisma;
