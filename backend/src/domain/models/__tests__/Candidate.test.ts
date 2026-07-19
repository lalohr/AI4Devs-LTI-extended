import { PrismaClient, Prisma } from '@prisma/client';
import { Candidate } from '../Candidate';

jest.mock('@prisma/client', () => {
    class MockPrismaClientInitializationError extends Error {}
    const mockPrisma = {
        candidate: {
            create: jest.fn(),
            update: jest.fn(),
            findUnique: jest.fn(),
        },
    };
    return {
        PrismaClient: jest.fn(() => mockPrisma),
        Prisma: {
            PrismaClientInitializationError: MockPrismaClientInitializationError,
        },
    };
});

const mockPrisma = new PrismaClient() as jest.Mocked<PrismaClient>;
const MockPrismaClientInitializationError = Prisma.PrismaClientInitializationError as unknown as new (
    message: string
) => Error;

describe('Candidate model', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, 'log').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('constructor', () => {
        it('should map provided data and default collections to empty arrays', () => {
            const candidate = new Candidate({ id: 1, firstName: 'Ada', lastName: 'Lovelace', email: 'ada@x.com' });

            expect(candidate.id).toBe(1);
            expect(candidate.firstName).toBe('Ada');
            expect(candidate.educations).toEqual([]);
            expect(candidate.workExperiences).toEqual([]);
            expect(candidate.resumes).toEqual([]);
            expect(candidate.applications).toEqual([]);
        });

        it('should keep provided collections', () => {
            const candidate = new Candidate({
                firstName: 'Ada',
                lastName: 'Lovelace',
                email: 'ada@x.com',
                educations: [{ institution: 'X' }],
            });

            expect(candidate.educations).toHaveLength(1);
        });
    });

    describe('save - create', () => {
        it('should create a candidate including only defined scalar fields', async () => {
            const created = { id: 100 };
            (mockPrisma.candidate.create as jest.Mock).mockResolvedValue(created);

            const candidate = new Candidate({ firstName: 'Ada', lastName: 'Lovelace', email: 'ada@x.com' });
            const result = await candidate.save();

            const arg = (mockPrisma.candidate.create as jest.Mock).mock.calls[0][0];
            expect(arg.data).toEqual({ firstName: 'Ada', lastName: 'Lovelace', email: 'ada@x.com' });
            expect(arg.data).not.toHaveProperty('phone');
            expect(result).toEqual(created);
        });

        it('should include nested create blocks for related collections', async () => {
            (mockPrisma.candidate.create as jest.Mock).mockResolvedValue({ id: 101 });

            const candidate = new Candidate({
                firstName: 'Ada',
                lastName: 'Lovelace',
                email: 'ada@x.com',
                phone: '123',
                address: 'Somewhere',
                educations: [{ institution: 'MIT', title: 'BSc', startDate: new Date(), endDate: new Date() }],
                workExperiences: [{ company: 'Acme', position: 'Eng', description: 'd', startDate: new Date() }],
                resumes: [{ filePath: '/cv.pdf', fileType: 'application/pdf' }],
                applications: [{ positionId: 1, candidateId: 2, applicationDate: new Date(), currentInterviewStep: 1, notes: 'n' }],
            });
            await candidate.save();

            const arg = (mockPrisma.candidate.create as jest.Mock).mock.calls[0][0];
            expect(arg.data.phone).toBe('123');
            expect(arg.data.educations.create).toHaveLength(1);
            expect(arg.data.workExperiences.create[0].company).toBe('Acme');
            expect(arg.data.resumes.create[0].filePath).toBe('/cv.pdf');
            expect(arg.data.applications.create[0].positionId).toBe(1);
        });

        it('should translate a PrismaClientInitializationError into a friendly message', async () => {
            (mockPrisma.candidate.create as jest.Mock).mockRejectedValue(new MockPrismaClientInitializationError('down'));

            const candidate = new Candidate({ firstName: 'Ada', lastName: 'Lovelace', email: 'ada@x.com' });

            await expect(candidate.save()).rejects.toThrow('No se pudo conectar con la base de datos');
        });

        it('should rethrow unknown errors on create', async () => {
            (mockPrisma.candidate.create as jest.Mock).mockRejectedValue(new Error('boom'));

            const candidate = new Candidate({ firstName: 'Ada', lastName: 'Lovelace', email: 'ada@x.com' });

            await expect(candidate.save()).rejects.toThrow('boom');
        });
    });

    describe('save - update', () => {
        it('should update a candidate when id is set', async () => {
            const updated = { id: 1 };
            (mockPrisma.candidate.update as jest.Mock).mockResolvedValue(updated);

            const candidate = new Candidate({ id: 1, firstName: 'Ada', lastName: 'L', email: 'a@x.com' });
            const result = await candidate.save();

            const arg = (mockPrisma.candidate.update as jest.Mock).mock.calls[0][0];
            expect(arg.where).toEqual({ id: 1 });
            expect(result).toEqual(updated);
        });

        it('should translate a PrismaClientInitializationError into a friendly message', async () => {
            (mockPrisma.candidate.update as jest.Mock).mockRejectedValue(new MockPrismaClientInitializationError('down'));

            const candidate = new Candidate({ id: 1, firstName: 'Ada', lastName: 'L', email: 'a@x.com' });

            await expect(candidate.save()).rejects.toThrow('No se pudo conectar con la base de datos');
        });

        it('should translate a P2025 error into a record-not-found message', async () => {
            const err: any = new Error('not found');
            err.code = 'P2025';
            (mockPrisma.candidate.update as jest.Mock).mockRejectedValue(err);

            const candidate = new Candidate({ id: 999, firstName: 'Ada', lastName: 'L', email: 'a@x.com' });

            await expect(candidate.save()).rejects.toThrow('No se pudo encontrar el registro del candidato');
        });

        it('should rethrow unknown errors on update', async () => {
            (mockPrisma.candidate.update as jest.Mock).mockRejectedValue(new Error('boom'));

            const candidate = new Candidate({ id: 1, firstName: 'Ada', lastName: 'L', email: 'a@x.com' });

            await expect(candidate.save()).rejects.toThrow('boom');
        });
    });

    describe('findOne', () => {
        it('should return a Candidate with related data when found', async () => {
            (mockPrisma.candidate.findUnique as jest.Mock).mockResolvedValue({
                id: 5,
                firstName: 'Ada',
                lastName: 'Lovelace',
                email: 'ada@x.com',
            });

            const result = await Candidate.findOne(5);

            expect(mockPrisma.candidate.findUnique).toHaveBeenCalledTimes(1);
            const arg = (mockPrisma.candidate.findUnique as jest.Mock).mock.calls[0][0];
            expect(arg.where).toEqual({ id: 5 });
            expect(arg.include).toHaveProperty('educations', true);
            expect(result).toBeInstanceOf(Candidate);
        });

        it('should return null when not found', async () => {
            (mockPrisma.candidate.findUnique as jest.Mock).mockResolvedValue(null);

            const result = await Candidate.findOne(999);

            expect(result).toBeNull();
        });
    });
});
