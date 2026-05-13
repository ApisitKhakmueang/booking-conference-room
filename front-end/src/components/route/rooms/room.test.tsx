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
    // 🌟 ใช้ vi.mocked แทน
    vi.mocked(useRouter).mockReturnValue({ push: vi.fn() } as unknown as ReturnType<typeof useRouter>);
  });

  it('1. Should show skeleton if rooms are not loaded yet', () => {
    // 🌟 ใช้ vi.mocked
    vi.mocked(useRoomData).mockReturnValue({ room: null } as unknown as ReturnType<typeof useRoomData>); 
    
    render(<Room />);
    expect(screen.getByTestId('grid-skeleton')).toBeInTheDocument();
  });

  it('2. Should render Grid view by default when data is loaded', () => {
    // 🌟 ใช้ vi.mocked
    vi.mocked(useRoomData).mockReturnValue({ room: [{ id: '1', name: 'Room 1' }] } as unknown as ReturnType<typeof useRoomData>);
    
    render(<Room />);
    expect(screen.getByTestId('grid-view')).toBeInTheDocument();
  });

  it('3. Should toggle to Timeline view when button is clicked', () => {
    // 🌟 ใช้ vi.mocked
    vi.mocked(useRoomData).mockReturnValue({ room: [{ id: '1', name: 'Room 1' }] } as unknown as ReturnType<typeof useRoomData>);
    
    render(<Room />);
    
    const toggleBtn = screen.getByRole('button', { name: /Timeline View/i });
    fireEvent.click(toggleBtn);
    
    expect(screen.getByTestId('timeline-view')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Grid View/i })).toBeInTheDocument();
  });
});