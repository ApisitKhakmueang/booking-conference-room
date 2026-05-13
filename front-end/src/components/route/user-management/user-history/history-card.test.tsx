// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import HistoryCard from './history-card';
import { UserBookingHistoryRes } from '@/utils/interface/response';

describe('HistoryCard Component', () => {
  const mockBooking = {
    id: 'booking-1',
    startTime: '2026-05-06T10:00:00Z',
    endTime: '2026-05-06T11:30:00Z', // ห่างกัน 1h 30m
    status: 'confirm',
    Room: { name: 'Meeting Room A', location: 'Floor 1' }
  } as unknown as UserBookingHistoryRes;

  it('1. Should render date, time, and duration correctly', () => {
    render(<HistoryCard booking={mockBooking} />);
    
    // ตรวจสอบการคำนวณ Date-fns และเวลา[cite: 12]
    expect(screen.getByText('06 May')).toBeInTheDocument();
    expect(screen.getByText('2026')).toBeInTheDocument();
    
    // ตรวจสอบระยะเวลา (1h 30m)[cite: 12]
    expect(screen.getByText('1h 30m')).toBeInTheDocument();
    expect(screen.getByText('Meeting Room A')).toBeInTheDocument();
    expect(screen.getByText('Floor 1')).toBeInTheDocument();
  });

  it('2. Should map "confirm" status to "CONFIRMED"', () => {
    render(<HistoryCard booking={mockBooking} />);
    // ตรวจสอบ Status Mapping[cite: 12]
    expect(screen.getByText('CONFIRMED')).toBeInTheDocument();
  });

  it('3. Should map "no_show" status to "NO-SHOW"', () => {
    const noShowBooking = { ...mockBooking, status: 'no_show' };
    render(<HistoryCard booking={noShowBooking} />);
    // ตรวจสอบเคส No-Show[cite: 12]
    expect(screen.getByText('NO-SHOW')).toBeInTheDocument();
  });
});