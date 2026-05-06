// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import HistoryTableContainer from './history-table-container';
import { usePaginatedUserBookings } from '@/hooks/data/usePaginatedUserBookings';

// Mock Hook
vi.mock('@/hooks/data/usePaginatedUserBookings', () => ({
  usePaginatedUserBookings: vi.fn(),
}));

describe('HistoryTableContainer', () => {
  const mockUserID = 'user-123';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('1. Should show Skeletons when isLoadingBookings is true', () => {
    (usePaginatedUserBookings as any).mockReturnValue({
      bookingsData: null,
      isLoadingBookings: true,
    });

    const { container } = render(<HistoryTableContainer userID={mockUserID} />);
    // ตรวจสอบว่ามีการแสดง Skeleton[cite: 15]
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('2. Should show "No bookings found" when data is empty', () => {
    (usePaginatedUserBookings as any).mockReturnValue({
      bookingsData: { data: [], meta: { totalItems: 0 } },
      isLoadingBookings: false,
    });

    render(<HistoryTableContainer userID={mockUserID} />);
    // ตรวจสอบหน้าว่าง[cite: 15]
    expect(screen.getByText(/No bookings found for this period/i)).toBeInTheDocument();
  });

  it('3. Should render HistoryCard components when data exists', () => {
    const mockBookings = [
      { id: '1', startTime: '2026-05-06T10:00:00Z', endTime: '2026-05-06T11:00:00Z', status: 'confirm' }
    ];

    (usePaginatedUserBookings as any).mockReturnValue({
      bookingsData: { data: mockBookings, meta: { totalPages: 1, totalItems: 1 } },
      isLoadingBookings: false,
    });

    render(<HistoryTableContainer userID={mockUserID} />);
    // ต้องแสดงคำว่า CONFIRMED จากข้อมูลที่จำลองไว้[cite: 12, 15]
    expect(screen.getByText('CONFIRMED')).toBeInTheDocument();
  });
});