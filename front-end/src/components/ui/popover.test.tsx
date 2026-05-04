// @vitest-environment jsdom
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverAnchor,
  PopoverHeader,
  PopoverTitle,
  PopoverDescription,
} from './popover';
import React from 'react';

// Helper: minimal Popover setup
function renderPopover({
  defaultOpen = false,
  content = 'Popover content',
}: {
  defaultOpen?: boolean;
  content?: string;
} = {}) {
  return render(
    <Popover defaultOpen={defaultOpen}>
      <PopoverTrigger asChild>
        <button>Open Popover</button>
      </PopoverTrigger>
      <PopoverContent>
        <PopoverHeader>
          <PopoverTitle>Title</PopoverTitle>
          <PopoverDescription>Description</PopoverDescription>
        </PopoverHeader>
        <p>{content}</p>
      </PopoverContent>
    </Popover>
  );
}

describe('Popover', () => {
  // ─── Rendering ──────────────────────────────────────────────────────────────

  it('1. Should render with data-slot="popover"', async () => {
    renderPopover({ defaultOpen: true }); 

    // 🌟 ใช้ waitFor เพื่อรอให้ Radix เรนเดอร์ Portal ลงใน body ให้เสร็จ
    await waitFor(() => {
      const popoverContent = document.body.querySelector('[data-slot="popover-content"]');
      expect(popoverContent).not.toBeNull();
      expect(popoverContent).toBeInTheDocument();
    });
  });

  it('2. Should render the trigger button', () => {
    renderPopover();
    expect(screen.getByRole('button', { name: /open popover/i })).toBeInTheDocument();
  });

  it('3. Should render trigger with data-slot="popover-trigger"', () => {
    const { container } = renderPopover();
    expect(container.querySelector('[data-slot="popover-trigger"]')).toBeInTheDocument();
  });

  // ─── Closed state ────────────────────────────────────────────────────────────

  it('4. Should NOT show popover content when closed (default)', () => {
    renderPopover({ content: 'Hidden content' });
    expect(screen.queryByText('Hidden content')).not.toBeInTheDocument();
  });

  // ─── Open state ──────────────────────────────────────────────────────────────

  it('5. Should show popover content when defaultOpen=true', () => {
    renderPopover({ defaultOpen: true, content: 'Visible content' });
    expect(screen.getByText('Visible content')).toBeInTheDocument();
  });

  it('6. Should open popover when trigger is clicked', async () => {
    renderPopover({ content: 'Click opened' });
    await userEvent.click(screen.getByRole('button', { name: /open popover/i }));
    expect(await screen.findByText('Click opened')).toBeInTheDocument();
  });

  it('7. Should close popover on second trigger click', async () => {
    renderPopover({ content: 'Toggle content' });
    const trigger = screen.getByRole('button', { name: /open popover/i });
    await userEvent.click(trigger);
    expect(await screen.findByText('Toggle content')).toBeInTheDocument();
    await userEvent.click(trigger);
    expect(screen.queryByText('Toggle content')).not.toBeInTheDocument();
  });

  // ─── PopoverContent ──────────────────────────────────────────────────────────

  it('8. Should render PopoverContent with data-slot="popover-content"', () => {
    renderPopover({ defaultOpen: true });
    expect(document.querySelector('[data-slot="popover-content"]')).toBeInTheDocument();
  });

  it('9. Should accept custom className on PopoverContent', () => {
    render(
      <Popover defaultOpen>
        <PopoverTrigger>T</PopoverTrigger>
        <PopoverContent className="custom-popover">Body</PopoverContent>
      </Popover>
    );
    expect(document.querySelector('.custom-popover')).toBeInTheDocument();
  });

  // ─── PopoverHeader ───────────────────────────────────────────────────────────

  it('10. Should render PopoverHeader with data-slot="popover-header"', () => {
    renderPopover({ defaultOpen: true });
    expect(document.querySelector('[data-slot="popover-header"]')).toBeInTheDocument();
  });

  // ─── PopoverTitle ────────────────────────────────────────────────────────────

  it('11. Should render PopoverTitle with data-slot="popover-title"', () => {
    renderPopover({ defaultOpen: true });
    expect(document.querySelector('[data-slot="popover-title"]')).toBeInTheDocument();
  });

  it('12. Should render title text', () => {
    renderPopover({ defaultOpen: true });
    expect(screen.getByText('Title')).toBeInTheDocument();
  });

  // ─── PopoverDescription ──────────────────────────────────────────────────────

  it('13. Should render PopoverDescription with data-slot="popover-description"', () => {
    renderPopover({ defaultOpen: true });
    expect(document.querySelector('[data-slot="popover-description"]')).toBeInTheDocument();
  });

  it('14. Should render description text', () => {
    renderPopover({ defaultOpen: true });
    expect(screen.getByText('Description')).toBeInTheDocument();
  });

  // ─── PopoverAnchor ───────────────────────────────────────────────────────────

  it('15. Should render PopoverAnchor with data-slot="popover-anchor"', () => {
    const { container } = render(
      <Popover>
        <PopoverAnchor>
          <span>Anchor</span>
        </PopoverAnchor>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverContent>Content</PopoverContent>
      </Popover>
    );
    expect(container.querySelector('[data-slot="popover-anchor"]')).toBeInTheDocument();
  });
});
