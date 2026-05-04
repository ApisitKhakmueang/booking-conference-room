// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Label } from './label';
import React from 'react';

describe('Label', () => {
  // ─── Rendering ──────────────────────────────────────────────────────────────

  it('1. Should render a label element', () => {
    render(<Label>Room Name</Label>);
    expect(screen.getByText('Room Name')).toBeInTheDocument();
  });

  it('2. Should render with data-slot="label" attribute', () => {
    const { container } = render(<Label>Label text</Label>);
    expect(container.querySelector('[data-slot="label"]')).toBeInTheDocument();
  });

  // ─── htmlFor association ─────────────────────────────────────────────────────

  it('3. Should forward htmlFor to the label element', () => {
    const { container } = render(<Label htmlFor="input-id">My Label</Label>);
    const label = container.querySelector('label');
    expect(label).toHaveAttribute('for', 'input-id');
  });

  it('4. Should associate label with an input via htmlFor', () => {
    render(
      <>
        <Label htmlFor="room-name">Room Name</Label>
        <input id="room-name" type="text" />
      </>
    );
    // Clicking the label focuses the associated input
    const input = screen.getByRole('textbox');
    const label = screen.getByText('Room Name');
    expect(label).toBeInTheDocument();
    expect(input).toBeInTheDocument();
  });

  // ─── Custom className ────────────────────────────────────────────────────────

  it('5. Should merge custom className', () => {
    const { container } = render(<Label className="text-red-500">Error Label</Label>);
    const label = container.querySelector('label');
    expect(label).toHaveClass('text-red-500');
  });

  // ─── Children ────────────────────────────────────────────────────────────────

  it('6. Should render text children', () => {
    render(<Label>Booking Date</Label>);
    expect(screen.getByText('Booking Date')).toBeInTheDocument();
  });

  it('7. Should render JSX children (e.g. required asterisk)', () => {
    render(
      <Label>
        Room <span aria-hidden="true">*</span>
      </Label>
    );
    expect(screen.getByText('Room')).toBeInTheDocument();
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  // ─── Pass-through attributes ─────────────────────────────────────────────────

  it('8. Should forward id attribute to the label', () => {
    const { container } = render(<Label id="label-1">Name</Label>);
    expect(container.querySelector('#label-1')).toBeInTheDocument();
  });
});
