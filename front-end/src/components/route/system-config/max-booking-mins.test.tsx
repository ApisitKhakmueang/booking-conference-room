// @vitest-environment jsdom
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import MaxBookingMins from './max-booking-mins';
import React from 'react';

describe('MaxBookingMins Component', () => {
  const mockSetConfig = vi.fn();

  // 🌟 เพิ่ม beforeEach เพื่อล้างความจำของ mockSetConfig ก่อนรันแต่ละเทส
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('1. Should cap max value to 5 during onChange', () => {
    render(<MaxBookingMins config={{ maxBookingMins: 2 } as any} setConfig={mockSetConfig} isOpenEdit={true} />);
    const input = screen.getByRole('spinbutton');
    
    fireEvent.change(input, { target: { value: '6' } });
    expect(mockSetConfig).toHaveBeenCalledWith(expect.objectContaining({ maxBookingMins: 5 }));
  });

  it('2. Should force value to 1 and round to nearest 0.5 on blur', () => {
    // 🌟 กรณีที่ 1: จำลองว่า State ปัจจุบันคือ 0.5 (ค่าน้อยกว่า 1)
    const { unmount } = render(<MaxBookingMins config={{ maxBookingMins: 0.5 } as any} setConfig={mockSetConfig} isOpenEdit={true} />);
    const input1 = screen.getByRole('spinbutton');
    
    // สั่ง blur ทันที (ไม่ต้องส่ง target value เพราะมันจะอ่านจาก config)
    fireEvent.blur(input1);
    expect(mockSetConfig).toHaveBeenCalledWith(expect.objectContaining({ maxBookingMins: 1 }));
    
    // Unmount เพื่อล้างหน้าจอก่อนเทสเคสถัดไป
    unmount();

    // 🌟 กรณีที่ 2: จำลองว่า State ปัจจุบันคือ 2.2 (เพื่อเทสการปัดเศษ)
    render(<MaxBookingMins config={{ maxBookingMins: 2.2 } as any} setConfig={mockSetConfig} isOpenEdit={true} />);
    const input2 = screen.getByRole('spinbutton');
    
    fireEvent.blur(input2);
    expect(mockSetConfig).toHaveBeenCalledWith(expect.objectContaining({ maxBookingMins: 2 }));
  });

  it('3. Slider should update config', () => {
    render(<MaxBookingMins config={{ maxBookingMins: 2 } as any} setConfig={mockSetConfig} isOpenEdit={true} />);
    const slider = screen.getByRole('slider');
    
    fireEvent.change(slider, { target: { value: '4' } });
    expect(mockSetConfig).toHaveBeenCalledWith(expect.objectContaining({ maxBookingMins: 4 }));
  });
});