// @vitest-environment jsdom
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CardEvents from './event-card';
import Swal from 'sweetalert2';
import { bookingService } from '@/service/booking.service';
import { BookingEvent } from '@/utils/interface/interface';
import { AxiosResponse } from 'axios';

vi.mock('sweetalert2', () => ({ default: { fire: vi.fn() } }));
vi.mock('@/service/booking.service', () => ({ bookingService: { deleteBooking: vi.fn() } }));

describe('CardEvents', () => {
  const mockSetIsAddModalOpen = vi.fn();
  const mockSetCurrentDate = vi.fn();
  const mockOnDeleteSuccess = vi.fn();

  const getMockEvent = (dateOffsetHours = 2) => {
    const d = new Date();
    d.setHours(d.getHours() + dateOffsetHours); // สร้างเวลาอนาคตเพื่อลบได้
    
    // 🌟 สร้างเวลา Start / End เป็น Date object เต็มรูปแบบ
    const start = new Date(d);
    start.setHours(10, 0, 0);
    
    const end = new Date(d);
    end.setHours(11, 0, 0);

    return {
      id: 'book1',
      title: 'Sprint Planning',
      date: d.toISOString(),
      startTime: start.toISOString(), // 🌟 ส่งเป็น ISO String เต็มๆ
      endTime: end.toISOString(),     // 🌟 ส่งเป็น ISO String เต็มๆ
      status: 'approved',
      duration: '1 hr',
      passcode: '1234',
      room: { name: 'Room Alpha' }
    } as unknown as BookingEvent; // 🌟 ลบ as any ออก
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('1. Should render event details correctly', () => {
    const event = getMockEvent();
    render(<CardEvents event={event} setIsAddModalOpen={mockSetIsAddModalOpen} setCurrentDate={mockSetCurrentDate} onDeleteSuccess={mockOnDeleteSuccess} />);
    
    expect(screen.getByText('Room Alpha')).toBeInTheDocument();
    expect(screen.getByText('Sprint Planning')).toBeInTheDocument();
    expect(screen.getByText('1234')).toBeInTheDocument();
    expect(screen.getByText('approved')).toBeInTheDocument();
  });

  it('2. Should open edit modal when card is clicked', () => {
    const event = getMockEvent();
    render(<CardEvents event={event} setIsAddModalOpen={mockSetIsAddModalOpen} setCurrentDate={mockSetCurrentDate} onDeleteSuccess={mockOnDeleteSuccess} />);
    
    fireEvent.click(screen.getByText('Sprint Planning'));
    expect(mockSetIsAddModalOpen).toHaveBeenCalledWith(true);
  });

  it('3. Should block deletion if booking is in the past', async () => {
    const pastEvent = getMockEvent(-2); // สร้างเวลาอดีต (-2 ชั่วโมง)
    render(<CardEvents event={pastEvent} setIsAddModalOpen={mockSetIsAddModalOpen} setCurrentDate={mockSetCurrentDate} onDeleteSuccess={mockOnDeleteSuccess} />);
    
    const deleteBtn = screen.getByRole('button');
    fireEvent.click(deleteBtn);

    expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Error',
      icon: 'error'
    }));
    expect(bookingService.deleteBooking).not.toHaveBeenCalled();
  });

  it('4. Should call API when deletion is confirmed', async () => {
    const futureEvent = getMockEvent(2);
    
    // 🌟 ใช้ vi.mocked แทนการใช้ as any
    vi.mocked(Swal.fire).mockResolvedValue({ isConfirmed: true } as unknown as Awaited<ReturnType<typeof Swal.fire>>);
    vi.mocked(bookingService.deleteBooking).mockResolvedValue({ status: 200 } as unknown as AxiosResponse);

    render(<CardEvents event={futureEvent} setIsAddModalOpen={mockSetIsAddModalOpen} setCurrentDate={mockSetCurrentDate} onDeleteSuccess={mockOnDeleteSuccess} />);
    
    const deleteBtn = screen.getByRole('button');
    fireEvent.click(deleteBtn);

    await waitFor(() => {
      expect(bookingService.deleteBooking).toHaveBeenCalledWith('book1');
      expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ title: 'Deleted!' }));
    });
  });
});