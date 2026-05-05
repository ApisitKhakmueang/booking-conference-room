// @vitest-environment jsdom
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import UserPagination from './user-pagination';

describe('UserPagination', () => {
  const defaultProps = {
    currentPage: 2,
    setCurrentPage: vi.fn(),
    totalPages: 5,
    totalUsers: 25,
    indexOfFirstItem: 6,
    indexOfLastItem: 10,
  };

  it('1. Should render correct display text', () => {
    render(<UserPagination {...defaultProps} />);
    // คาดหวังว่าจะแสดง "Displaying 6-10 of 25 users"[cite: 11]
    expect(screen.getByText('Displaying 6-10 of 25 users')).toBeInTheDocument();
  });

  it('2. Should call setCurrentPage with next page when Next is clicked', () => {
    render(<UserPagination {...defaultProps} />);
    const nextBtn = screen.getByRole('button', { name: /next/i });
    fireEvent.click(nextBtn);
    expect(defaultProps.setCurrentPage).toHaveBeenCalled();
  });

  it('3. Should call setCurrentPage with previous page when Previous is clicked', () => {
    render(<UserPagination {...defaultProps} />);
    const prevBtn = screen.getByRole('button', { name: /previous/i });
    fireEvent.click(prevBtn);
    expect(defaultProps.setCurrentPage).toHaveBeenCalled();
  });

  it('4. Should disable Previous button on page 1', () => {
    render(<UserPagination {...defaultProps} currentPage={1} />);
    const prevBtn = screen.getByRole('button', { name: /previous/i });
    expect(prevBtn).toBeDisabled();
  });

  it('5. Should disable Next button on last page', () => {
    render(<UserPagination {...defaultProps} currentPage={5} />);
    const nextBtn = screen.getByRole('button', { name: /next/i });
    expect(nextBtn).toBeDisabled();
  });

  it('6. Should call setCurrentPage with specific page number when a page button is clicked', () => {
    render(<UserPagination {...defaultProps} />);
    const page3Btn = screen.getByRole('button', { name: '3' });
    fireEvent.click(page3Btn);
    expect(defaultProps.setCurrentPage).toHaveBeenCalledWith(3);
  });
});