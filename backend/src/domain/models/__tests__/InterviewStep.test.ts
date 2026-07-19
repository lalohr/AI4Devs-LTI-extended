import { PrismaClient } from '@prisma/client';
import { InterviewStep } from '../InterviewStep';

jest.mock('@prisma/client', () => {
    const mockPrisma = {
        interviewStep: {
            create: jest.fn(),
            update: jest.fn(),
            findUnique: jest.fn(),
        },
    };
    return { PrismaClient: jest.fn(() => mockPrisma) };
});

const mockPrisma = new PrismaClient() as jest.Mocked<PrismaClient>;

describe('InterviewStep model', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('constructor', () => {
        it('should map provided data onto the instance', () => {
            const step = new InterviewStep({
                id: 1,
                interviewFlowId: 2,
                interviewTypeId: 3,
                name: 'Screening',
                orderIndex: 0,
            });

            expect(step.id).toBe(1);
            expect(step.interviewFlowId).toBe(2);
            expect(step.interviewTypeId).toBe(3);
            expect(step.name).toBe('Screening');
            expect(step.orderIndex).toBe(0);
        });
    });

    describe('save', () => {
        const stepData = {
            interviewFlowId: 2,
            interviewTypeId: 3,
            name: 'Screening',
            orderIndex: 0,
        };

        it('should create a new interview step when id is not set', async () => {
            const created = { id: 11, ...stepData };
            (mockPrisma.interviewStep.create as jest.Mock).mockResolvedValue(created);

            const step = new InterviewStep(stepData);
            const result = await step.save();

            expect(mockPrisma.interviewStep.create).toHaveBeenCalledWith({ data: stepData });
            expect(mockPrisma.interviewStep.update).not.toHaveBeenCalled();
            expect(result).toEqual(created);
        });

        it('should update an existing interview step when id is set', async () => {
            const updated = { id: 1, ...stepData };
            (mockPrisma.interviewStep.update as jest.Mock).mockResolvedValue(updated);

            const step = new InterviewStep({ id: 1, ...stepData });
            const result = await step.save();

            expect(mockPrisma.interviewStep.update).toHaveBeenCalledWith({
                where: { id: 1 },
                data: stepData,
            });
            expect(mockPrisma.interviewStep.create).not.toHaveBeenCalled();
            expect(result).toEqual(updated);
        });
    });

    describe('findOne', () => {
        it('should return an InterviewStep instance when a record is found', async () => {
            (mockPrisma.interviewStep.findUnique as jest.Mock).mockResolvedValue({
                id: 6,
                interviewFlowId: 2,
                interviewTypeId: 3,
                name: 'Final',
                orderIndex: 2,
            });

            const result = await InterviewStep.findOne(6);

            expect(mockPrisma.interviewStep.findUnique).toHaveBeenCalledWith({ where: { id: 6 } });
            expect(result).toBeInstanceOf(InterviewStep);
            expect(result?.name).toBe('Final');
        });

        it('should return null when no record is found', async () => {
            (mockPrisma.interviewStep.findUnique as jest.Mock).mockResolvedValue(null);

            const result = await InterviewStep.findOne(999);

            expect(result).toBeNull();
        });
    });
});
