// @vitest-environment jsdom
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import SystemConfig from './system-config';

// Mock Dependencies
import { useSystemConfig } from '@/hooks/data/useSystemConfig';
import { configService } from '@/service/booking.service';
import Swal from 'sweetalert2';

vi.mock('@/hooks/data/useSystemConfig', () => ({
  useSystemConfig: vi.fn(),
}));

vi.mock('@/service/booking.service', () => ({
  configService: { updateConfig: vi.fn() },
}));

vi.mock('sweetalert2', () => ({
  default: { fire: vi.fn() },
}));

describe('SystemConfig Component', () => {
  const mockReloadConfig = vi.fn();
  const fetchedConfigMock = {
    maxBookingMins: 120, // 2 hours in backend
    maxAdvanceDays: 30,
    startTime: '08:00',
    endTime: '20:00',
    noShowThresholdMins: 15,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useSystemConfig).mockReturnValue({
      config: fetchedConfigMock,
      isLoadingConfig: false,
      reloadConfig: mockReloadConfig,
    } as unknown as ReturnType<typeof useSystemConfig>);
  });

  it('1. Should load and convert maxBookingMins correctly (120 mins -> 2 hours)', () => {
    render(<SystemConfig />);
    // ต้องโชว์ 2 (ไม่ใช่ 120) เพราะใน useEffect หาร 60[cite: 12]
    expect(screen.getAllByDisplayValue('2').length).toBeGreaterThan(0); 
    expect(screen.getByText('30 Days Advance')).toBeInTheDocument();
  });

  it('2. Should toggle edit mode and display footer actions', async () => {
    render(<SystemConfig />);
    
    const editBtn = screen.getByRole('button', { name: /Edit Configuration/i });
    await userEvent.click(editBtn);

    expect(screen.getByRole('button', { name: /Discard Changes/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Save Configuration/i })).toBeInTheDocument();
  });

  it('3. Should revert changes on Discard', async () => {
    render(<SystemConfig />);
    await userEvent.click(screen.getByRole('button', { name: /Edit Configuration/i }));
    
    // จำลองแก้ไขค่า Late Arrival 
    const lateArrivalInput = screen.getByDisplayValue('15');
    await userEvent.clear(lateArrivalInput);
    await userEvent.type(lateArrivalInput, '10');
    
    // กด Discard
    const discardBtn = screen.getByRole('button', { name: /Discard Changes/i });
    await userEvent.click(discardBtn);

    // ค่าต้องกลับมาเป็น 15 เหมือนตอนเริ่ม[cite: 12]
    expect(screen.getByDisplayValue('15')).toBeInTheDocument();
  });

  it('4. Should warn if startTime is greater than or equal to endTime', async () => {
    render(<SystemConfig />);
    await userEvent.click(screen.getByRole('button', { name: /Edit Configuration/i }));
    
    const startTimeInput = screen.getByDisplayValue('08:00');
    fireEvent.change(startTimeInput, { target: { value: '21:00' } }); // 21:00 > 20:00

    await userEvent.click(screen.getByRole('button', { name: /Save Configuration/i }));

    // ต้องโชว์ Swal warning และไม่เรียก API[cite: 12]
    expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Invalid Time',
      icon: 'warning'
    }));
    expect(configService.updateConfig).not.toHaveBeenCalled();
  });

  it('5. Should multiply maxBookingMins by 60 and call API on Save', async () => {
    vi.mocked(configService.updateConfig).mockResolvedValue({ status: 200 } as unknown as Awaited<ReturnType<typeof configService.updateConfig>>);
    
    render(<SystemConfig />);
    await userEvent.click(screen.getByRole('button', { name: /Edit Configuration/i }));
    await userEvent.click(screen.getByRole('button', { name: /Save Configuration/i }));

    await waitFor(() => {
      // ตรวจสอบว่าก่อนส่งไป API มีการเอา maxBookingMins (2) ไปคูณ 60 เป็น 120 กลับคืนมา[cite: 12]
      expect(configService.updateConfig).toHaveBeenCalledWith(expect.objectContaining({
        maxBookingMins: 120,
        noShowThresholdMins: 15
      }));
      expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ icon: 'success' }));
      expect(mockReloadConfig).toHaveBeenCalled();
    });
  });
});