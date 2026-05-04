// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { Input } from './input';
import React from 'react';

describe('Input', () => {
  // ─── Rendering ──────────────────────────────────────────────────────────────

  it('1. Should render an input element', () => {
    render(<Input />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('2. Should render with data-slot="input" attribute', () => {
    const { container } = render(<Input />);
    expect(container.querySelector('[data-slot="input"]')).toBeInTheDocument();
  });

  // ─── Type ────────────────────────────────────────────────────────────────────

  it('3. Should render as type="text" by default (no type prop)', () => {
    render(<Input />);
    // input without type defaults to text in HTML
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('4. Should render as type="email"', () => {
    const { container } = render(<Input type="email" />);
    expect(container.querySelector('input[type="email"]')).toBeInTheDocument();
  });

  it('5. Should render as type="password"', () => {
    const { container } = render(<Input type="password" />);
    expect(container.querySelector('input[type="password"]')).toBeInTheDocument();
  });

  it('6. Should render as type="number"', () => {
    render(<Input type="number" aria-label="amount" />);
    expect(screen.getByRole('spinbutton', { name: /amount/i })).toBeInTheDocument();
  });

  // ─── Placeholder ──────────────────────────────────────────────────────────────

  it('7. Should display placeholder text', () => {
    render(<Input placeholder="Enter your name" />);
    expect(screen.getByPlaceholderText('Enter your name')).toBeInTheDocument();
  });

  // ─── Disabled State ──────────────────────────────────────────────────────────

  it('8. Should be disabled when disabled prop is true', () => {
    render(<Input disabled />);
    expect(screen.getByRole('textbox')).toBeDisabled();
  });

  it('9. Should NOT be disabled by default', () => {
    render(<Input />);
    expect(screen.getByRole('textbox')).not.toBeDisabled();
  });

  // ─── aria-invalid ────────────────────────────────────────────────────────────

  it('10. Should have aria-invalid when aria-invalid="true" is passed', () => {
    render(<Input aria-invalid="true" />);
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
  });

  // ─── Custom className ────────────────────────────────────────────────────────

  it('11. Should merge custom className with base classes', () => {
    render(<Input className="extra-class" />);
    expect(screen.getByRole('textbox')).toHaveClass('extra-class');
  });

  // ─── User interaction ────────────────────────────────────────────────────────

  it('12. Should accept typed text', async () => {
    render(<Input />);
    const input = screen.getByRole('textbox');
    await userEvent.type(input, 'Hello');
    expect(input).toHaveValue('Hello');
  });

  it('13. Should call onChange handler when value changes', async () => {
    const handleChange = vi.fn();
    render(<Input onChange={handleChange} />);
    await userEvent.type(screen.getByRole('textbox'), 'a');
    expect(handleChange).toHaveBeenCalled();
  });

  it('14. Should NOT allow typing when disabled', async () => {
    render(<Input disabled value="fixed" readOnly />);
    const input = screen.getByRole('textbox');
    await userEvent.type(input, 'extra');
    expect(input).toHaveValue('fixed');
  });

  // ─── Pass-through attributes ─────────────────────────────────────────────────

  it('15. Should forward id and name attributes', () => {
    render(<Input id="email-field" name="email" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('id', 'email-field');
    expect(input).toHaveAttribute('name', 'email');
  });

  it('16. Should forward aria-label attribute', () => {
    render(<Input aria-label="Search rooms" />);
    expect(screen.getByRole('textbox', { name: /search rooms/i })).toBeInTheDocument();
  });
});
