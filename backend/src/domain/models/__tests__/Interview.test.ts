import { PrismaClient } from '@prisma/client';
import { Interview } from '../Interview';

jest.mock('@prisma/client', () => {
    const mockPrisma = {
        interview: {
            create: jest.fn(),
            update: jest.fn(),
            findUnique: jest.fn(),
            delete: jest.fn(),
        },
    };
    return { PrismaClient: jest.fn(() => mockPrisma) };
});

const mockPrisma = new PrismaClient() as jest.Mocked<PrismaClient>;

describe('Interview model', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('constructor', () => {
        it('should map provided data and convert interviewDate to a Date', () => {
            const interview = new Interview({
                id: 1,
                applicationId: 2,
                interviewStepId: 3,
                employeeId: 4,
                interviewDate: '2024-05-01',
                result: 'Passed',
                score: 9,
                notes: 'Great',
            });

            expect(interview.id).toBe(1);
            expect(interview.applicationId).toBe(2);
            expect(interview.interviewStepId).toBe(3);
            expect(interview.employeeId).toBe(4);
            expect(interview.interviewDate).toBeInstanceOf(Date);
            expect(interview.result).toBe('Passed');
            expect(interview.score).toBe(9);
            expect(interview.notes).toBe('Great');
        });
    });

    describe('save', () => {
        const baseData = {
            applicationId: 2,
            interviewStepId: 3,
            employeeId: 4,
            interviewDate: '2024-05-01',
        };

        it('should create a new interview when id is not set', async () => {
            const created = { id: 70 };
            (mockPrisma.interview.create as jest.Mock).mockResolvedValue(created);

            const interview = new Interview(baseData);
            const result = await interview.save();

            expect(mockPrisma.interview.create).toHaveBeenCalledTimes(1);
            const arg = (mockPrisma.interview.create as jest.Mock).mock.calls[0][0];
            expect(arg.data.applicationId).toBe(2);
            expect(mockPrisma.interview.update).not.toHaveBeenCalled();
            expect(result).toEqual(created);
        });

        it('should update an existing interview when id is set', async () => {
            const updated = { id: 1 };
            (mockPrisma.interview.update as jest.Mock).mockResolvedValue(updated);

            const interview = new Interview({ id: 1, ...baseData, score: 10 });
            const result = await interview.save();

            expect(mockPrisma.interview.update).toHaveBeenCalledTimes(1);
            const arg = (mockPrisma.interview.update as jest.Mock).mock.calls[0][0];
            expect(arg.where).toEqual({ id: 1 });
            expect(arg.data.score).toBe(10);
            expect(mockPrisma.interview.create).not.toHaveBeenCalled();
            expect(result).toEqual(updated);
        });
    });

    describe('findOne', () => {
        it('should return an Interview when found', async () => {
            (mockPrisma.interview.findUnique as jest.Mock).mockResolvedValue({
                id: 5,
                applicationId: 2,
                interviewStepId: 3,
                employeeId: 4,
                interviewDate: '2024-05-01',
            });

            const result = await Interview.findOne(5);

            expect(mockPrisma.interview.findUnique).toHaveBeenCalledWith({ where: { id: 5 } });
            expect(result).toBeInstanceOf(Interview);
            expect(result?.id).toBe(5);
        });

        it('should return null when not found', async () => {
            (mockPrisma.interview.findUnique as jest.Mock).mockResolvedValue(null);

            const result = await Interview.findOne(999);

            expect(result).toBeNull();
        });
    });

    describe('delete', () => {
        it('should call prisma.interview.delete with the given id', async () => {
            (mockPrisma.interview.delete as jest.Mock).mockResolvedValue(undefined);

            await Interview.delete(5);

            expect(mockPrisma.interview.delete).toHaveBeenCalledWith({ where: { id: 5 } });
        });
    });
});
