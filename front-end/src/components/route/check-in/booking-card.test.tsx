// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import BookingCard from './booking-card';
import { BookingEvent } from '@/utils/interface/interface';

describe('BookingCard Component', () => {
  const mockBooking = {
    title: 'Project Update Meeting',
    date: '2026-05-06T00:00:00+07:00',
    startTime: '2026-05-06T10:00:00+07:00',
    endTime: '2026-05-06T11:00:00+07:00',
    duration: '1 hr',
    user: { fullName: 'Apisit Dev' }
  } as unknown as BookingEvent;

  it('1. Should render booking details correctly', () => {
    render(<BookingCard booking={mockBooking} />);
    
    expect(screen.getByText('Project Update Meeting')).toBeInTheDocument();
    expect(screen.getByText('Apisit Dev')).toBeInTheDocument();
    expect(screen.getByText('(1 hr)')).toBeInTheDocument();
  });

  it('2. Should format date and time correctly', () => {
    render(<BookingCard booking={mockBooking} />);
    
    expect(screen.getByText('Wednesday, 6 May 2026')).toBeInTheDocument();
    // ตรวจสอบเวลาที่ผ่านฟังก์ชัน formatTimeWithSuffix (10:00 AM to 11:00 AM)
    expect(screen.getByText(/10:00 AM to 11:00 AM/i)).toBeInTheDocument();
  });
});