import { describe, it, expect } from "vitest";
import { calculateDuration, formatTimeWithSuffix } from "./time";

describe('time.ts', () => {

  describe('formatTimeWithSuffix()', () => {
    it('1. Should return correct formatTimeWithSuffix', () => {
      const result = formatTimeWithSuffix('2022-01-01T10:00:00+07:00');
      expect(result).toEqual({
        time: '10:00',
        suffix: 'AM'
      });
    });

    it('2. Should return correct formatTimeWithSuffix with PM', () => {
      const result = formatTimeWithSuffix('2022-01-01T14:00:00+07:00');
      expect(result).toEqual({
        time: '02:00',
        suffix: 'PM'
      });
    });

    it('3. Should return correct formatTimeWithSuffix with midnight', () => {
      const result = formatTimeWithSuffix('2022-01-01T00:00:00+07:00');
      expect(result).toEqual({
        time: '12:00',
        suffix: 'AM'
      });
    });

    it('4. Should return correct formatTimeWithSuffix with noon', () => {
      const result = formatTimeWithSuffix('2022-01-01T12:00:00+07:00');
      expect(result).toEqual({
        time: '12:00',
        suffix: 'PM'
      });
    });
  })

  describe('calculateDuration()', () => {
    it('1. Should return correct duration', () => {
      const result = calculateDuration('10:00', '11:00');
      expect(result).toBe('1h');
    });

    it('2. Should return correct duration with minutes', () => {
      const result = calculateDuration('10:00', '11:30');
      expect(result).toBe('1h 30m');
    });

    it('3. Should return correct duration with limit', () => {
      const result = calculateDuration('10:00', '12:30', 120);
      expect(result).toBe('Limit 2h');
    });

    it('4. Should return correct duration with limit and minutes', () => {
      const result = calculateDuration('10:00', '12:45', 150);
      expect(result).toBe('Limit 2h 30m');
    });

    it('5. Should return "Invalid time" if end time is before start time', () => {
      const result = calculateDuration('11:00', '10:00');
      expect(result).toBe('Invalid time');
    });

    it('6. Should return "Invalid time" if end time is same as start time', () => {
      const result = calculateDuration('10:00', '10:00');
      expect(result).toBe('Invalid time');
    });
  })
})