import { Logger } from '../logger';

describe('Logger', () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('should log info messages with an [INFO] prefix and forward extra args', () => {
        const spy = jest.spyOn(console, 'log').mockImplementation(() => {});

        Logger.info('hello', 1, 'two');

        expect(spy).toHaveBeenCalledWith('[INFO] hello', 1, 'two');
    });

    it('should log error messages with an [ERROR] prefix', () => {
        const spy = jest.spyOn(console, 'error').mockImplementation(() => {});

        Logger.error('boom');

        expect(spy).toHaveBeenCalledWith('[ERROR] boom');
    });

    it('should log warn messages with a [WARN] prefix', () => {
        const spy = jest.spyOn(console, 'warn').mockImplementation(() => {});

        Logger.warn('careful', { detail: true });

        expect(spy).toHaveBeenCalledWith('[WARN] careful', { detail: true });
    });
});
