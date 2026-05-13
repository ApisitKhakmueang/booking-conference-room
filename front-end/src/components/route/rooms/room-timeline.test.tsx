// @vitest-environment jsdom
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import RoomTimeline from './room-timeline';
import { useSystemConfig } from '@/hooks/data/useSystemConfig';
import useSWR from 'swr';
import { RoomResponse, BookingEventResponse } from '@/utils/interface/response';

// Mock Dependencies
vi.mock('@/hooks/data/useSystemConfig', () => ({ useSystemConfig: vi.fn() }));
vi.mock('@/service/booking.service', () => ({ bookingService: { fetchAllBookingsByDate: vi.fn() } }));
vi.mock('swr', () => ({ default: vi.fn() }));
vi.mock('@/stores/auth.store', () => ({ useAuthStore: () => ({ user: { id: 'user-1' } }) }));

describe('RoomTimeline Component', () => {
  const mockRooms = [
    { id: '1', name: 'Boardroom', capacity: 10 }
  ] as unknown as RoomResponse[]; // 🌟 แก้ any เป็น Type จริง

  beforeEach(() => {
    vi.clearAllMocks();

    // 🌟 ใช้ vi.mocked และ ReturnType เพื่อหลอก Type แบบเนียนๆ
    vi.mocked(useSystemConfig).mockReturnValue({
      config: { startTime: '08:00', endTime: '20:00' }
    } as unknown as ReturnType<typeof useSystemConfig>);
  });

  it('1. Should render room names and time slots correctly', () => {
    // 🌟 ใช้ vi.mocked แทน as any
    vi.mocked(useSWR).mockReturnValue({ data: [], isLoading: false } as unknown as ReturnType<typeof useSWR>);

    render(<RoomTimeline rooms={mockRooms} />);

    expect(screen.getByText('Boardroom')).toBeInTheDocument();
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

    // 🌟 ใช้ vi.mocked และครอบ BookingEventResponse เข้าไป
    vi.mocked(useSWR).mockReturnValue({ 
      data: mockBookings as unknown as BookingEventResponse[], 
      isLoading: false 
    } as unknown as ReturnType<typeof useSWR>);

    render(<RoomTimeline rooms={mockRooms} />);

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

    // 🌟 ใช้ vi.mocked แทน as any
    vi.mocked(useSWR).mockReturnValue({ 
      data: mockBookings as unknown as BookingEventResponse[], 
      isLoading: false 
    } as unknown as ReturnType<typeof useSWR>);

    render(<RoomTimeline rooms={mockRooms} />);

    const bookingBlock = screen.getByText('Morning Sync').closest('div');

    expect(bookingBlock).not.toHaveClass('z-50');

    fireEvent.click(bookingBlock!);

    expect(bookingBlock).toHaveClass('z-50');
  });
});