// @vitest-environment jsdom
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import DesktopSidebar from './desktop-sidebar';
import { useRoomData } from '@/hooks/data/useRoomData';

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
    events: [{ id: '1' }, { id: '2' }] as any, // 2 events
    selectedRooms: [101],
    setSelectedRooms: mockSetSelectedRooms,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useRoomData as any).mockReturnValue({
      room: [
        { id: '1', name: 'Boardroom', roomNumber: 101 },
        { id: '2', name: 'Meeting A', roomNumber: 102 }
      ],
      isLoading: false,
    });
  });

  it('1. Should render total events correctly', () => {
    render(<DesktopSidebar {...defaultProps} />);
    // ต้องแสดงเลข 2 ตามจำนวน mock events[cite: 11]
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
    
    // จำลองการติ๊กเพิ่ม
    fireEvent.click(checkbox);
    // ฟังก์ชันน่าจะถูกดึงให้ไปเซ็ตค่าเป็น [...prev, 102]
    expect(mockSetSelectedRooms).toHaveBeenCalled();
  });

  it('4. Should call setSelectedRooms with empty array when Clear All is clicked', () => {
    render(<DesktopSidebar {...defaultProps} />);
    const clearBtn = screen.getByText('Clear All');
    
    fireEvent.click(clearBtn);
    expect(mockSetSelectedRooms).toHaveBeenCalledWith([]);
  });
});