import { PrismaClient } from '@prisma/client';
import { Employee } from '../Employee';

jest.mock('@prisma/client', () => {
    const mockPrisma = {
        employee: {
            create: jest.fn(),
            update: jest.fn(),
            findUnique: jest.fn(),
        },
    };
    return { PrismaClient: jest.fn(() => mockPrisma) };
});

const mockPrisma = new PrismaClient() as jest.Mocked<PrismaClient>;

describe('Employee model', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('constructor', () => {
        it('should map provided data onto the instance', () => {
            const employee = new Employee({
                id: 1,
                companyId: 2,
                name: 'Jane',
                email: 'jane@acme.com',
                role: 'Recruiter',
                isActive: false,
            });

            expect(employee.id).toBe(1);
            expect(employee.companyId).toBe(2);
            expect(employee.name).toBe('Jane');
            expect(employee.email).toBe('jane@acme.com');
            expect(employee.role).toBe('Recruiter');
            expect(employee.isActive).toBe(false);
        });

        it('should default isActive to true when not provided', () => {
            const employee = new Employee({ companyId: 2, name: 'Jane', email: 'j@a.com', role: 'HR' });

            expect(employee.isActive).toBe(true);
        });
    });

    describe('save', () => {
        const employeeData = {
            companyId: 2,
            name: 'Jane',
            email: 'jane@acme.com',
            role: 'Recruiter',
            isActive: true,
        };

        it('should create a new employee when id is not set', async () => {
            const created = { id: 12, ...employeeData };
            (mockPrisma.employee.create as jest.Mock).mockResolvedValue(created);

            const employee = new Employee(employeeData);
            const result = await employee.save();

            expect(mockPrisma.employee.create).toHaveBeenCalledWith({ data: employeeData });
            expect(mockPrisma.employee.update).not.toHaveBeenCalled();
            expect(result).toEqual(created);
        });

        it('should update an existing employee when id is set', async () => {
            const updated = { id: 1, ...employeeData };
            (mockPrisma.employee.update as jest.Mock).mockResolvedValue(updated);

            const employee = new Employee({ id: 1, ...employeeData });
            const result = await employee.save();

            expect(mockPrisma.employee.update).toHaveBeenCalledWith({
                where: { id: 1 },
                data: employeeData,
            });
            expect(mockPrisma.employee.create).not.toHaveBeenCalled();
            expect(result).toEqual(updated);
        });
    });

    describe('findOne', () => {
        it('should return an Employee instance when a record is found', async () => {
            (mockPrisma.employee.findUnique as jest.Mock).mockResolvedValue({
                id: 5,
                companyId: 2,
                name: 'Found',
                email: 'found@acme.com',
                role: 'Manager',
                isActive: true,
            });

            const result = await Employee.findOne(5);

            expect(mockPrisma.employee.findUnique).toHaveBeenCalledWith({ where: { id: 5 } });
            expect(result).toBeInstanceOf(Employee);
            expect(result?.name).toBe('Found');
        });

        it('should return null when no record is found', async () => {
            (mockPrisma.employee.findUnique as jest.Mock).mockResolvedValue(null);

            const result = await Employee.findOne(999);

            expect(result).toBeNull();
        });
    });
});
