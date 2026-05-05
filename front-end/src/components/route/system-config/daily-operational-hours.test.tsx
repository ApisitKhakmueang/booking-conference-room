// @vitest-environment jsdom
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import DailyOperationalHours from './daily-operational-hours';

describe('DailyOperationalHours Component', () => {
  const mockConfig = { startTime: '08:00', endTime: '20:00' } as any;
  const mockSetConfig = vi.fn();

  it('1. Should render correctly and display initial times', () => {
    render(<DailyOperationalHours config={mockConfig} setConfig={mockSetConfig} isOpenEdit={false} />);
    expect(screen.getByText('Daily Operational Hours')).toBeInTheDocument();
    expect(screen.getByDisplayValue('08:00')).toBeInTheDocument();
    expect(screen.getByDisplayValue('20:00')).toBeInTheDocument();
  });

  it('2. Inputs should be disabled when isOpenEdit is false', () => {
    render(<DailyOperationalHours config={mockConfig} setConfig={mockSetConfig} isOpenEdit={false} />);
    const timeInputs = screen.getAllByDisplayValue(/08:00|20:00/);
    expect(timeInputs[0]).toBeDisabled();
    expect(timeInputs[1]).toBeDisabled();
  });

  it('3. Should call setConfig when startTime is changed', () => {
    render(<DailyOperationalHours config={mockConfig} setConfig={mockSetConfig} isOpenEdit={true} />);
    const startTimeInput = screen.getByDisplayValue('08:00');
    fireEvent.change(startTimeInput, { target: { value: '09:00' } });
    expect(mockSetConfig).toHaveBeenCalledWith({ ...mockConfig, startTime: '09:00' });
  });

  it('4. Should call setConfig when endTime is changed', () => {
    render(<DailyOperationalHours config={mockConfig} setConfig={mockSetConfig} isOpenEdit={true} />);
    const endTimeInput = screen.getByDisplayValue('20:00');
    fireEvent.change(endTimeInput, { target: { value: '21:00' } });
    expect(mockSetConfig).toHaveBeenCalledWith({ ...mockConfig, endTime: '21:00' });
  });
});