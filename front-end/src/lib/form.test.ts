import { describe, it, expect } from "vitest";
import { bodyBooking, formatBookingEvent } from "./form";
import { startOfDay, add, format, parseISO } from "date-fns";

describe('form.ts', () => {
  describe('bodyBooking()', () => {
    it('1. Should return correct bodyBooking', () => {
      const formData = {
        title: 'Test',
        date: new Date(),
        startTime: '10:00',
        endTime: '11:00',
        duration: '1',
        room: {
          id: '1',
          name: 'Room 1',
          roomNumber: 101
        }
      };
      const result = bodyBooking(formData);
      expect(result).toEqual({
        title: 'Test',
        startTime: format(add(startOfDay(formData.date), { hours: 10, minutes: 0 }), "yyyy-MM-dd'T'HH:mm:ssXXX"),
        endTime: format(add(startOfDay(formData.date), { hours: 11, minutes: 0 }), "yyyy-MM-dd'T'HH:mm:ssXXX"),
      });
    });
  });

  describe('formatBookingEvent()', () => {
    it('1. Should return correct formatBookingEvent', () => {
      const event = {
        title: 'Test',
        startTime: '2022-01-01T10:00:00+07:00',
        endTime: '2022-01-01T11:00:00+07:00',
      };
      const result = formatBookingEvent(event);
      expect(result).toEqual({
        title: 'Test',
        startTime: parseISO(event.startTime),
        endTime: parseISO(event.endTime),
      });
    });
  });
})