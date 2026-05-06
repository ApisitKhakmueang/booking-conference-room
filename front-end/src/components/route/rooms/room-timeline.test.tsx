// @vitest-environment jsdom
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import RoomTimeline from './room-timeline';
import { useSystemConfig } from '@/hooks/data/useSystemConfig';
import useSWR from 'swr';

// Mock Dependencies
vi.mock('@/hooks/data/useSystemConfig', () => ({ useSystemConfig: vi.fn() }));
vi.mock('@/service/booking.service', () => ({ bookingService: { fetchAllBookingsByDate: vi.fn() } }));
vi.mock('swr', () => ({ default: vi.fn() }));
vi.mock('@/stores/auth.store', () => ({ useAuthStore: () => ({ user: { id: 'user-1' } }) }));

describe('RoomTimeline Component', () => {
  const mockRooms = [
    { id: '1', name: 'Boardroom', capacity: 10 }
  ] as any;

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock Config เปิดทำการ 08:00 ถึง 20:00[cite: 24]
    (useSystemConfig as any).mockReturnValue({
      config: { startTime: '08:00', endTime: '20:00' }
    });
  });

  it('1. Should render room names and time slots correctly', () => {
    (useSWR as any).mockReturnValue({ data: [], isLoading: false });

    render(<RoomTimeline rooms={mockRooms} />);

    expect(screen.getByText('Boardroom')).toBeInTheDocument();
    // ต้องมีหัวตารางเวลา (เช่น 08:00 AM)
    expect(screen.getByText(/08:00 AM/i)).toBeInTheDocument();
  });

  it('2. Should render bookings blocks correctly', () => {
    const mockBookings = [
      {
        id: 'b1',
        title: 'Morning Sync',
        startTime: '2026-05-06T09:00:00Z',
        endTime: '2026-05-06T10:00:00Z',
        status: 'confirm',
        Room: { id: '1' },
        User: { id: 'user-1', fullName: 'Apisit Dev' }
      }
    ];

    (useSWR as any).mockReturnValue({ data: mockBookings, isLoading: false });

    render(<RoomTimeline rooms={mockRooms} />);

    // ตรวจสอบว่ามีบล็อก Event ปรากฏขึ้น[cite: 24]
    expect(screen.getByText('Morning Sync')).toBeInTheDocument();
  });

  it('3. Should expand booking block when clicked', () => {
    const mockBookings = [
      {
        id: 'b1',
        title: 'Morning Sync',
        startTime: '2026-05-06T09:00:00Z',
        endTime: '2026-05-06T10:00:00Z',
        status: 'confirm',
        Room: { id: '1' }
      }
    ];

    (useSWR as any).mockReturnValue({ data: mockBookings, isLoading: false });

    render(<RoomTimeline rooms={mockRooms} />);

    const bookingBlock = screen.getByText('Morning Sync').closest('div');

    // ตอนแรกยังไม่โดนขยาย (ไม่มีคลาส z-50)[cite: 24]
    expect(bookingBlock).not.toHaveClass('z-50');

    // คลิกเพื่อขยาย
    fireEvent.click(bookingBlock!);

    // หลังคลิก ต้องมีคลาส z-50 โผล่มา[cite: 24]
    expect(bookingBlock).toHaveClass('z-50');
  });
});