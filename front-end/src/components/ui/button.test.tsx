// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { Button } from './button';

describe('Button Component', () => {
  it('1. Should render with children text', () => {
    render(<Button>Click Me</Button>);
    expect(screen.getByText('Click Me')).toBeInTheDocument();
  });

  it('2. Should show "Loading..." and be disabled when loading={true}', () => {
    render(<Button loading={true}>Click Me</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveTextContent('Loading...');
    expect(button).toBeDisabled();
  });

  it('3. Should forward data attributes for variant and size', () => {
    render(<Button variant="destructive" size="sm">Delete</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('data-variant', 'destructive');
    expect(button).toHaveAttribute('data-size', 'sm');
  });

  it('4. Should render as a different element when asChild is true', () => {
    const { container } = render(
      <Button asChild>
        <a href="/test">Link Button</a>
      </Button>
    );
    // ตรวจสอบว่าไม่มีแท็ก button แต่มีแท็ก a แทน
    expect(container.querySelector('button')).toBeNull();
    expect(container.querySelector('a')).toHaveAttribute('href', '/test');
  });

  it('5. Should merge custom className correctly', () => {
    render(<Button className="my-custom-class">Click Me</Button>);
    const button = screen.getByRole('button');
    
    // ตรวจสอบว่าคลาสเดิมยังอยู่ (เช่น inline-flex) และคลาสใหม่ก็มาด้วย
    expect(button).toHaveClass('inline-flex');
    expect(button).toHaveClass('my-custom-class');
  });

  it('6. Should pass through HTML button attributes like onClick and id', async () => {
    const handleClick = vi.fn();
    render(<Button id="submit-btn" onClick={handleClick}>Submit</Button>);
    
    const button = screen.getByRole('button');
    
    // ตรวจสอบ ID
    expect(button).toHaveAttribute('id', 'submit-btn');
    
    // ตรวจสอบการคลิก
    await userEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('7. Should be disabled when disabled={true} is passed directly', () => {
    render(<Button disabled>Disabled Button</Button>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });
});