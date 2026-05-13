// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import RoomStatus from './room-status';
import { BookingStatus } from '@/lib/booking-status';
import { RoomResponse } from '@/utils/interface/response';

vi.mock('@/lib/booking-status', () => ({
  BookingStatus: vi.fn(),
}));

describe('RoomStatus Component', () => {
  // 🌟 แก้ any เป็น Type จริง
  const mockDisplayRooms = [] as unknown as RoomResponse[];

  it('1. Should show updating spinner when isLoadingBooking is true', () => {
    // 🌟 ใช้ vi.mocked แทน as any
    vi.mocked(BookingStatus).mockReturnValue([] as unknown as ReturnType<typeof BookingStatus>);
    
    render(<RoomStatus displayRooms={mockDisplayRooms} isLoadingBooking={true} />);
    // ต้องโชว์ข้อความ Updating
    expect(screen.getByText('Updating...')).toBeInTheDocument();
  });

  it('2. Should render statistics cards correctly', () => {
    const mockStats = [
      { name: 'Total', amount: 10, variant: 'purple' },
      { name: 'Available', amount: 8, variant: 'purple' }
    ];
    
    // 🌟 ใช้ vi.mocked แทน as any
    vi.mocked(BookingStatus).mockReturnValue(mockStats as unknown as ReturnType<typeof BookingStatus>);
    
    render(<RoomStatus displayRooms={mockDisplayRooms} isLoadingBooking={false} />);
    
    expect(screen.getByText('Total')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('Available')).toBeInTheDocument();
    expect(screen.getByText('8')).toBeInTheDocument();
  });
});