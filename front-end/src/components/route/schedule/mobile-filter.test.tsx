// @vitest-environment jsdom
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import MobileFilter from './mobile-filter';

// Mock DesktopSidebar เพื่อไม่ให้มัน render ของจริง (โฟกัสแค่เปลือก Mobile)
vi.mock('./desktop-sidebar', () => ({
  default: () => <div data-testid="mock-desktop-sidebar" />
}));

describe('MobileFilter', () => {
  const mockSetIsMobileFilterOpen = vi.fn();
  
  const defaultProps = {
    setIsMobileFilterOpen: mockSetIsMobileFilterOpen,
    currentDate: new Date(),
    setCurrentDate: vi.fn(),
    currentMonth: new Date(),
    setCurrentMonth: vi.fn(),
    filteredEvents: [],
    selectedRooms: [],
    setSelectedRooms: vi.fn()
  };

  it('1. Should render DesktopSidebar inside the modal', () => {
    render(<MobileFilter {...defaultProps} />);
    expect(screen.getByTestId('mock-desktop-sidebar')).toBeInTheDocument();
  });

  it('2. Should call setIsMobileFilterOpen(false) when close button (✕) is clicked', () => {
    render(<MobileFilter {...defaultProps} />);
    const closeBtn = screen.getByText('✕');
    fireEvent.click(closeBtn);
    expect(mockSetIsMobileFilterOpen).toHaveBeenCalledWith(false);
  });

  it('3. Should call setIsMobileFilterOpen(false) when "Show Results" button is clicked', () => {
    render(<MobileFilter {...defaultProps} />);
    const showResultsBtn = screen.getByRole('button', { name: 'Show Results' });
    fireEvent.click(showResultsBtn);
    expect(mockSetIsMobileFilterOpen).toHaveBeenCalledWith(false);
  });
});