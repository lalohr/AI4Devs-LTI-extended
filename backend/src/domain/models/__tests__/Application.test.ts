import { PrismaClient } from '@prisma/client';
import { Application } from '../Application';

jest.mock('@prisma/client', () => {
    const mockPrisma = {
        application: {
            create: jest.fn(),
            update: jest.fn(),
            findUnique: jest.fn(),
            findFirst: jest.fn(),
        },
    };
    return { PrismaClient: jest.fn(() => mockPrisma) };
});

const mockPrisma = new PrismaClient() as jest.Mocked<PrismaClient>;

describe('Application model', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('constructor', () => {
        it('should map provided data and convert applicationDate to a Date', () => {
            const application = new Application({
                id: 1,
                positionId: 2,
                candidateId: 3,
                applicationDate: '2024-01-01',
                currentInterviewStep: 1,
                notes: 'Promising',
                interviews: [{ id: 10 }],
            });

            expect(application.id).toBe(1);
            expect(application.positionId).toBe(2);
            expect(application.candidateId).toBe(3);
            expect(application.applicationDate).toBeInstanceOf(Date);
            expect(application.currentInterviewStep).toBe(1);
            expect(application.notes).toBe('Promising');
            expect(application.interviews).toHaveLength(1);
        });

        it('should default interviews to an empty array', () => {
            const application = new Application({
                positionId: 2,
                candidateId: 3,
                applicationDate: '2024-01-01',
                currentInterviewStep: 1,
            });

            expect(application.interviews).toEqual([]);
        });
    });

    describe('save', () => {
        it('should create a new application when id is not set', async () => {
            const created = { id: 60 };
            (mockPrisma.application.create as jest.Mock).mockResolvedValue(created);

            const application = new Application({
                positionId: 2,
                candidateId: 3,
                applicationDate: '2024-01-01',
                currentInterviewStep: 1,
            });
            const result = await application.save();

            expect(mockPrisma.application.create).toHaveBeenCalledTimes(1);
            const arg = (mockPrisma.application.create as jest.Mock).mock.calls[0][0];
            expect(arg.data.positionId).toBe(2);
            expect(arg.data.candidateId).toBe(3);
            expect(mockPrisma.application.update).not.toHaveBeenCalled();
            expect(result).toEqual(created);
        });

        it('should update an existing application when id is set', async () => {
            const updated = { id: 1 };
            (mockPrisma.application.update as jest.Mock).mockResolvedValue(updated);

            const application = new Application({
                id: 1,
                positionId: 2,
                candidateId: 3,
                applicationDate: '2024-01-01',
                currentInterviewStep: 2,
            });
            const result = await application.save();

            expect(mockPrisma.application.update).toHaveBeenCalledTimes(1);
            const arg = (mockPrisma.application.update as jest.Mock).mock.calls[0][0];
            expect(arg.where).toEqual({ id: 1 });
            expect(arg.data.currentInterviewStep).toBe(2);
            expect(mockPrisma.application.create).not.toHaveBeenCalled();
            expect(result).toEqual(updated);
        });
    });

    describe('findOne', () => {
        it('should return an Application when found', async () => {
            (mockPrisma.application.findUnique as jest.Mock).mockResolvedValue({
                id: 5,
                positionId: 2,
                candidateId: 3,
                applicationDate: '2024-01-01',
                currentInterviewStep: 1,
            });

            const result = await Application.findOne(5);

            expect(mockPrisma.application.findUnique).toHaveBeenCalledWith({ where: { id: 5 } });
            expect(result).toBeInstanceOf(Application);
            expect(result?.id).toBe(5);
        });

        it('should return null when not found', async () => {
            (mockPrisma.application.findUnique as jest.Mock).mockResolvedValue(null);

            const result = await Application.findOne(999);

            expect(result).toBeNull();
        });
    });

    describe('findOneByPositionCandidateId', () => {
        it('should query by id and candidateId and return an Application when found', async () => {
            (mockPrisma.application.findFirst as jest.Mock).mockResolvedValue({
                id: 5,
                positionId: 2,
                candidateId: 3,
                applicationDate: '2024-01-01',
                currentInterviewStep: 1,
            });

            const result = await Application.findOneByPositionCandidateId(5, 3);

            expect(mockPrisma.application.findFirst).toHaveBeenCalledWith({
                where: { id: 5, candidateId: 3 },
            });
            expect(result).toBeInstanceOf(Application);
        });

        it('should return null when not found', async () => {
            (mockPrisma.application.findFirst as jest.Mock).mockResolvedValue(null);

            const result = await Application.findOneByPositionCandidateId(5, 99);

            expect(result).toBeNull();
        });
    });
});
