// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import AdvancedWindow from './advance-window';
import { ConfigResponse } from '@/utils/interface/response';

describe('AdvancedWindow Component', () => {
  const mockConfig = { maxAdvanceDays: 30 } as unknown as ConfigResponse;
  const mockSetConfig = vi.fn();

  it('1. Should render correctly with title and description', () => {
    render(<AdvancedWindow config={mockConfig} setConfig={mockSetConfig} isOpenEdit={false} />);
    expect(screen.getByText('Advance Window')).toBeInTheDocument();
    expect(screen.getByText(/How far ahead can clients secure their/i)).toBeInTheDocument();
  });

  it('2. Select trigger should be disabled when isOpenEdit is false', () => {
    render(<AdvancedWindow config={mockConfig} setConfig={mockSetConfig} isOpenEdit={false} />);
    const trigger = screen.getByRole('combobox');
    expect(trigger).toBeDisabled();
  });

  it('3. Select trigger should be enabled when isOpenEdit is true', () => {
    render(<AdvancedWindow config={mockConfig} setConfig={mockSetConfig} isOpenEdit={true} />);
    const trigger = screen.getByRole('combobox');
    expect(trigger).not.toBeDisabled();
  });
});