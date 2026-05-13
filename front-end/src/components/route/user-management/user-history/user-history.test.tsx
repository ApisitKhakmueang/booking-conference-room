// @vitest-environment jsdom
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import UserHistory from './user-history';
import { useUserOverview } from '@/hooks/data/useUserOverview';
import { useRouter } from 'next/navigation';

// Mock Dependencies
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

vi.mock('@/hooks/data/useUserOverview', () => ({
  useUserOverview: vi.fn(),
}));

// Mock Container ย่อยเพื่อลดความซับซ้อน (Unit isolation)
vi.mock('./history-table-container', () => ({
  default: () => <div data-testid="mock-history-table" />
}));

describe('UserHistory Main Page', () => {
  const mockBack = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useRouter).mockReturnValue({ back: mockBack } as unknown as ReturnType<typeof useRouter>);
  });

  it('1. Should call router.back() when Back button is clicked', () => {
    vi.mocked(useUserOverview).mockReturnValue({ overviewData: null, isLoadingOverview: true } as unknown as ReturnType<typeof useUserOverview>);
    
    render(<UserHistory userID="123" />);
    
    const backBtn = screen.getByRole('button', { name: /Back to Users/i });
    fireEvent.click(backBtn);
    
    // ตรวจสอบว่าปุ่มกดแล้วสั่ง router.back()[cite: 19]
    expect(mockBack).toHaveBeenCalledTimes(1);
  });

  it('2. Should render Skeletons when isLoadingOverview is true', () => {
    vi.mocked(useUserOverview).mockReturnValue({ overviewData: null, isLoadingOverview: true } as unknown as ReturnType<typeof useUserOverview>);
    
    const { container } = render(<UserHistory userID="123" />);
    // จะต้องมีคลาส animate-pulse ของ ProfileHeaderSkeleton และ SummaryCardSkeleton แสดงอยู่[cite: 16, 18, 19]
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0);
  });

  it('3. Should render User info when loaded', () => {
    const mockOverview = {
      user: { fullName: 'John Doe', email: 'john@test.com', status: 'active' },
      statistics: { upcoming: 5, completed: 10 }
    };

    vi.mocked(useUserOverview).mockReturnValue({ overviewData: mockOverview, isLoadingOverview: false } as unknown as ReturnType<typeof useUserOverview>);
    
    render(<UserHistory userID="123" />);
    
    // ตรวจสอบว่าแสดงชื่อที่ดึงมาสำเร็จ[cite: 16, 19]
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@test.com')).toBeInTheDocument();
    
    // ตรวจสอบว่า Table ถูกเรียกขึ้นมา
    expect(screen.getByTestId('mock-history-table')).toBeInTheDocument();
  });
});