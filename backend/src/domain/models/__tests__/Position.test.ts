import { PrismaClient } from '@prisma/client';
import { Position } from '../Position';

jest.mock('@prisma/client', () => {
    const mockPrisma = {
        position: {
            create: jest.fn(),
            update: jest.fn(),
            findUnique: jest.fn(),
        },
    };
    return { PrismaClient: jest.fn(() => mockPrisma) };
});

const mockPrisma = new PrismaClient() as jest.Mocked<PrismaClient>;

describe('Position model', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('constructor', () => {
        it('should map provided data onto the instance', () => {
            const position = new Position({
                id: 1,
                companyId: 2,
                interviewFlowId: 3,
                title: 'Engineer',
                description: 'desc',
                status: 'Open',
                isVisible: true,
                location: 'Remote',
                jobDescription: 'jd',
                salaryMin: 1000,
                salaryMax: 2000,
                applicationDeadline: '2025-12-31',
            });

            expect(position.id).toBe(1);
            expect(position.title).toBe('Engineer');
            expect(position.status).toBe('Open');
            expect(position.isVisible).toBe(true);
            expect(position.applicationDeadline).toBeInstanceOf(Date);
        });

        it('should apply defaults for status, isVisible and deadline', () => {
            const position = new Position({
                companyId: 2,
                interviewFlowId: 3,
                title: 'Engineer',
                description: 'desc',
                location: 'Remote',
                jobDescription: 'jd',
            });

            expect(position.status).toBe('Draft');
            expect(position.isVisible).toBe(false);
            expect(position.applicationDeadline).toBeUndefined();
        });
    });

    describe('save', () => {
        const baseData = {
            companyId: 2,
            interviewFlowId: 3,
            title: 'Engineer',
            description: 'desc',
            location: 'Remote',
            jobDescription: 'jd',
        };

        it('should create a new position when id is not set', async () => {
            const created = { id: 50, ...baseData };
            (mockPrisma.position.create as jest.Mock).mockResolvedValue(created);

            const position = new Position(baseData);
            const result = await position.save();

            expect(mockPrisma.position.create).toHaveBeenCalledTimes(1);
            const arg = (mockPrisma.position.create as jest.Mock).mock.calls[0][0];
            expect(arg.data.title).toBe('Engineer');
            expect(arg.data.status).toBe('Draft');
            expect(mockPrisma.position.update).not.toHaveBeenCalled();
            expect(result).toEqual(created);
        });

        it('should update an existing position when id is set', async () => {
            const updated = { id: 1, ...baseData };
            (mockPrisma.position.update as jest.Mock).mockResolvedValue(updated);

            const position = new Position({ id: 1, ...baseData });
            const result = await position.save();

            expect(mockPrisma.position.update).toHaveBeenCalledTimes(1);
            const arg = (mockPrisma.position.update as jest.Mock).mock.calls[0][0];
            expect(arg.where).toEqual({ id: 1 });
            expect(mockPrisma.position.create).not.toHaveBeenCalled();
            expect(result).toEqual(updated);
        });
    });

    describe('findOne', () => {
        it('should return a Position instance when a record is found', async () => {
            (mockPrisma.position.findUnique as jest.Mock).mockResolvedValue({ id: 7, title: 'Found' });

            const result = await Position.findOne(7);

            expect(mockPrisma.position.findUnique).toHaveBeenCalledWith({ where: { id: 7 } });
            expect(result).toBeInstanceOf(Position);
            expect(result?.title).toBe('Found');
        });

        it('should return null when no record is found', async () => {
            (mockPrisma.position.findUnique as jest.Mock).mockResolvedValue(null);

            const result = await Position.findOne(999);

            expect(result).toBeNull();
        });
    });

    describe('findOneWithInterviewFlow', () => {
        it('should include the interview flow and steps and return a Position', async () => {
            (mockPrisma.position.findUnique as jest.Mock).mockResolvedValue({ id: 8, title: 'With flow' });

            const result = await Position.findOneWithInterviewFlow(8);

            expect(mockPrisma.position.findUnique).toHaveBeenCalledWith({
                where: { id: 8 },
                include: {
                    interviewFlow: {
                        include: {
                            interviewSteps: true,
                        },
                    },
                },
            });
            expect(result).toBeInstanceOf(Position);
            expect(result?.id).toBe(8);
        });

        it('should return null when no record is found', async () => {
            (mockPrisma.position.findUnique as jest.Mock).mockResolvedValue(null);

            const result = await Position.findOneWithInterviewFlow(999);

            expect(result).toBeNull();
        });
    });
});
