// @vitest-environment jsdom
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import OccupyModal from './occupy-modal';
import { useAuthStore } from '@/stores/auth.store';
import { bookingService } from '@/service/booking.service';
import Swal from 'sweetalert2';

vi.mock('@/stores/auth.store', () => ({ useAuthStore: vi.fn() }));
vi.mock('@/service/booking.service', () => ({ bookingService: { checkoutBooking: vi.fn() } }));
vi.mock('sweetalert2', () => ({ default: { fire: vi.fn() } }));

describe('OccupyModal Component', () => {
  const mockSetIsOccupyModalOpen = vi.fn();
  
  const mockBooking = {
    id: 'booking-1',
    title: 'Important Meeting',
    startTime: '2026-05-06T10:00:00Z',
    endTime: '2026-05-06T12:00:00Z',
    User: { id: 'user-1', fullName: 'Apisit Dev' }
  } as any;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('1. Should render meeting details correctly', () => {
    (useAuthStore as any).mockReturnValue({ id: 'user-2' }); // สมมติว่าเป็นคนอื่น
    
    render(<OccupyModal setIsOccupyModalOpen={mockSetIsOccupyModalOpen} selectedBooking={mockBooking} />);
    
    expect(screen.getByText('Important Meeting')).toBeInTheDocument();
    expect(screen.getByText('Apisit Dev')).toBeInTheDocument();
  });

  it('2. Should hide "End This Booking" button if user is NOT the owner', () => {
    (useAuthStore as any).mockReturnValue({ id: 'user-2' }); // User 2 ดูการจองของ User 1
    
    render(<OccupyModal setIsOccupyModalOpen={mockSetIsOccupyModalOpen} selectedBooking={mockBooking} />);
    // ต้องไม่เจอปุ่มนี้[cite: 20]
    expect(screen.queryByRole('button', { name: /End This Booking/i })).not.toBeInTheDocument();
  });

  it('3. Should show "End This Booking" button if user IS the owner', () => {
    (useAuthStore as any).mockReturnValue({ id: 'user-1' }); // User 1 ดูการจองของตัวเอง
    
    render(<OccupyModal setIsOccupyModalOpen={mockSetIsOccupyModalOpen} selectedBooking={mockBooking} />);
    // ต้องเจอปุ่มนี้[cite: 20]
    expect(screen.getByRole('button', { name: /End This Booking/i })).toBeInTheDocument();
  });

  it('4. Should call API when ending booking is confirmed', async () => {
    (useAuthStore as any).mockReturnValue({ id: 'user-1' });
    (Swal.fire as any).mockResolvedValue({ isConfirmed: true });
    (bookingService.checkoutBooking as any).mockResolvedValue({ status: 200 });

    // จำลองเวลาให้อยู่ก่อนเวลา End Time เพื่อให้ผ่านเงื่อนไข timeDifference > 0
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-05-06T11:00:00Z'));

    render(<OccupyModal setIsOccupyModalOpen={mockSetIsOccupyModalOpen} selectedBooking={mockBooking} />);
    
    const endBtn = screen.getByRole('button', { name: /End This Booking/i });
    fireEvent.click(endBtn);

    await waitFor(() => {
      // ตรวจสอบว่าเรียก API สำเร็จ และส่ง ID ไปถูกต้อง[cite: 20]
      expect(bookingService.checkoutBooking).toHaveBeenCalledWith('booking-1');
      expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ title: 'Deleted!' }));
    });
    
    vi.useRealTimers();
  });
});