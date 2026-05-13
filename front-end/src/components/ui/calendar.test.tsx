// @vitest-environment jsdom
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import { Calendar } from './calendar';
import React, { useState } from 'react';

// 🌟 สร้าง Wrapper Component เพื่อเทส State การเลือกวันที่
function CalendarSingleWrapper() {
  const [date, setDate] = useState<Date | undefined>(new Date(2026, 4, 15)); // Set default date for stable testing
  return (
    <Calendar
      mode="single"
      selected={date}
      onSelect={setDate}
      defaultMonth={new Date(2026, 4)} // May 2026
    />
  );
}

function CalendarRangeWrapper() {
  // 🌟 แก้ไข Type โดยบอกว่า "from ต้องมีเสมอ (แต่เป็น undefined ได้)" 
  const [range, setRange] = useState<{ from: Date | undefined; to?: Date } | undefined>({
    from: new Date(2026, 4, 10),
    to: new Date(2026, 4, 15),
  });
  
  return (
    <Calendar
      mode="range"
      selected={range}
      onSelect={setRange} // 👈 คราวนี้ไม่ต้องมี as any แล้ว โค้ดจะหากันเจอเป๊ะๆ
      defaultMonth={new Date(2026, 4)}
    />
  );
}

describe('Calendar Component', () => {
  // ─── 1. Basic Rendering ──────────────────────────────────────────────────

  it('1. Should render the calendar root with data-slot', () => {
    const { container } = render(<Calendar />);
    const root = container.querySelector('[data-slot="calendar"]');
    expect(root).toBeInTheDocument();
  });

  it('2. Should render navigation buttons (Custom Chevrons)', () => {
    render(<Calendar />);
    const prevButton = screen.getByRole('button', { name: /previous month/i });
    const nextButton = screen.getByRole('button', { name: /next month/i });
    
    expect(prevButton).toBeInTheDocument();
    expect(nextButton).toBeInTheDocument();
  });

  // ─── 2. Props & Configurations ──────────────────────────────────────────

  it('3. Should show outside days by default', () => {
    // เดือนพฤษภาคม 2026 เริ่มต้นวันศุกร์ (วันที่ 1)
    // ดังนั้นจะมีวันของเดือนเมษายนโผล่มาในช่วงต้นสัปดาห์
    render(<Calendar defaultMonth={new Date(2026, 4)} />);
    
    // ตรวจสอบว่ามีวันที่ถูกกำหนดคลาส text-gray-300 ซึ่งเป็นคลาสของ outside days
    const days = screen.getAllByRole('gridcell');
    const outsideDay = days.find(day => day.className.includes('text-gray-300'));
    expect(outsideDay).toBeDefined();
  });

  it('4. Should hide outside days when showOutsideDays={false}', () => {
    render(<Calendar defaultMonth={new Date(2026, 4)} showOutsideDays={false} />);
    
    // ถ้าตั้ง false วันของเดือนอื่นจะไม่ถูกเรนเดอร์เนื้อหา (invisible)
    const days = screen.getAllByRole('gridcell');
    const hiddenDay = days.find(day => day.className.includes('invisible'));
    expect(hiddenDay).toBeDefined();
  });

  // ─── 3. CalendarDayButton Custom Logic ─────────────────────────────────

  it('5. Should apply data-selected-single when selecting a single date', async () => {
    render(<CalendarSingleWrapper />);
    
    // 🌟 แก้ไข: หาปุ่มจากข้อความบนปุ่มโดยตรงแทนการใช้ Role Name ที่ยาว
    const day15 = screen.getByText('15', { selector: 'button' });
    
    expect(day15).toHaveAttribute('data-selected-single', 'true');
    expect(day15).not.toHaveAttribute('data-range-start', 'true');
  });

  it('6. Should update selected date when clicking a new day', async () => {
    render(<CalendarSingleWrapper />);
    
    const day20 = screen.getByText('20', { selector: 'button' });
    await userEvent.click(day20);
    
    // 🌟 แก้ไข: ใช้ waitFor และ Query หาปุ่มอีกครั้งหลังจากการคลิก (ป้องกัน Stale Element)
    await waitFor(() => {
      const updatedDay20 = screen.getByText('20', { selector: 'button' });
      expect(updatedDay20).toHaveAttribute('data-selected-single', 'true');
    });
  });

  // ─── 4. Range Selection Attributes ─────────────────────────────────────

  it('7. Should apply range attributes correctly in range mode', () => {
    render(<CalendarRangeWrapper />);
    
    // 🌟 แก้ไข: อัปเดต Selector ทั้งหมดให้เหมือนกันเพื่อความเสถียร
    const day10 = screen.getByText('10', { selector: 'button' });
    expect(day10).toHaveAttribute('data-range-start', 'true');
    expect(day10).not.toHaveAttribute('data-selected-single', 'true'); 
    
    const day12 = screen.getByText('12', { selector: 'button' });
    expect(day12).toHaveAttribute('data-range-middle', 'true');
    
    const day15 = screen.getByText('15', { selector: 'button' });
    expect(day15).toHaveAttribute('data-range-end', 'true');
  });

  // ─── 5. Data Attributes ────────────────────────────────────────────────

  it('8. Should inject formatted date into data-day attribute', () => {
    // 🌟 เพิ่ม mode="single" เพื่อให้เรนเดอร์ในโหมดที่คลิกได้ (วาด Button)
    render(<Calendar mode="single" defaultMonth={new Date(2026, 4)} />);
    
    // ทีนี้จะหาปุ่มเจอแน่นอน เพราะ Component CalendarDayButton ถูกเรียกใช้แล้ว
    const day15 = screen.getByText('15', { selector: 'button' });
    expect(day15).toHaveAttribute('data-day');
    expect(day15.getAttribute('data-day')).not.toBeNull();
  });
});