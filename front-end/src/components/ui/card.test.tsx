// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardContent,
  CardFooter,
} from './card';
import React from 'react';

describe('Card', () => {
  // ─── Rendering ──────────────────────────────────────────────────────────────

  it('1. Should render Card with children', () => {
    render(<Card>Card body</Card>);
    expect(screen.getByText('Card body')).toBeInTheDocument();
  });

  it('2. Should render with data-slot="card" attribute', () => {
    const { container } = render(<Card>Body</Card>);
    expect(container.querySelector('[data-slot="card"]')).toBeInTheDocument();
  });

  // ─── Variants ────────────────────────────────────────────────────────────────

  it('3. Should apply data-size attribute when size prop is provided', () => {
    const { container } = render(<Card size="sm">Small Card</Card>);
    expect(container.querySelector('[data-size="sm"]')).toBeInTheDocument();
  });

  it('4. Should NOT render children when loading=true', () => {
    render(<Card loading>Hidden Content</Card>);
    expect(screen.queryByText('Hidden Content')).not.toBeInTheDocument();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('5. Should render children when loading=false (default)', () => {
    render(<Card>Visible Content</Card>);
    expect(screen.getByText('Visible Content')).toBeInTheDocument();
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
  });

  it('6. Should merge custom className', () => {
    const { container } = render(<Card className="test-class">Body</Card>);
    expect(container.querySelector('.test-class')).toBeInTheDocument();
  });

  it('7. Should pass through standard HTML attributes', () => {
    // ทดสอบการส่ง ID และ data-testid
    render(
      <Card id="main-card" data-testid="test-card" aria-label="card-container">
        Body
      </Card>
    );
    const card = screen.getByTestId('test-card');
    
    expect(card).toHaveAttribute('id', 'main-card');
    expect(card).toHaveAttribute('aria-label', 'card-container');
  });

  it('8. Should forward ref to the DOM element', () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<Card ref={ref}>Ref Card</Card>);
    
    // ตรวจสอบว่า ref มีค่าและเป็น HTML Element จริงๆ
    expect(ref.current).not.toBeNull();
    expect(ref.current?.tagName).toBe('DIV');
    expect(ref.current).toHaveAttribute('data-slot', 'card');
  });
});

// ─── CardHeader ───────────────────────────────────────────────────────────────

describe('CardHeader', () => {
  it('9. Should render with data-slot="card-header"', () => {
    const { container } = render(<CardHeader>Header</CardHeader>);
    expect(container.querySelector('[data-slot="card-header"]')).toBeInTheDocument();
  });

  it('10. Should render children inside CardHeader', () => {
    render(<CardHeader>My Header</CardHeader>);
    expect(screen.getByText('My Header')).toBeInTheDocument();
  });
});

// ─── CardTitle ────────────────────────────────────────────────────────────────

describe('CardTitle', () => {
  it('11. Should render with data-slot="card-title"', () => {
    const { container } = render(<CardTitle>Title</CardTitle>);
    expect(container.querySelector('[data-slot="card-title"]')).toBeInTheDocument();
  });

  it('12. Should render title text', () => {
    render(<CardTitle>Room A</CardTitle>);
    expect(screen.getByText('Room A')).toBeInTheDocument();
  });
});

// ─── CardDescription ─────────────────────────────────────────────────────────

describe('CardDescription', () => {
  it('13. Should render with data-slot="card-description"', () => {
    const { container } = render(<CardDescription>Description</CardDescription>);
    expect(container.querySelector('[data-slot="card-description"]')).toBeInTheDocument();
  });

  it('14. Should render description text', () => {
    render(<CardDescription>Some description text</CardDescription>);
    expect(screen.getByText('Some description text')).toBeInTheDocument();
  });
});

// ─── CardAction ───────────────────────────────────────────────────────────────

describe('CardAction', () => {
  it('15. Should render with data-slot="card-action"', () => {
    const { container } = render(<CardAction>Action</CardAction>);
    expect(container.querySelector('[data-slot="card-action"]')).toBeInTheDocument();
  });
});

// ─── CardContent ──────────────────────────────────────────────────────────────

describe('CardContent', () => {
  it('16. Should render with data-slot="card-content"', () => {
    const { container } = render(<CardContent>Content</CardContent>);
    expect(container.querySelector('[data-slot="card-content"]')).toBeInTheDocument();
  });

  it('17. Should render children inside CardContent', () => {
    render(<CardContent>Booking info here</CardContent>);
    expect(screen.getByText('Booking info here')).toBeInTheDocument();
  });
});

// ─── CardFooter ───────────────────────────────────────────────────────────────

describe('CardFooter', () => {
  it('18. Should render with data-slot="card-footer"', () => {
    const { container } = render(<CardFooter>Footer</CardFooter>);
    expect(container.querySelector('[data-slot="card-footer"]')).toBeInTheDocument();
  });

  it('19. Should render children inside CardFooter', () => {
    render(<CardFooter>Footer content</CardFooter>);
    expect(screen.getByText('Footer content')).toBeInTheDocument();
  });
});

// ─── Composition ─────────────────────────────────────────────────────────────

describe('Card composition', () => {
  it('20. Should render a fully composed Card with all sub-components', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Conference Room A</CardTitle>
          <CardDescription>Capacity: 10 persons</CardDescription>
          <CardAction><button>Edit</button></CardAction>
        </CardHeader>
        <CardContent>Room details go here</CardContent>
        <CardFooter>Last updated today</CardFooter>
      </Card>
    );

    expect(screen.getByText('Conference Room A')).toBeInTheDocument();
    expect(screen.getByText('Capacity: 10 persons')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
    expect(screen.getByText('Room details go here')).toBeInTheDocument();
    expect(screen.getByText('Last updated today')).toBeInTheDocument();
  });
});

describe('Card Sub-components Customization', () => {
  it('21. Should merge custom className for sub-components', () => {
    const { container } = render(
      <Card>
        <CardHeader className="custom-header">Header</CardHeader>
        <CardContent className="custom-content">Content</CardContent>
        <CardFooter className="custom-footer">Footer</CardFooter>
      </Card>
    );

    expect(container.querySelector('.custom-header')).toBeInTheDocument();
    expect(container.querySelector('.custom-content')).toBeInTheDocument();
    expect(container.querySelector('.custom-footer')).toBeInTheDocument();
  });
});
