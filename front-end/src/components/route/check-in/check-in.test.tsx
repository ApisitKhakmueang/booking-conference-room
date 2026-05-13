// @vitest-environment jsdom
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CheckIn from './check-in';
import { roomService } from '@/service/booking.service';
import useBookingStatusByRoomIDWS from '@/hooks/data/useBookingStatusByRoomIDWS';
import { useSystemConfig } from '@/hooks/data/useSystemConfig';
import { mapBookingEvents } from '@/lib/map-resp-event';

// Mock Dependencies
vi.mock('@/service/booking.service', () => ({ roomService: { fetchRoomByID: vi.fn() } }));
vi.mock('@/hooks/data/useBookingStatusByRoomIDWS', () => ({ default: vi.fn() }));
vi.mock('@/hooks/data/useSystemConfig', () => ({ useSystemConfig: vi.fn() }));
vi.mock('sweetalert2', () => ({ default: { fire: vi.fn() } }));

// 🌟 1. Mock ฟังก์ชันแปลงข้อมูล เพื่อตัดปัญหาเรื่อง Format เวลาผิด
vi.mock('@/lib/map-resp-event', () => ({ mapBookingEvents: vi.fn() }));

describe('CheckIn Page', () => {
  const mockRoom = { id: 'r1', name: 'Boardroom 1', capacity: 5, roomNumber: 101, location: 'Building A', status: 'Available' };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useSystemConfig).mockReturnValue({ config: {} } as any);
    vi.mocked(roomService.fetchRoomByID).mockResolvedValue(mockRoom);
    vi.mocked(mapBookingEvents).mockReturnValue([]);
  });

  // 🌟 2. ใส่ async ให้ข้อ 1
  it('1. Should show skeleton when data is loading', async () => {
    vi.mocked(useBookingStatusByRoomIDWS).mockReturnValue({ booking: undefined, isLoadingBooking: true });
    
    const { container } = render(<CheckIn roomID="r1" />);
    // เช็ค Skeleton ทันทีตอนเรนเดอร์
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();

    // 🌟 3. สั่งให้เทสรอจนกว่า API ดึงชื่อห้องเสร็จ เพื่อเคลียร์ Warning เรื่อง act()
    await waitFor(() => expect(screen.getByText('Boardroom 1')).toBeInTheDocument());
  });

  it('2. Should display "Room Available" state correctly', async () => {
    vi.mocked(useBookingStatusByRoomIDWS).mockReturnValue({ booking: undefined, isLoadingBooking: false });

    render(<CheckIn roomID="r1" />);
    
    await waitFor(() => {
      expect(screen.getByText('Boardroom 1')).toBeInTheDocument();
      expect(screen.getByText('Available')).toBeInTheDocument();
      expect(screen.getByText('Room Available')).toBeInTheDocument(); 
    });
  });

  it('3. Should display "Occupied" state and BookingCard when busy', async () => {
    const mockRawBooking = [{ id: 'b1' }]; // ข้อมูลดิบสมมติ
    vi.mocked(useBookingStatusByRoomIDWS).mockReturnValue({ booking: mockRawBooking as any, isLoadingBooking: false });

    // ✅ แก้ไขตรงนี้
    vi.mocked(mapBookingEvents).mockReturnValue({
      id: 'b1',
      title: 'CEO Meeting',
      status: 'Confirmed', 
      date: '2026-05-06T00:00:00Z',
      startTime: '2026-05-06T10:00:00Z',
      endTime: '2026-05-06T11:00:00Z',
      duration: '1 hr',
      user: { fullName: 'Boss' }
    } as any);

    render(<CheckIn roomID="r1" />);
    
    await waitFor(() => {
      expect(screen.getByText('Occupied')).toBeInTheDocument();
      expect(screen.getByText('CEO Meeting')).toBeInTheDocument(); 
    });
  });

  // 🌟 5. ใส่ async ให้ข้อ 4
  it('4. Should show "Updating..." indicator during WebSocket sync', async () => {
    vi.mocked(useBookingStatusByRoomIDWS).mockReturnValue({ booking: undefined, isLoadingBooking: true });
    
    render(<CheckIn roomID="r1" />);
    expect(screen.getByText('Updating...')).toBeInTheDocument();

    // 🌟 6. สั่งให้เทสรอจนกว่า API ดึงชื่อห้องเสร็จ เพื่อเคลียร์ Warning เรื่อง act()
    await waitFor(() => expect(screen.getByText('Boardroom 1')).toBeInTheDocument());
  });
});