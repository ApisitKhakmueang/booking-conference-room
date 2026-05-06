// @vitest-environment jsdom
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import HistoryPagination from './history-pagination';

describe('HistoryPagination Component', () => {
  const mockSetCurrentPage = vi.fn();
  const defaultProps = {
    currentPage: 2,
    setCurrentPage: mockSetCurrentPage,
    totalPages: 3,
    totalItems: 10,
    indexOfFirstItem: 4,
    indexOfLastItem: 8
  };

  it('1. Should display correct item range', () => {
    render(<HistoryPagination {...defaultProps} />);
    // ตรวจสอบข้อความแสดงผล (Displaying 5-8 of 10 users)[cite: 14]
    expect(screen.getByText('Displaying 5-8 of 10 users')).toBeInTheDocument();
  });

  it('2. Should disable Previous button on first page', () => {
    render(<HistoryPagination {...defaultProps} currentPage={1} />);
    const prevBtn = screen.getByRole('button', { name: /Previous/i });
    expect(prevBtn).toBeDisabled(); // หน้า 1 ต้องกดถอยหลังไม่ได้[cite: 14]
  });

  it('3. Should disable Next button on last page', () => {
    render(<HistoryPagination {...defaultProps} currentPage={3} />);
    const nextBtn = screen.getByRole('button', { name: /Next/i });
    expect(nextBtn).toBeDisabled(); // หน้า 3 (หน้าสุดท้าย) ต้องกดไปต่อไม่ได้[cite: 14]
  });

  it('4. Should call setCurrentPage with specific page number when page button clicked', () => {
    render(<HistoryPagination {...defaultProps} />);
    
    // กดปุ่มหมายเลข 3
    const page3Btn = screen.getByRole('button', { name: '3' });
    fireEvent.click(page3Btn);
    
    expect(mockSetCurrentPage).toHaveBeenCalledWith(3);
  });
});