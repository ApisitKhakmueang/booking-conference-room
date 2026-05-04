// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { Checkbox } from './checkbox';
import React from 'react';

describe('Checkbox', () => {
  // ─── Rendering ──────────────────────────────────────────────────────────────

  it('1. Should render a checkbox element', () => {
    render(<Checkbox aria-label="Accept terms" />);
    expect(screen.getByRole('checkbox', { name: /accept terms/i })).toBeInTheDocument();
  });

  it('2. Should render with data-slot="checkbox" attribute', () => {
    const { container } = render(<Checkbox />);
    expect(container.querySelector('[data-slot="checkbox"]')).toBeInTheDocument();
  });

  // ─── Checked / Unchecked ─────────────────────────────────────────────────────

  it('3. Should be unchecked by default', () => {
    render(<Checkbox aria-label="option" />);
    expect(screen.getByRole('checkbox')).not.toBeChecked();
  });

  it('4. Should be checked when defaultChecked is true', () => {
    render(<Checkbox aria-label="option" defaultChecked />);
    expect(screen.getByRole('checkbox')).toBeChecked();
  });

  it('5. Should toggle checked state on click', async () => {
    render(<Checkbox aria-label="option" />);
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).not.toBeChecked();
    await userEvent.click(checkbox);
    expect(checkbox).toBeChecked();
    await userEvent.click(checkbox);
    expect(checkbox).not.toBeChecked();
  });

  // ─── onCheckedChange callback ────────────────────────────────────────────────

  it('6. Should call onCheckedChange when toggled', async () => {
    const handleChange = vi.fn();
    render(<Checkbox aria-label="option" onCheckedChange={handleChange} />);
    await userEvent.click(screen.getByRole('checkbox'));
    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(handleChange).toHaveBeenCalledWith(true);
  });

  it('7. Should call onCheckedChange with false when unchecking', async () => {
    const handleChange = vi.fn();
    render(<Checkbox aria-label="option" defaultChecked onCheckedChange={handleChange} />);
    await userEvent.click(screen.getByRole('checkbox'));
    expect(handleChange).toHaveBeenCalledWith(false);
  });

  // ─── Disabled State ──────────────────────────────────────────────────────────

  it('8. Should be disabled when disabled prop is provided', () => {
    render(<Checkbox aria-label="option" disabled />);
    expect(screen.getByRole('checkbox')).toBeDisabled();
  });

  it('9. Should NOT call onCheckedChange when disabled', async () => {
    const handleChange = vi.fn();
    render(<Checkbox aria-label="option" disabled onCheckedChange={handleChange} />);
    await userEvent.click(screen.getByRole('checkbox'));
    expect(handleChange).not.toHaveBeenCalled();
  });

  // ─── aria-invalid ────────────────────────────────────────────────────────────

  it('10. Should have aria-invalid when passed', () => {
    render(<Checkbox aria-label="option" aria-invalid="true" />);
    expect(screen.getByRole('checkbox')).toHaveAttribute('aria-invalid', 'true');
  });

  // ─── Custom className ────────────────────────────────────────────────────────

  it('11. Should merge custom className', () => {
    const { container } = render(<Checkbox className="custom-checkbox" />);
    expect(container.querySelector('.custom-checkbox')).toBeInTheDocument();
  });

  // ─── Controlled value ────────────────────────────────────────────────────────

  it('12. Should be checked when controlled checked=true', () => {
    render(
      <Checkbox aria-label="option" checked={true} onCheckedChange={() => {}} />
    );
    expect(screen.getByRole('checkbox')).toBeChecked();
  });

  it('13. Should be unchecked when controlled checked=false', () => {
    render(
      <Checkbox aria-label="option" checked={false} onCheckedChange={() => {}} />
    );
    expect(screen.getByRole('checkbox')).not.toBeChecked();
  });
});
