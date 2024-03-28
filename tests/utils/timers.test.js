import { startTimer, getDurationInSecs } from '../../icarus-core/utils/timers';

describe('timers.js', () => {
  describe('startTimer()', () => {
    it('returns an array with two elements', () => {
      const timer = startTimer();
      expect(Array.isArray(timer)).toBe(true); // Check if the returned value is an array
      expect(timer).toHaveLength(2);
    });

    it('the elements of the array are numbers', () => {
      const [seconds, nanoseconds] = startTimer();
      expect(typeof seconds).toBe('number');
      expect(typeof nanoseconds).toBe('number');
    });
  });

  describe('getDurationInSecs()', () => {
    it('returns the duration in seconds between two high-resolution time points', () => {
      const startTime = [1, 500000000]; // 1.5 seconds
      const endTime = [3, 200000000]; // 3.2 seconds

      const duration = getDurationInSecs(startTime, endTime);
      expect(duration).toBeCloseTo(1.7); // The duration should be 1.7 seconds (3.2 - 1.5)
    });
  });
});
