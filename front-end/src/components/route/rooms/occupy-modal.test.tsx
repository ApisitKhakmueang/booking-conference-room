// @vitest-environment jsdom
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import OccupyModal from './occupy-modal';
import React from 'react';
import { useAuthStore } from '@/stores/auth.store';
import { bookingService } from '@/service/booking.service';
import Swal from 'sweetalert2';
import { BookingEventResponse } from '@/utils/interface/response';
import { AxiosResponse } from 'axios';

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
  } as unknown as BookingEventResponse; // 🌟 1. ลบ any ตรงนี้ออก

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('1. Should render meeting details correctly', () => {
    // 🌟 2. ใช้ vi.mocked แทน as any
    vi.mocked(useAuthStore).mockReturnValue({ id: 'user-2' } as unknown as ReturnType<typeof useAuthStore>);
    
    render(<OccupyModal setIsOccupyModalOpen={mockSetIsOccupyModalOpen} selectedBooking={mockBooking} />);
    
    expect(screen.getByText('Important Meeting')).toBeInTheDocument();
    expect(screen.getByText('Apisit Dev')).toBeInTheDocument();
  });

  it('2. Should hide "End This Booking" button if user is NOT the owner', () => {
    vi.mocked(useAuthStore).mockReturnValue({ id: 'user-2' } as unknown as ReturnType<typeof useAuthStore>);
    
    render(<OccupyModal setIsOccupyModalOpen={mockSetIsOccupyModalOpen} selectedBooking={mockBooking} />);
    expect(screen.queryByRole('button', { name: /End This Booking/i })).not.toBeInTheDocument();
  });

  it('3. Should show "End This Booking" button if user IS the owner', () => {
    vi.mocked(useAuthStore).mockReturnValue({ id: 'user-1' } as unknown as ReturnType<typeof useAuthStore>);
    
    render(<OccupyModal setIsOccupyModalOpen={mockSetIsOccupyModalOpen} selectedBooking={mockBooking} />);
    expect(screen.getByRole('button', { name: /End This Booking/i })).toBeInTheDocument();
  });

  it('4. Should call API when ending booking is confirmed', async () => {
    vi.mocked(useAuthStore).mockReturnValue({ id: 'user-1' } as unknown as ReturnType<typeof useAuthStore>);
    
    // 🌟 3. ใช้ vi.mocked ครอบ Swal และ API
    vi.mocked(Swal.fire).mockResolvedValue({ isConfirmed: true } as unknown as Awaited<ReturnType<typeof Swal.fire>>);
    vi.mocked(bookingService.checkoutBooking).mockResolvedValue({ status: 200 } as unknown as AxiosResponse);

    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-05-06T11:00:00Z'));

    render(<OccupyModal setIsOccupyModalOpen={mockSetIsOccupyModalOpen} selectedBooking={mockBooking} />);
    
    const endBtn = screen.getByRole('button', { name: /End This Booking/i });
    fireEvent.click(endBtn);

    await waitFor(() => {
      expect(bookingService.checkoutBooking).toHaveBeenCalledWith('booking-1');
      expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ title: 'Deleted!' }));
    });
    
    vi.useRealTimers();
  });
});