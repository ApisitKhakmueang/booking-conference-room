// @vitest-environment jsdom
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Schedule from './schedule';
import { bookingService } from '@/service/booking.service';
import { useSystemConfig } from '@/hooks/data/useSystemConfig';

// Mock Dependencies
vi.mock('@/service/booking.service', () => ({
  bookingService: { fetchUserBookings: vi.fn() },
}));
vi.mock('@/hooks/data/useSystemConfig', () => ({
  useSystemConfig: vi.fn(),
}));
vi.mock('@/hooks/data/useRoomData', () => ({
  useRoomData: () => ({ room: [], isLoading: false }) // ป้องกัน Error จาก DesktopSidebar
}));
vi.mock('sweetalert2', () => ({ default: { fire: vi.fn() } }));

describe('Schedule Main Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useSystemConfig as any).mockReturnValue({ config: {}, isLoadingConfig: false });
    
    // 🌟 แก้ไขบรรทัดนี้: บังคับให้ Mock แค่ Date เท่านั้น เพื่อให้ waitFor ยังทำงานได้ปกติ
    vi.useFakeTimers({ toFake: ['Date'] }); 
    vi.setSystemTime(new Date('2026-05-06T10:00:00'));
  });

  afterEach(() => {
    vi.useRealTimers(); // คืนค่าเวลาจริง
  });

  it('1. Should display Skeletons while loading data (events undefined)', () => {
    // ให้ API คืนค่าแบบค้างๆ (ยังไม่ resolve) เพื่อจำลองสถานะ Loading
    (bookingService.fetchUserBookings as any).mockReturnValue(new Promise(() => {}));
    
    render(<Schedule />);
    
    const skeletons = screen.getAllByRole('generic').filter(el => el.classList.contains('animate-pulse'));
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('2. Should display "No Content" if API returns empty array', async () => {
    (bookingService.fetchUserBookings as any).mockResolvedValue([]);
    
    render(<Schedule />);
    
    await waitFor(() => {
      expect(screen.getByText('No Content')).toBeInTheDocument();
      expect(screen.getByText(/You don't have any bookings matching the criteria/i)).toBeInTheDocument();
    });
  });

  it('3. Should classify and render events based on live status', async () => {
    // สมมติเวลาปัจจุบันคือ 10:00
    const mockEvents = [
      { id: '1', startTime: '2026-05-06T09:30:00', endTime: '2026-05-06T10:30:00', title: 'In Progress Event' }, // คร่อมเวลา 10:00 พอดี
      { id: '2', startTime: '2026-05-06T10:10:00', endTime: '2026-05-06T11:00:00', title: 'Upcoming Event' },    // เริ่มในอีก 10 นาที (<=15m)
      { id: '3', startTime: '2026-05-06T14:00:00', endTime: '2026-05-06T15:00:00', title: 'Normal Event' }       // เริ่มบ่ายๆ
    ];

    (bookingService.fetchUserBookings as any).mockResolvedValue(mockEvents);
    
    render(<Schedule />);

    await waitFor(() => {
      // ตรวจสอบว่ามีกลุ่มเหล่านี้แสดงขึ้นมา
      expect(screen.getByText('In Progress')).toBeInTheDocument();
      expect(screen.getByText('Upcoming')).toBeInTheDocument();
      expect(screen.getByText('Scheduled Bookings')).toBeInTheDocument();
    });
  });

  it('4. Should change date when Prev/Next/Today buttons are clicked', async () => {
    (bookingService.fetchUserBookings as any).mockResolvedValue([]);
    render(<Schedule />);
    
    // เดิมหน้าจอต้องโชว์วันที่ 6 ตาม FakeTimer
    expect(screen.getByText(/Wednesday, 6 May 2026/i)).toBeInTheDocument();
    
    // กด Next
    const nextBtn = screen.getByRole('button', { name: 'Next' });
    fireEvent.click(nextBtn);
    expect(screen.getByText(/Thursday, 7 May 2026/i)).toBeInTheDocument();

    // กด Today (กลับมาที่เดิม)
    const todayBtn = screen.getByRole('button', { name: 'Today' });
    fireEvent.click(todayBtn);
    expect(screen.getByText(/Wednesday, 6 May 2026/i)).toBeInTheDocument();
  });
});