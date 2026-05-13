// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { EventGroup } from './event-group';
import { BookingEvent } from '@/utils/interface/interface';

vi.mock('./event-card', () => ({
  default: () => <div data-testid="mock-event-card" />
}));

describe('EventGroup', () => {
  const defaultProps = {
    title: 'Upcoming',
    groupEvents: [{ id: '1' }, { id: '2' }] as unknown as BookingEvent[],
    titleColor: 'text-amber-500',
    handleEditClick: vi.fn(),
    setIsAddModalOpen: vi.fn(),
    setCurrentDate: vi.fn(),
    fetchUserBookings: vi.fn()
  };

  it('1. Should return null if groupEvents is empty', () => {
    const { container } = render(<EventGroup {...defaultProps} groupEvents={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('2. Should render title and count correctly', () => {
    render(<EventGroup {...defaultProps} />);
    expect(screen.getByText('Upcoming')).toBeInTheDocument();
    // เช็คตัวเลขแสดงจำนวน event
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('3. Should render correct amount of CardEvents', () => {
    render(<EventGroup {...defaultProps} />);
    const cards = screen.getAllByTestId('mock-event-card');
    expect(cards.length).toBe(2);
  });
});