import { Request, Response } from 'express';

// Captured pieces of the multer configuration so the real file-handling logic
// (storage callbacks and fileFilter) can be exercised without touching disk.
let capturedOptions: any;
let capturedStorageConfig: any;

class MockMulterError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'MulterError';
    }
}

// The middleware returned by upload.single(). Tests control its behaviour by
// setting `uploaderImpl` before invoking uploadFile.
let uploaderImpl: (req: any, res: any, cb: (err?: any) => void) => void;

jest.mock('multer', () => {
    const multerMock: any = jest.fn((options: any) => {
        capturedOptions = options;
        return {
            single: jest.fn(() => (req: any, res: any, cb: (err?: any) => void) => uploaderImpl(req, res, cb)),
        };
    });
    multerMock.diskStorage = jest.fn((config: any) => {
        capturedStorageConfig = config;
        return {};
    });
    multerMock.MulterError = MockMulterError;
    return { __esModule: true, default: multerMock };
});

// eslint-disable-next-line @typescript-eslint/no-var-requires
import { uploadFile } from '../fileUploadService';

describe('fileUploadService', () => {
    let mockResponse: Partial<Response>;
    let mockStatus: jest.Mock;
    let mockJson: jest.Mock;

    beforeEach(() => {
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        mockResponse = { status: mockStatus, json: mockJson };
    });

    describe('multer configuration', () => {
        it('should configure a 10MB file size limit', () => {
            expect(capturedOptions.limits.fileSize).toBe(1024 * 1024 * 10);
        });

        it('storage destination callback should point to the uploads directory', () => {
            const cb = jest.fn();
            capturedStorageConfig.destination({}, {}, cb);
            expect(cb).toHaveBeenCalledWith(null, '../uploads/');
        });

        it('storage filename callback should prefix the original name with a timestamp', () => {
            const cb = jest.fn();
            capturedStorageConfig.filename({}, { originalname: 'cv.pdf' }, cb);
            expect(cb).toHaveBeenCalledTimes(1);
            const [, generatedName] = cb.mock.calls[0];
            expect(generatedName).toMatch(/^\d+-cv\.pdf$/);
        });

        it('fileFilter should accept PDF files', () => {
            const cb = jest.fn();
            capturedOptions.fileFilter({}, { mimetype: 'application/pdf' }, cb);
            expect(cb).toHaveBeenCalledWith(null, true);
        });

        it('fileFilter should accept DOCX files', () => {
            const cb = jest.fn();
            capturedOptions.fileFilter(
                {},
                { mimetype: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' },
                cb
            );
            expect(cb).toHaveBeenCalledWith(null, true);
        });

        it('fileFilter should reject other file types', () => {
            const cb = jest.fn();
            capturedOptions.fileFilter({}, { mimetype: 'image/png' }, cb);
            expect(cb).toHaveBeenCalledWith(null, false);
        });
    });

    describe('uploadFile', () => {
        it('should respond 200 with file path and type on success', () => {
            const req = { file: { path: '/uploads/1-cv.pdf', mimetype: 'application/pdf' } };
            uploaderImpl = (_req, _res, cb) => cb(undefined);

            uploadFile(req as unknown as Request, mockResponse as Response);

            expect(mockStatus).toHaveBeenCalledWith(200);
            expect(mockJson).toHaveBeenCalledWith({
                filePath: '/uploads/1-cv.pdf',
                fileType: 'application/pdf',
            });
        });

        it('should respond 400 when no file is present (rejected by filter)', () => {
            const req = {};
            uploaderImpl = (_req, _res, cb) => cb(undefined);

            uploadFile(req as unknown as Request, mockResponse as Response);

            expect(mockStatus).toHaveBeenCalledWith(400);
            expect(mockJson).toHaveBeenCalledWith({
                error: 'Invalid file type, only PDF and DOCX are allowed!',
            });
        });

        it('should respond 500 on a MulterError', () => {
            const req = {};
            uploaderImpl = (_req, _res, cb) => cb(new MockMulterError('File too large'));

            uploadFile(req as unknown as Request, mockResponse as Response);

            expect(mockStatus).toHaveBeenCalledWith(500);
            expect(mockJson).toHaveBeenCalledWith({ error: 'File too large' });
        });

        it('should respond 500 on a generic error', () => {
            const req = {};
            uploaderImpl = (_req, _res, cb) => cb(new Error('unexpected'));

            uploadFile(req as unknown as Request, mockResponse as Response);

            expect(mockStatus).toHaveBeenCalledWith(500);
            expect(mockJson).toHaveBeenCalledWith({ error: 'unexpected' });
        });
    });
});
