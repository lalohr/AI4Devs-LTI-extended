import { PrismaClient } from '@prisma/client';
import { Education } from '../Education';

jest.mock('@prisma/client', () => {
    const mockPrisma = {
        education: {
            create: jest.fn(),
            update: jest.fn(),
        },
    };
    return { PrismaClient: jest.fn(() => mockPrisma) };
});

const mockPrisma = new PrismaClient() as jest.Mocked<PrismaClient>;

describe('Education model', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('constructor', () => {
        it('should convert date strings to Date objects', () => {
            const education = new Education({
                id: 1,
                institution: 'MIT',
                title: 'BSc',
                startDate: '2018-09-01',
                endDate: '2022-06-01',
                candidateId: 3,
            });

            expect(education.institution).toBe('MIT');
            expect(education.startDate).toBeInstanceOf(Date);
            expect(education.startDate.toISOString()).toContain('2018-09-01');
            expect(education.endDate).toBeInstanceOf(Date);
            expect(education.candidateId).toBe(3);
        });

        it('should leave endDate undefined when not provided', () => {
            const education = new Education({ institution: 'MIT', title: 'BSc', startDate: '2018-09-01' });

            expect(education.endDate).toBeUndefined();
        });
    });

    describe('save', () => {
        it('should create a new education record when id is not set', async () => {
            const created = { id: 20 };
            (mockPrisma.education.create as jest.Mock).mockResolvedValue(created);

            const education = new Education({
                institution: 'MIT',
                title: 'BSc',
                startDate: '2018-09-01',
                candidateId: 3,
            });
            const result = await education.save();

            expect(mockPrisma.education.create).toHaveBeenCalledTimes(1);
            const arg = (mockPrisma.education.create as jest.Mock).mock.calls[0][0];
            expect(arg.data.institution).toBe('MIT');
            expect(arg.data.candidateId).toBe(3);
            expect(result).toEqual(created);
        });

        it('should not include candidateId when it is undefined', async () => {
            (mockPrisma.education.create as jest.Mock).mockResolvedValue({ id: 21 });

            const education = new Education({ institution: 'MIT', title: 'BSc', startDate: '2018-09-01' });
            await education.save();

            const arg = (mockPrisma.education.create as jest.Mock).mock.calls[0][0];
            expect(arg.data).not.toHaveProperty('candidateId');
        });

        it('should update an existing education record when id is set', async () => {
            const updated = { id: 1 };
            (mockPrisma.education.update as jest.Mock).mockResolvedValue(updated);

            const education = new Education({
                id: 1,
                institution: 'MIT',
                title: 'MSc',
                startDate: '2018-09-01',
                candidateId: 3,
            });
            const result = await education.save();

            expect(mockPrisma.education.update).toHaveBeenCalledTimes(1);
            const arg = (mockPrisma.education.update as jest.Mock).mock.calls[0][0];
            expect(arg.where).toEqual({ id: 1 });
            expect(arg.data.title).toBe('MSc');
            expect(mockPrisma.education.create).not.toHaveBeenCalled();
            expect(result).toEqual(updated);
        });
    });
});
