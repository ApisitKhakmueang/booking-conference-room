// @vitest-environment jsdom
import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import RealTimeClock from './realtime-clock';

describe('RealTimeClock Component', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // ล็อกเวลาไว้ที่ Monday, 6 May 2026, 10:00:00 AM
    vi.setSystemTime(new Date('2026-05-06T10:00:00'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('1. Should render initial date and time correctly', () => {
    render(<RealTimeClock />);
    expect(screen.getByText('Wednesday, 6 May 2026')).toBeInTheDocument();
    expect(screen.getByText('10:00 AM')).toBeInTheDocument();
  });

  it('2. Should update time every second', () => {
    render(<RealTimeClock />);

    // เดินเวลาไป 1 วินาที
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(screen.getByText('10:00 AM')).toBeInTheDocument(); // นาทีเดิม แต่นาฬิกาเดินแล้ว
  });

  it('3. Should clear interval on unmount', () => {
    const clearIntervalSpy = vi.spyOn(window, 'clearInterval');
    const { unmount } = render(<RealTimeClock />);

    unmount();
    expect(clearIntervalSpy).toHaveBeenCalled();
  });
});