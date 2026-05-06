// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import RoomStatus from './room-status';
import { BookingStatus } from '@/lib/booking-status';

vi.mock('@/lib/booking-status', () => ({
  BookingStatus: vi.fn(),
}));

describe('RoomStatus Component', () => {
  const mockDisplayRooms = [] as any;

  it('1. Should show updating spinner when isLoadingBooking is true', () => {
    (BookingStatus as any).mockReturnValue([]);
    
    render(<RoomStatus displayRooms={mockDisplayRooms} isLoadingBooking={true} />);
    // ต้องโชว์ข้อความ Updating[cite: 23]
    expect(screen.getByText('Updating...')).toBeInTheDocument();
  });

  it('2. Should render statistics cards correctly', () => {
    const mockStats = [
      { name: 'Total', amount: 10, variant: 'purple' },
      { name: 'Available', amount: 8, variant: 'purple' }
    ];
    (BookingStatus as any).mockReturnValue(mockStats);
    
    render(<RoomStatus displayRooms={mockDisplayRooms} isLoadingBooking={false} />);
    
    expect(screen.getByText('Total')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('Available')).toBeInTheDocument();
    expect(screen.getByText('8')).toBeInTheDocument();
  });
});