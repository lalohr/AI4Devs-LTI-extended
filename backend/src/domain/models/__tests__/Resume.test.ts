import { PrismaClient } from '@prisma/client';
import { Resume } from '../Resume';

jest.mock('@prisma/client', () => {
    const mockPrisma = {
        resume: {
            create: jest.fn(),
        },
    };
    return { PrismaClient: jest.fn(() => mockPrisma) };
});

const mockPrisma = new PrismaClient() as jest.Mocked<PrismaClient>;

describe('Resume model', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, 'log').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('constructor', () => {
        it('should map provided data and set uploadDate to a Date', () => {
            const resume = new Resume({ id: 1, candidateId: 2, filePath: '/tmp/cv.pdf', fileType: 'application/pdf' });

            expect(resume.id).toBe(1);
            expect(resume.candidateId).toBe(2);
            expect(resume.filePath).toBe('/tmp/cv.pdf');
            expect(resume.fileType).toBe('application/pdf');
            expect(resume.uploadDate).toBeInstanceOf(Date);
        });

        it('should handle missing data gracefully', () => {
            const resume = new Resume(undefined);

            expect(resume.id).toBeUndefined();
            expect(resume.uploadDate).toBeInstanceOf(Date);
        });
    });

    describe('save', () => {
        it('should create a new resume when id is not set and return a Resume instance', async () => {
            (mockPrisma.resume.create as jest.Mock).mockResolvedValue({
                id: 40,
                candidateId: 2,
                filePath: '/tmp/cv.pdf',
                fileType: 'application/pdf',
            });

            const resume = new Resume({ candidateId: 2, filePath: '/tmp/cv.pdf', fileType: 'application/pdf' });
            const result = await resume.save();

            expect(mockPrisma.resume.create).toHaveBeenCalledTimes(1);
            const arg = (mockPrisma.resume.create as jest.Mock).mock.calls[0][0];
            expect(arg.data.candidateId).toBe(2);
            expect(arg.data.filePath).toBe('/tmp/cv.pdf');
            expect(result).toBeInstanceOf(Resume);
            expect(result.id).toBe(40);
        });

        it('should throw an error when trying to update an existing resume', async () => {
            const resume = new Resume({ id: 1, candidateId: 2, filePath: '/tmp/cv.pdf', fileType: 'application/pdf' });

            await expect(resume.save()).rejects.toThrow(
                'No se permite la actualización de un currículum existente.'
            );
            expect(mockPrisma.resume.create).not.toHaveBeenCalled();
        });
    });
});
