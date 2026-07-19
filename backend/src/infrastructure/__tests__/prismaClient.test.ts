jest.mock('@prisma/client', () => {
    const instance = { $connect: jest.fn(), $disconnect: jest.fn() };
    return { PrismaClient: jest.fn(() => instance) };
});

import { PrismaClient } from '@prisma/client';
import prisma, { prisma as namedPrisma } from '../prismaClient';

describe('prismaClient singleton', () => {
    it('should expose the same instance from the named and default exports', () => {
        expect(prisma).toBe(namedPrisma);
    });

    it('should instantiate PrismaClient exactly once when imported repeatedly', () => {
        jest.isolateModules(() => {
            require('../prismaClient');
            require('../prismaClient');
        });
        expect(PrismaClient).toHaveBeenCalledTimes(1);
    });
});
