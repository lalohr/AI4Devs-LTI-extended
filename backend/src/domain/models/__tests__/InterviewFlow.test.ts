import { PrismaClient } from '@prisma/client';
import { InterviewFlow } from '../InterviewFlow';

jest.mock('@prisma/client', () => {
    const mockPrisma = {
        interviewFlow: {
            create: jest.fn(),
            update: jest.fn(),
            findUnique: jest.fn(),
        },
    };
    return { PrismaClient: jest.fn(() => mockPrisma) };
});

const mockPrisma = new PrismaClient() as jest.Mocked<PrismaClient>;

describe('InterviewFlow model', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('constructor', () => {
        it('should map provided data onto the instance', () => {
            const flow = new InterviewFlow({ id: 4, description: 'Standard flow' });

            expect(flow.id).toBe(4);
            expect(flow.description).toBe('Standard flow');
        });

        it('should leave optional fields undefined when not provided', () => {
            const flow = new InterviewFlow({});

            expect(flow.id).toBeUndefined();
            expect(flow.description).toBeUndefined();
        });
    });

    describe('save', () => {
        it('should create a new interview flow when id is not set', async () => {
            const created = { id: 8, description: 'New flow' };
            (mockPrisma.interviewFlow.create as jest.Mock).mockResolvedValue(created);

            const flow = new InterviewFlow({ description: 'New flow' });
            const result = await flow.save();

            expect(mockPrisma.interviewFlow.create).toHaveBeenCalledWith({
                data: { description: 'New flow' },
            });
            expect(mockPrisma.interviewFlow.update).not.toHaveBeenCalled();
            expect(result).toEqual(created);
        });

        it('should update an existing interview flow when id is set', async () => {
            const updated = { id: 4, description: 'Updated flow' };
            (mockPrisma.interviewFlow.update as jest.Mock).mockResolvedValue(updated);

            const flow = new InterviewFlow({ id: 4, description: 'Updated flow' });
            const result = await flow.save();

            expect(mockPrisma.interviewFlow.update).toHaveBeenCalledWith({
                where: { id: 4 },
                data: { description: 'Updated flow' },
            });
            expect(mockPrisma.interviewFlow.create).not.toHaveBeenCalled();
            expect(result).toEqual(updated);
        });
    });

    describe('findOne', () => {
        it('should return an InterviewFlow instance when a record is found', async () => {
            (mockPrisma.interviewFlow.findUnique as jest.Mock).mockResolvedValue({ id: 9, description: 'Found flow' });

            const result = await InterviewFlow.findOne(9);

            expect(mockPrisma.interviewFlow.findUnique).toHaveBeenCalledWith({ where: { id: 9 } });
            expect(result).toBeInstanceOf(InterviewFlow);
            expect(result?.description).toBe('Found flow');
        });

        it('should return null when no record is found', async () => {
            (mockPrisma.interviewFlow.findUnique as jest.Mock).mockResolvedValue(null);

            const result = await InterviewFlow.findOne(999);

            expect(result).toBeNull();
        });
    });
});
