// @vitest-environment jsdom
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Room from './room';
import { useRoomData } from '@/hooks/data/useRoomData';
import { useRouter } from 'next/navigation';

// Mock Dependencies
vi.mock('next/navigation', () => ({ useRouter: vi.fn() }));
vi.mock('@/hooks/data/useBookingStatusWS', () => ({
  default: () => ({ bookings: [], isLoadingBooking: false })
}));
vi.mock('@/hooks/data/useRoomData', () => ({ useRoomData: vi.fn() }));

// Mock Child Components
vi.mock('./room-grid', () => ({
  default: () => <div data-testid="grid-view" />,
  RoomGridSkeleton: () => <div data-testid="grid-skeleton" />
}));
vi.mock('./room-timeline', () => ({
  default: () => <div data-testid="timeline-view" />
}));

describe('Room Main Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as any).mockReturnValue({ push: vi.fn() });
  });

  it('1. Should show skeleton if rooms are not loaded yet', () => {
    (useRoomData as any).mockReturnValue({ room: null }); // ยังไม่มีข้อมูล
    
    render(<Room />);
    // ต้องแสดง Skeleton แทน Grid[cite: 21]
    expect(screen.getByTestId('grid-skeleton')).toBeInTheDocument();
  });

  it('2. Should render Grid view by default when data is loaded', () => {
    (useRoomData as any).mockReturnValue({ room: [{ id: '1', name: 'Room 1' }] });
    
    render(<Room />);
    // ต้องแสดง Grid[cite: 21]
    expect(screen.getByTestId('grid-view')).toBeInTheDocument();
  });

  it('3. Should toggle to Timeline view when button is clicked', () => {
    (useRoomData as any).mockReturnValue({ room: [{ id: '1', name: 'Room 1' }] });
    
    render(<Room />);
    
    // กดปุ่มที่มีข้อความว่า Timeline View[cite: 21]
    const toggleBtn = screen.getByRole('button', { name: /Timeline View/i });
    fireEvent.click(toggleBtn);
    
    // สลับหน้าจอเป็น Timeline[cite: 21]
    expect(screen.getByTestId('timeline-view')).toBeInTheDocument();
    // ปุ่มต้องเปลี่ยนข้อความเป็น Grid View เพื่อให้กดกลับได้[cite: 21]
    expect(screen.getByRole('button', { name: /Grid View/i })).toBeInTheDocument();
  });
});