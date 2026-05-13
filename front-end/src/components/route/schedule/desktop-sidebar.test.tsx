// @vitest-environment jsdom
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import DesktopSidebar from './desktop-sidebar';
import { useRoomData } from '@/hooks/data/useRoomData';
import { BookingEvent } from '@/utils/interface/interface';

// Mock hook เพื่อจำลองข้อมูลห้อง
vi.mock('@/hooks/data/useRoomData', () => ({
  useRoomData: vi.fn(),
}));

describe('DesktopSidebar', () => {
  const mockSetSelectedRooms = vi.fn();
  const mockSetCurrentDate = vi.fn();
  const mockSetCurrentMonth = vi.fn();
  
  const defaultProps = {
    currentDate: new Date('2026-05-06'),
    setCurrentDate: mockSetCurrentDate,
    currentMonth: new Date('2026-05-01'),
    setCurrentMonth: mockSetCurrentMonth,
    events: [{ id: '1' }, { id: '2' }] as unknown as BookingEvent[], // 🌟 ลบ as any ออก
    selectedRooms: [101],
    setSelectedRooms: mockSetSelectedRooms,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // 🌟 ใช้ vi.mocked แทน
    vi.mocked(useRoomData).mockReturnValue({
      room: [
        { id: '1', name: 'Boardroom', roomNumber: 101 },
        { id: '2', name: 'Meeting A', roomNumber: 102 }
      ],
      isLoading: false,
    } as unknown as ReturnType<typeof useRoomData>);
  });

  it('1. Should render total events correctly', () => {
    render(<DesktopSidebar {...defaultProps} />);
    expect(screen.getByText(/total events/i)).toBeInTheDocument(); 
  });

  it('2. Should render checkboxes for each room', () => {
    render(<DesktopSidebar {...defaultProps} />);
    expect(screen.getByLabelText('Boardroom')).toBeInTheDocument();
    expect(screen.getByLabelText('Meeting A')).toBeInTheDocument();
  });

  it('3. Should call setSelectedRooms when checkbox is clicked', () => {
    render(<DesktopSidebar {...defaultProps} />);
    const checkbox = screen.getByRole('checkbox', { name: 'Meeting A' });
    
    fireEvent.click(checkbox);
    expect(mockSetSelectedRooms).toHaveBeenCalled();
  });

  it('4. Should call setSelectedRooms with empty array when Clear All is clicked', () => {
    render(<DesktopSidebar {...defaultProps} />);
    const clearBtn = screen.getByText('Clear All');
    
    fireEvent.click(clearBtn);
    expect(mockSetSelectedRooms).toHaveBeenCalledWith([]);
  });
});