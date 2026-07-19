import { PrismaClient } from '@prisma/client';
import { WorkExperience } from '../WorkExperience';

jest.mock('@prisma/client', () => {
    const mockPrisma = {
        workExperience: {
            create: jest.fn(),
            update: jest.fn(),
        },
    };
    return { PrismaClient: jest.fn(() => mockPrisma) };
});

const mockPrisma = new PrismaClient() as jest.Mocked<PrismaClient>;

describe('WorkExperience model', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('constructor', () => {
        it('should convert date strings to Date objects', () => {
            const exp = new WorkExperience({
                id: 1,
                company: 'Acme',
                position: 'Engineer',
                description: 'Building things',
                startDate: '2020-01-01',
                endDate: '2022-01-01',
                candidateId: 4,
            });

            expect(exp.company).toBe('Acme');
            expect(exp.position).toBe('Engineer');
            expect(exp.startDate).toBeInstanceOf(Date);
            expect(exp.endDate).toBeInstanceOf(Date);
            expect(exp.candidateId).toBe(4);
        });

        it('should leave endDate undefined when not provided', () => {
            const exp = new WorkExperience({ company: 'Acme', position: 'Engineer', startDate: '2020-01-01' });

            expect(exp.endDate).toBeUndefined();
        });
    });

    describe('save', () => {
        it('should create a new work experience when id is not set', async () => {
            const created = { id: 30 };
            (mockPrisma.workExperience.create as jest.Mock).mockResolvedValue(created);

            const exp = new WorkExperience({
                company: 'Acme',
                position: 'Engineer',
                startDate: '2020-01-01',
                candidateId: 4,
            });
            const result = await exp.save();

            expect(mockPrisma.workExperience.create).toHaveBeenCalledTimes(1);
            const arg = (mockPrisma.workExperience.create as jest.Mock).mock.calls[0][0];
            expect(arg.data.company).toBe('Acme');
            expect(arg.data.candidateId).toBe(4);
            expect(result).toEqual(created);
        });

        it('should not include candidateId when it is undefined', async () => {
            (mockPrisma.workExperience.create as jest.Mock).mockResolvedValue({ id: 31 });

            const exp = new WorkExperience({ company: 'Acme', position: 'Engineer', startDate: '2020-01-01' });
            await exp.save();

            const arg = (mockPrisma.workExperience.create as jest.Mock).mock.calls[0][0];
            expect(arg.data).not.toHaveProperty('candidateId');
        });

        it('should update an existing work experience when id is set', async () => {
            const updated = { id: 1 };
            (mockPrisma.workExperience.update as jest.Mock).mockResolvedValue(updated);

            const exp = new WorkExperience({
                id: 1,
                company: 'Acme',
                position: 'Senior Engineer',
                startDate: '2020-01-01',
            });
            const result = await exp.save();

            expect(mockPrisma.workExperience.update).toHaveBeenCalledTimes(1);
            const arg = (mockPrisma.workExperience.update as jest.Mock).mock.calls[0][0];
            expect(arg.where).toEqual({ id: 1 });
            expect(arg.data.position).toBe('Senior Engineer');
            expect(mockPrisma.workExperience.create).not.toHaveBeenCalled();
            expect(result).toEqual(updated);
        });
    });
});
