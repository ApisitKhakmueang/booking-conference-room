// @vitest-environment jsdom
import { render, screen, fireEvent, createEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import LateArrivalPolicy from './late-arrival-policy';

describe('LateArrivalPolicy Component', () => {
  const mockConfig = { noShowThresholdMins: 15 } as any;
  const mockSetConfig = vi.fn();

  it('1. Should block specific keys (e, -, .)', () => {
    render(<LateArrivalPolicy config={mockConfig} setConfig={mockSetConfig} isOpenEdit={true} />);
    const input = screen.getByDisplayValue('15');
    
    // 🌟 2. แก้ไขวิธีการจำลอง Event
    const keyDownEvent = createEvent.keyDown(input, { key: 'e' });
    keyDownEvent.preventDefault = vi.fn(); // แปะ Mock ให้มันตรงๆ
    
    fireEvent(input, keyDownEvent); // ยิง Event ที่เราปรับแต่งแล้วเข้าไป
    
    expect(keyDownEvent.preventDefault).toHaveBeenCalled();
  });

  it('2. Should cap value to 15 if input is > 15', () => {
    render(<LateArrivalPolicy config={mockConfig} setConfig={mockSetConfig} isOpenEdit={true} />);
    const input = screen.getByDisplayValue('15');
    
    fireEvent.change(input, { target: { value: '20' } });
    expect(mockSetConfig).toHaveBeenCalledWith({ ...mockConfig, noShowThresholdMins: 15 });
  });

  it('3. Should set value to 0 if input is < 0', () => {
    render(<LateArrivalPolicy config={mockConfig} setConfig={mockSetConfig} isOpenEdit={true} />);
    const input = screen.getByDisplayValue('15');
    
    fireEvent.change(input, { target: { value: '-5' } });
    expect(mockSetConfig).toHaveBeenCalledWith({ ...mockConfig, noShowThresholdMins: 0 });
  });

  it('4. Should set empty string if input is cleared (NaN)', () => {
    render(<LateArrivalPolicy config={mockConfig} setConfig={mockSetConfig} isOpenEdit={true} />);
    const input = screen.getByDisplayValue('15');
    
    fireEvent.change(input, { target: { value: '' } });
    expect(mockSetConfig).toHaveBeenCalledWith({ ...mockConfig, noShowThresholdMins: '' });
  });
});