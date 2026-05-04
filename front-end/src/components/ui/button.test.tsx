// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { Button } from './button';
import React from 'react';

describe('Button', () => {
  // ─── Rendering ──────────────────────────────────────────────────────────────
  afterEach(() => {
    cleanup();
  });

  // 🌟 ฟังก์ชันช่วยตั้งค่า User Event ให้สมจริง
  function setup(jsx: React.ReactElement) {
    return {
      user: userEvent.setup(),
      ...render(jsx),
    }
  }

  it('1. Should render button with children text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  it('2. Should render with data-slot="button" attribute', () => {
    render(<Button>Save</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('data-slot', 'button');
  });

  // ─── Variants ────────────────────────────────────────────────────────────────

  it('3. Should apply data-variant attribute for "primary" variant', () => {
    render(<Button variant="primary">Primary</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('data-variant', 'primary');
  });

  it('4. Should apply data-variant attribute for "destructive" variant', () => {
    render(<Button variant="destructive">Delete</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('data-variant', 'destructive');
  });

  it('5. Should apply data-variant attribute for "outline" variant', () => {
    render(<Button variant="outline">Outline</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('data-variant', 'outline');
  });

  it('6. Should apply data-variant attribute for "ghost" variant', () => {
    render(<Button variant="ghost">Ghost</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('data-variant', 'ghost');
  });

  it('7. Should apply data-variant attribute for "dark-purple" variant', () => {
    render(<Button variant="dark-purple">Dark Purple</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('data-variant', 'dark-purple');
  });

  // ─── Sizes ───────────────────────────────────────────────────────────────────

  it('8. Should apply data-size attribute for "sm" size', () => {
    render(<Button size="sm">Small</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('data-size', 'sm');
  });

  it('9. Should apply data-size attribute for "lg" size', () => {
    render(<Button size="lg">Large</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('data-size', 'lg');
  });

  it('10. Should apply data-size attribute for "icon" size', () => {
    render(<Button size="icon">🔍</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('data-size', 'icon');
  });

  // ─── Loading State ───────────────────────────────────────────────────────────

  it('11. Should display "Loading..." text when loading=true', () => {
    render(<Button loading>Submit</Button>);
    expect(screen.getByRole('button')).toHaveTextContent('Loading...');
  });

  it('12. Should be disabled when loading=true', () => {
    render(<Button loading>Submit</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('13. Should render children normally when loading=false (default)', () => {
    render(<Button>Submit</Button>);
    expect(screen.getByRole('button')).toHaveTextContent('Submit');
    expect(screen.getByRole('button')).not.toBeDisabled();
  });

  // ─── Disabled State ──────────────────────────────────────────────────────────

  it('14. Should be disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('15. Should be disabled when both disabled and loading are true', () => {
    render(<Button disabled loading>Both</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
    expect(screen.getByRole('button')).toHaveTextContent('Loading...');
  });

  // ─── Custom className ────────────────────────────────────────────────────────

  it('16. Should merge custom className with base classes', () => {
    render(<Button className="my-custom-class">Custom</Button>);
    expect(screen.getByRole('button')).toHaveClass('my-custom-class');
  });

  // ─── onClick ─────────────────────────────────────────────────────────────────

  it('17. Should fire onClick handler when clicked', async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click</Button>);
    await userEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('18. Should NOT fire onClick when button is disabled', async () => {
    const handleClick = vi.fn();
    render(<Button disabled onClick={handleClick}>Disabled</Button>);
    await userEvent.click(screen.getByRole('button'));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('19. Should NOT fire onClick when button is loading', async () => {
    const handleClick = vi.fn();
    render(<Button loading onClick={handleClick}>Loading</Button>);
    await userEvent.click(screen.getByRole('button'));
    expect(handleClick).not.toHaveBeenCalled();
  });

  // ─── asChild ─────────────────────────────────────────────────────────────────

  it('20. Should render as anchor tag when asChild=true with <a> child', () => {
    render(
      <Button asChild>
        <a href="/home">Go Home</a>
      </Button>
    );
    // asChild merges with the child element — should render an <a>
    expect(screen.getByRole('link', { name: /go home/i })).toBeInTheDocument();
  });

  // ─── HTML attributes pass-through ────────────────────────────────────────────

  it('21. Should pass additional HTML attributes to the button element', () => {
    render(<Button type="submit" aria-label="submit form">Submit</Button>);
    const btn = screen.getByRole('button');
    expect(btn).toHaveAttribute('type', 'submit');
    expect(btn).toHaveAttribute('aria-label', 'submit form');
  });

  it('Should match snapshot', () => {
    const { asFragment } = render(<Button variant="primary">Snapshot</Button>);
    expect(asFragment()).toMatchSnapshot();
  });
});
