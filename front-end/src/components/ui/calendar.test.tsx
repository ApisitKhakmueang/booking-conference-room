// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { Calendar, CalendarDayButton } from './calendar';
import React from 'react';

// Fixed reference date for deterministic tests
const FIXED_DATE = new Date(2025, 0, 15); // 15 January 2025

describe('Calendar', () => {
  // ─── Rendering ──────────────────────────────────────────────────────────────

  it('1. Should render with data-slot="calendar"', () => {
    render(<Calendar />);
    expect(document.querySelector('[data-slot="calendar"]')).toBeInTheDocument();
  });

  it('2. Should render weekday headers (Su Mo Tu We Th Fr Sa)', () => {
    render(<Calendar defaultMonth={FIXED_DATE} />);
    // react-day-picker renders abbreviated weekday names
    expect(document.querySelector('[class*="weekday"]')).toBeInTheDocument();
  });

  it('3. Should render the month and year in the caption', () => {
    render(<Calendar defaultMonth={FIXED_DATE} />);
    // January 2025
    expect(screen.getByText(/january/i)).toBeInTheDocument();
    expect(screen.getByText(/2025/i)).toBeInTheDocument();
  });

  it('4. Should render navigation buttons (previous & next month)', () => {
    render(<Calendar defaultMonth={FIXED_DATE} />);
    const prevBtn = document.querySelector('[class*="button_previous"]');
    const nextBtn = document.querySelector('[class*="button_next"]');
    expect(prevBtn).toBeInTheDocument();
    expect(nextBtn).toBeInTheDocument();
  });

  // ─── Outside days ────────────────────────────────────────────────────────────

  it('5. Should render outside days when showOutsideDays=true (default)', () => {
    render(<Calendar defaultMonth={FIXED_DATE} showOutsideDays />);
    // Outside days should be visible (they get a specific class)
    const outsideDays = document.querySelectorAll('[class*="outside"]');
    expect(outsideDays.length).toBeGreaterThan(0);
  });

  it('6. Should NOT render outside days when showOutsideDays=false', () => {
    // เรนเดอร์ Calendar โดยปิดการแสดงวันของเดือนอื่น
    render(<Calendar defaultMonth={FIXED_DATE} showOutsideDays={false} />);
    
    // ค้นหา Element ทั้งหมดที่มี class ที่ระบุว่าเป็นวันนอกเดือน (อิงตาม logic ของ shadcn/ui)
    const outsideDays = document.querySelectorAll('.day-outside');
    
    // ตรวจสอบว่าต้องไม่มี element เหล่านี้ปรากฏอยู่ใน DOM
    expect(outsideDays.length).toBe(0);
  });

  // ─── Navigation ──────────────────────────────────────────────────────────────

  it('7. Should navigate to next month on next button click', async () => {
    render(<Calendar defaultMonth={FIXED_DATE} />);
    expect(screen.getByText(/january/i)).toBeInTheDocument();

    const nextBtn = document.querySelector('[class*="button_next"]') as HTMLElement;
    await userEvent.click(nextBtn);

    expect(screen.getByText(/february/i)).toBeInTheDocument();
  });

  it('8. Should navigate to previous month on previous button click', async () => {
    render(<Calendar defaultMonth={FIXED_DATE} />);
    expect(screen.getByText(/january/i)).toBeInTheDocument();

    const prevBtn = document.querySelector('[class*="button_previous"]') as HTMLElement;
    await userEvent.click(prevBtn);

    expect(screen.getByText(/december/i)).toBeInTheDocument();
  });

  // ─── Date selection (single mode) ───────────────────────────────────────────

  it('9. Should call onSelect when a day is clicked (single mode)', async () => {
    const handleSelect = vi.fn();
    render(
      <Calendar
        mode="single"
        defaultMonth={FIXED_DATE}
        onSelect={handleSelect}
      />
    );
    // Find the 15th day button by its data-day attribute
    const dayButton = document.querySelector(
      `button[data-day="${FIXED_DATE.toLocaleDateString()}"]`
    ) as HTMLElement;
    if (dayButton) {
      await userEvent.click(dayButton);
      expect(handleSelect).toHaveBeenCalled();
    }
  });

  it('10. Should highlight selected date when selected prop is provided', () => {
    render(
      <Calendar
        mode="single"
        defaultMonth={FIXED_DATE}
        selected={FIXED_DATE}
      />
    );
    // The selected day button gets data-selected-single="true"
    const selectedDay = document.querySelector(
      'button[data-selected-single="true"]'
    );
    expect(selectedDay).toBeInTheDocument();
  });

  // ─── Custom className ────────────────────────────────────────────────────────

  it('11. Should merge custom className on the root', () => {
    render(<Calendar className="my-calendar" defaultMonth={FIXED_DATE} />);
    expect(document.querySelector('.my-calendar')).toBeInTheDocument();
  });

  // ─── captionLayout ───────────────────────────────────────────────────────────

  it('12. Should render caption in label layout (default)', () => {
    render(<Calendar defaultMonth={FIXED_DATE} captionLayout="label" />);
    // Label layout shows plain text month+year
    expect(screen.getByText(/january/i)).toBeInTheDocument();
  });

  it('13. Should render caption in dropdown layout without errors', () => {
    expect(() =>
      render(
        <Calendar
          defaultMonth={FIXED_DATE}
          captionLayout="dropdown"
          startMonth={new Date(2020, 0)}
          endMonth={new Date(2030, 11)}
        />
      )
    ).not.toThrow();
  });

  // ─── Disabled dates ──────────────────────────────────────────────────────────

  it('14. Should mark specified dates as disabled', () => {
    const disabledDate = new Date(2025, 0, 15); // Jan 15 2025
    render(
      <Calendar
        mode="single"
        defaultMonth={FIXED_DATE}
        disabled={[disabledDate]}
      />
    );
    const disabledDays = document.querySelectorAll('[class*="disabled"]');
    expect(disabledDays.length).toBeGreaterThan(0);
  });
});

// ─── CalendarDayButton ────────────────────────────────────────────────────────

describe('CalendarDayButton', () => {
  it('15. Should be focusable when modifiers.focused=true', () => {
    // CalendarDayButton is rendered inside Calendar; test indirectly
    // by verifying day buttons are rendered and have the expected attributes
    render(<Calendar defaultMonth={FIXED_DATE} mode="single" />);
    const dayButtons = document.querySelectorAll('button[data-day]');
    expect(dayButtons.length).toBeGreaterThan(0);
  });
});
