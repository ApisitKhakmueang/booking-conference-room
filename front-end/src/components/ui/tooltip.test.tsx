// @vitest-environment jsdom
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './tooltip';

// Helper: wrap in TooltipProvider (required by Radix)
function renderTooltip({
  content = 'Tooltip text',
  defaultOpen = false,
}: {
  content?: string;
  defaultOpen?: boolean;
} = {}) {
  return render(
    <TooltipProvider>
      <Tooltip defaultOpen={defaultOpen}>
        <TooltipTrigger asChild>
          <button>Hover me</button>
        </TooltipTrigger>
        <TooltipContent>{content}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

describe('TooltipProvider', () => {
  it('1. Should render tooltip content when open', async () => {
    // 🌟 ใช้ defaultOpen เพื่อให้ Tooltip ปรากฏทันที (Portal)
    renderTooltip({ defaultOpen: true, content: 'Hello Tooltip' });

    // 🌟 ต้องใช้ waitFor หรือ findBy เพราะ Tooltip มักจะมี Delay/Animation ในการปรากฏ
    await waitFor(() => {
      // หา Element ที่ทำหน้าที่เป็น tooltip และมีชื่อ (ข้อความข้างใน) ตรงกับที่เรากำหนด
      const tooltip = screen.getByRole('tooltip', { name: /hello tooltip/i });
      expect(tooltip).toBeInTheDocument();
    });
  });
});

describe('Tooltip', () => {
  it('2. Should render the trigger button', () => {
    renderTooltip();
    expect(screen.getByRole('button', { name: /hover me/i })).toBeInTheDocument();
  });

  it('3. Should render trigger with data-slot="tooltip-trigger"', () => {
    const { container } = renderTooltip();
    expect(container.querySelector('[data-slot="tooltip-trigger"]')).toBeInTheDocument();
  });

  it('4. Should NOT show tooltip content by default', () => {
    renderTooltip({ content: 'Hidden tooltip' });
    // Content is in a portal; when closed it should not be visible
    expect(screen.queryByText('Hidden tooltip')).not.toBeInTheDocument();
  });

  it('5. Should show tooltip content when defaultOpen=true', () => {
    renderTooltip({ content: 'Open tooltip', defaultOpen: true });
  
    // 🌟 ค้นหาโดยระบุ role="tooltip" เพื่อป้องกันการเจอข้อความซ้ำ
    const tooltip = screen.getByRole('tooltip', { name: /open tooltip/i });
    
    expect(tooltip).toBeInTheDocument();
  });

  it('6. Should show tooltip on hover', async () => {
    const user = userEvent.setup();
    renderTooltip({ content: 'Focused tooltip' });

    const trigger = screen.getByRole('button', { name: /hover me/i });
    await user.hover(trigger);

    // 🌟 เปลี่ยนมาใช้ findByRole แทน findByText
    const tooltip = await screen.findByRole('tooltip', { name: /focused tooltip/i });
    expect(tooltip).toBeInTheDocument();
  });

  it('7. Should render TooltipContent with data-slot="tooltip-content"', () => {
    renderTooltip({ defaultOpen: true });
    const content = document.querySelector('[data-slot="tooltip-content"]');
    expect(content).toBeInTheDocument();
  });

  it('8. Should render custom text inside TooltipContent', async () => {
    const customText = 'Book this room';
    renderTooltip({ content: customText, defaultOpen: true });
    
    // 🌟 ค้นหาโดยระบุ role="tooltip" และชื่อที่ตรงกับข้อความของเรา
    const tooltip = screen.getByRole('tooltip', { name: customText });
    
    expect(tooltip).toBeInTheDocument();
  });
});

describe('TooltipContent', () => {
  it('9. Should accept and apply custom className', () => {
    render(
      <TooltipProvider>
        <Tooltip defaultOpen>
          <TooltipTrigger>Trigger</TooltipTrigger>
          <TooltipContent className="custom-tooltip">Info</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
    const content = document.querySelector('[data-slot="tooltip-content"]');
    expect(content).toHaveClass('custom-tooltip');
  });

  it('10. Should forward sideOffset prop without errors', () => {
    expect(() =>
      render(
        <TooltipProvider>
          <Tooltip defaultOpen>
            <TooltipTrigger>T</TooltipTrigger>
            <TooltipContent sideOffset={8}>Content</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    ).not.toThrow();
  });
});
