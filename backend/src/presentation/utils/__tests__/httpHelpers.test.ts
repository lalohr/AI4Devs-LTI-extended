import { getErrorMessage, parseNumericId } from '../httpHelpers';

describe('httpHelpers', () => {
    describe('parseNumericId', () => {
        it('should parse a valid numeric string into a number', () => {
            expect(parseNumericId('42')).toBe(42);
        });

        it('should parse zero', () => {
            expect(parseNumericId('0')).toBe(0);
        });

        it('should parse negative numeric strings', () => {
            expect(parseNumericId('-5')).toBe(-5);
        });

        it('should return null for a non-numeric string', () => {
            expect(parseNumericId('abc')).toBeNull();
        });

        it('should return null for an empty string', () => {
            expect(parseNumericId('')).toBeNull();
        });
    });

    describe('getErrorMessage', () => {
        it('should return the message of an Error instance', () => {
            expect(getErrorMessage(new Error('boom'))).toBe('boom');
        });

        it('should stringify a non-Error value', () => {
            expect(getErrorMessage('plain string')).toBe('plain string');
        });

        it('should stringify null', () => {
            expect(getErrorMessage(null)).toBe('null');
        });

        it('should stringify undefined', () => {
            expect(getErrorMessage(undefined)).toBe('undefined');
        });
    });
});
