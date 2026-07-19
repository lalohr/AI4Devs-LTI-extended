import { PrismaClient } from '@prisma/client';
import { InterviewType } from '../InterviewType';

jest.mock('@prisma/client', () => {
    const mockPrisma = {
        interviewType: {
            create: jest.fn(),
            update: jest.fn(),
            findUnique: jest.fn(),
        },
    };
    return { PrismaClient: jest.fn(() => mockPrisma) };
});

const mockPrisma = new PrismaClient() as jest.Mocked<PrismaClient>;

describe('InterviewType model', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('constructor', () => {
        it('should map provided data onto the instance', () => {
            const type = new InterviewType({ id: 2, name: 'Technical', description: 'Coding round' });

            expect(type.id).toBe(2);
            expect(type.name).toBe('Technical');
            expect(type.description).toBe('Coding round');
        });

        it('should leave optional fields undefined when not provided', () => {
            const type = new InterviewType({ name: 'HR' });

            expect(type.id).toBeUndefined();
            expect(type.description).toBeUndefined();
        });
    });

    describe('save', () => {
        it('should create a new interview type when id is not set', async () => {
            const created = { id: 3, name: 'Technical', description: 'Coding round' };
            (mockPrisma.interviewType.create as jest.Mock).mockResolvedValue(created);

            const type = new InterviewType({ name: 'Technical', description: 'Coding round' });
            const result = await type.save();

            expect(mockPrisma.interviewType.create).toHaveBeenCalledWith({
                data: { name: 'Technical', description: 'Coding round' },
            });
            expect(mockPrisma.interviewType.update).not.toHaveBeenCalled();
            expect(result).toEqual(created);
        });

        it('should update an existing interview type when id is set', async () => {
            const updated = { id: 2, name: 'Technical v2', description: undefined };
            (mockPrisma.interviewType.update as jest.Mock).mockResolvedValue(updated);

            const type = new InterviewType({ id: 2, name: 'Technical v2' });
            const result = await type.save();

            expect(mockPrisma.interviewType.update).toHaveBeenCalledWith({
                where: { id: 2 },
                data: { name: 'Technical v2', description: undefined },
            });
            expect(mockPrisma.interviewType.create).not.toHaveBeenCalled();
            expect(result).toEqual(updated);
        });
    });

    describe('findOne', () => {
        it('should return an InterviewType instance when a record is found', async () => {
            (mockPrisma.interviewType.findUnique as jest.Mock).mockResolvedValue({ id: 7, name: 'Cultural', description: null });

            const result = await InterviewType.findOne(7);

            expect(mockPrisma.interviewType.findUnique).toHaveBeenCalledWith({ where: { id: 7 } });
            expect(result).toBeInstanceOf(InterviewType);
            expect(result?.id).toBe(7);
        });

        it('should return null when no record is found', async () => {
            (mockPrisma.interviewType.findUnique as jest.Mock).mockResolvedValue(null);

            const result = await InterviewType.findOne(999);

            expect(result).toBeNull();
        });
    });
});
