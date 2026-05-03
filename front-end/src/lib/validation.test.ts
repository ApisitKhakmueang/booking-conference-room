import { describe, it, expect, vi } from "vitest";
import { checkStrongPassword, validateBookingForm } from "./validation";

vi.mock('sweetalert2', () => ({
  default: {
    fire: vi.fn(), // เปลี่ยนฟังก์ชัน fire เป็นฟังก์ชันจำลองโง่ๆ ที่ไม่ทำอะไรเลย
  }
}));

describe('validation.ts', () => {
  describe('validateBookingForm()', () => {
    it('1. Should return true if all fields are valid', () => {
      const result = validateBookingForm({
        startTime: '12:00',
        endTime: '13:00',
        duration: '1:00',
        date: new Date(),
        maxAdvanceDays: 30
      });
      expect(result).toBe(true);
    });

    it('2. Should return false if startTime is greater than endTime', () => {
      const result = validateBookingForm({
        startTime: '13:00',
        endTime: '12:00',
        duration: '1:00',
        date: new Date(),
        maxAdvanceDays: 30
      });
      expect(result).toBe(false);
    });

    it('3. Should return false if startTime is empty', () => {
      const result = validateBookingForm({
        startTime: '',
        endTime: '12:00',
        duration: '1:00',
        date: new Date(),
        maxAdvanceDays: 30
      });
      expect(result).toBe(false);
    });

    it('4. Should return false if endTime is empty', () => {
      const result = validateBookingForm({
        startTime: '12:00',
        endTime: '',
        duration: '1:00',
        date: new Date(),
        maxAdvanceDays: 30
      });
      expect(result).toBe(false);
    });

    it('5. Should return false if duration is empty', () => {
      const result = validateBookingForm({
        startTime: '12:00',
        endTime: '13:00',
        duration: '',
        date: new Date(),
        maxAdvanceDays: 30
      });
      expect(result).toBe(false);
    });
  });

  describe('checkStrongPassword()', () => {
    it('1. Should return true if password is strong', () => {
      const result = checkStrongPassword('Guyae2546!');
      expect(result).toBe(true);
    });

    it('2. Should return false if password does not contain uppercase letter', () => {
      const result = checkStrongPassword('guyae2546!');
      expect(result).toBe(false);
    });

    it('3. Should return false if password does not contain lowercase letter', () => {
      const result = checkStrongPassword('GUYAE2546!');
      expect(result).toBe(false);
    });

    it('4. Should return false if password does not contain number', () => {
      const result = checkStrongPassword('Guyae!');
      expect(result).toBe(false);
    });

    it('5. Should return false if password does not contain special character', () => {
      const result = checkStrongPassword('Guyae2546');
      expect(result).toBe(false);
    });
  });
})