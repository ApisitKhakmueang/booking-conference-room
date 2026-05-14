// @vitest-environment jsdom
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Numpad from './numpad';
import { roomService } from '@/service/booking.service';
import Swal from 'sweetalert2';
import { ParsedBookingEvent } from '@/utils/interface/response';
import { AxiosResponse } from 'axios';

vi.mock('@/service/booking.service', () => ({ roomService: { checkinBooking: vi.fn() } }));
vi.mock('sweetalert2', () => ({ default: { fire: vi.fn() } }));

describe('Numpad Component', () => {
  const mockRoomID = 'room-123';
  const mockBooking = { id: 'book-1' } as unknown as ParsedBookingEvent;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('1. Should update dots as keys are pressed', () => {
    const { container } = render(<Numpad roomID={mockRoomID} booking={mockBooking} />);
    
    fireEvent.click(screen.getByText('1'));
    fireEvent.click(screen.getByText('2'));

    const dots = container.querySelectorAll('.bg-checkin');
    expect(dots.length).toBe(2); // ต้องมีจุดสว่าง 2 จุด
  });

  it('2. Should clear passcode when "C" is clicked', () => {
    const { container } = render(<Numpad roomID={mockRoomID} booking={mockBooking} />);
    fireEvent.click(screen.getByText('1'));
    fireEvent.click(screen.getByText('C'));

    const dots = container.querySelectorAll('.bg-checkin');
    expect(dots.length).toBe(0);
  });

  it('3. Should show error if entering passcode when no booking is active', async () => {
    render(<Numpad roomID={mockRoomID} booking={undefined} />); // ไม่มี booking
    
    // กดรหัสครบ 4 ตัว
    fireEvent.click(screen.getByText('1'));
    fireEvent.click(screen.getByText('1'));
    fireEvent.click(screen.getByText('1'));
    fireEvent.click(screen.getByText('1'));

    expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({
      title: 'No Active Booking'
    }));
  });

  it('4. Should call API when 4 digits are entered correctly', async () => {
    vi.mocked(roomService.checkinBooking).mockResolvedValue({ status: 200 } as unknown as AxiosResponse);

    render(<Numpad roomID={mockRoomID} booking={mockBooking} />);
    
    // พิมพ์ 1234
    fireEvent.click(screen.getByText('1'));
    fireEvent.click(screen.getByText('2'));
    fireEvent.click(screen.getByText('3'));
    fireEvent.click(screen.getByText('4'));

    await waitFor(() => {
      expect(roomService.checkinBooking).toHaveBeenCalledWith(mockRoomID, { passcode: '1234' });
      expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ icon: 'success' }));
    }, { timeout: 1000 });
  });
});