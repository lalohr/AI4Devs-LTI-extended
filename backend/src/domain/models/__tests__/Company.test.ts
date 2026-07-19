import { PrismaClient } from '@prisma/client';
import { Company } from '../Company';

jest.mock('@prisma/client', () => {
    const mockPrisma = {
        company: {
            create: jest.fn(),
            update: jest.fn(),
            findUnique: jest.fn(),
        },
    };
    return { PrismaClient: jest.fn(() => mockPrisma) };
});

const mockPrisma = new PrismaClient() as jest.Mocked<PrismaClient>;

describe('Company model', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('constructor', () => {
        it('should map provided data onto the instance', () => {
            const company = new Company({ id: 1, name: 'Acme' });

            expect(company.id).toBe(1);
            expect(company.name).toBe('Acme');
        });

        it('should leave id undefined when not provided', () => {
            const company = new Company({ name: 'Acme' });

            expect(company.id).toBeUndefined();
            expect(company.name).toBe('Acme');
        });
    });

    describe('save', () => {
        it('should create a new company when id is not set', async () => {
            const created = { id: 10, name: 'Acme' };
            (mockPrisma.company.create as jest.Mock).mockResolvedValue(created);

            const company = new Company({ name: 'Acme' });
            const result = await company.save();

            expect(mockPrisma.company.create).toHaveBeenCalledWith({
                data: { name: 'Acme' },
            });
            expect(mockPrisma.company.update).not.toHaveBeenCalled();
            expect(result).toEqual(created);
        });

        it('should update an existing company when id is set', async () => {
            const updated = { id: 1, name: 'Acme Corp' };
            (mockPrisma.company.update as jest.Mock).mockResolvedValue(updated);

            const company = new Company({ id: 1, name: 'Acme Corp' });
            const result = await company.save();

            expect(mockPrisma.company.update).toHaveBeenCalledWith({
                where: { id: 1 },
                data: { name: 'Acme Corp' },
            });
            expect(mockPrisma.company.create).not.toHaveBeenCalled();
            expect(result).toEqual(updated);
        });
    });

    describe('findOne', () => {
        it('should return a Company instance when a record is found', async () => {
            (mockPrisma.company.findUnique as jest.Mock).mockResolvedValue({ id: 5, name: 'Found' });

            const result = await Company.findOne(5);

            expect(mockPrisma.company.findUnique).toHaveBeenCalledWith({ where: { id: 5 } });
            expect(result).toBeInstanceOf(Company);
            expect(result?.id).toBe(5);
            expect(result?.name).toBe('Found');
        });

        it('should return null when no record is found', async () => {
            (mockPrisma.company.findUnique as jest.Mock).mockResolvedValue(null);

            const result = await Company.findOne(999);

            expect(result).toBeNull();
        });
    });
});
