import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { getActiveEmployees } from '../employeeController';

jest.mock('@prisma/client', () => {
    const mockPrisma = {
        employee: {
            findMany: jest.fn(),
        },
    };
    return { PrismaClient: jest.fn(() => mockPrisma) };
});

const mockPrisma = new PrismaClient() as jest.Mocked<PrismaClient>;

describe('employeeController - getActiveEmployees', () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let mockStatus: jest.Mock;
    let mockJson: jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, 'error').mockImplementation(() => {});

        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        mockRequest = {};
        mockResponse = { status: mockStatus, json: mockJson };
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('should return 200 with the list of active employees', async () => {
        const employees = [
            { id: 1, name: 'Alice', email: 'alice@acme.com', role: 'Recruiter' },
            { id: 2, name: 'Bob', email: 'bob@acme.com', role: 'Manager' },
        ];
        (mockPrisma.employee.findMany as jest.Mock).mockResolvedValue(employees);

        await getActiveEmployees(mockRequest as Request, mockResponse as Response);

        expect(mockPrisma.employee.findMany).toHaveBeenCalledWith({
            where: { isActive: true },
            select: { id: true, name: true, email: true, role: true },
            orderBy: { name: 'asc' },
        });
        expect(mockStatus).toHaveBeenCalledWith(200);
        expect(mockJson).toHaveBeenCalledWith(employees);
    });

    it('should return an empty array when there are no active employees', async () => {
        (mockPrisma.employee.findMany as jest.Mock).mockResolvedValue([]);

        await getActiveEmployees(mockRequest as Request, mockResponse as Response);

        expect(mockStatus).toHaveBeenCalledWith(200);
        expect(mockJson).toHaveBeenCalledWith([]);
    });

    it('should return 500 when the database query fails', async () => {
        (mockPrisma.employee.findMany as jest.Mock).mockRejectedValue(new Error('db down'));

        await getActiveEmployees(mockRequest as Request, mockResponse as Response);

        expect(mockStatus).toHaveBeenCalledWith(500);
        expect(mockJson).toHaveBeenCalledWith({
            message: 'Internal server error',
            error: 'An unexpected error occurred',
        });
    });
});
