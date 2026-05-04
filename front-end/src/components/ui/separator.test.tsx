// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Separator } from './separator';
import React from 'react';

describe('Separator', () => {
  // ─── Rendering ──────────────────────────────────────────────────────────────

  it('1. Should render with data-slot="separator" attribute', () => {
    const { container } = render(<Separator />);
    expect(container.querySelector('[data-slot="separator"]')).toBeInTheDocument();
  });

  // ─── Orientation ─────────────────────────────────────────────────────────────

  it('2. Should be horizontal by default', () => {
    const { container } = render(<Separator />);
    // Radix Separator sets data-orientation
    const separator = container.querySelector('[data-slot="separator"]');
    expect(separator).toHaveAttribute('data-orientation', 'horizontal');
  });

  it('3. Should render as vertical when orientation="vertical"', () => {
    const { container } = render(<Separator orientation="vertical" />);
    const separator = container.querySelector('[data-slot="separator"]');
    expect(separator).toHaveAttribute('data-orientation', 'vertical');
  });

  // ─── Decorative ───────────────────────────────────────────────────────────────

  it('4. Should be decorative by default (does not have separator role)', () => {
    render(<Separator />);
    // ใช้ queryByRole เพื่อหาว่า "ไม่มี" separator role อยู่ในหน้าจอ
    const separator = screen.queryByRole('separator');
    expect(separator).not.toBeInTheDocument();
  });

  it('5. Should have role="separator" when decorative=false', () => {
    render(<Separator decorative={false} />);
    expect(screen.getByRole('separator')).toBeInTheDocument();
  });

  // ─── Custom className ────────────────────────────────────────────────────────

  it('6. Should merge custom className', () => {
    const { container } = render(<Separator className="my-separator" />);
    expect(container.querySelector('.my-separator')).toBeInTheDocument();
  });

  // ─── Pass-through attributes ─────────────────────────────────────────────────

  it('7. Should forward id attribute', () => {
    const { container } = render(<Separator id="sep-1" />);
    expect(container.querySelector('#sep-1')).toBeInTheDocument();
  });
});
