// @vitest-environment jsdom
import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useSystemConfig } from './useSystemConfig';
import { configService } from '@/service/booking.service';
import Swal from 'sweetalert2';
import { SWRConfig } from 'swr';
import React from 'react';
import { ConfigResponse } from '@/utils/interface/response';

// 🌟 1. Mock Dependencies
vi.mock('@/service/booking.service', () => ({
  configService: {
    fetchConfig: vi.fn(),
  },
}));

vi.mock('sweetalert2', () => ({
  default: {
    fire: vi.fn(),
  },
}));

// 🌟 2. สร้าง Wrapper สำหรับเคลียร์ Cache ของ SWR ในทุกๆ เทส
const createSWRWrapper = () => {
  // ✅ ตั้งชื่อให้มันว่า SWRWrapper แทนที่จะ return ฟังก์ชันเปล่าๆ ออกไปเลย
  const SWRWrapper = ({ children }: { children: React.ReactNode }) => (
    <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}>
      {children}
    </SWRConfig>
  );
  return SWRWrapper;
};

describe('useSystemConfig', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('1. Should retrieved all users', async () => {
    // 🎯 จัดฉาก: จำลองข้อมูลหน้า 1
    const mockResponse = {
      startTime: "08:00",
      endTime: "20:00",
      maxAdvanceDays: 30,
      maxBookingMins: 120,
      noShowThresholdMins: 15,
    };
    vi.mocked(configService.fetchConfig).mockResolvedValue(mockResponse as unknown as ConfigResponse);

    const { result } = renderHook(
      () => useSystemConfig(),
      { wrapper: createSWRWrapper() } // 👈 ใส่ wrapper เสมอเวลาเทส SWR
    );

    // ตอนแรกต้องหมุน Loading
    expect(result.current.isLoadingConfig).toBe(true);

    // รอจนกว่าจะดึงข้อมูลเสร็จ
    await waitFor(() => {
      expect(result.current.isLoadingConfig).toBe(false);
    });

    // ตรวจสอบข้อมูล
    expect(result.current.config).toEqual(mockResponse);
    expect(configService.fetchConfig).toHaveBeenCalledWith();
  });

  it('2. Should show console.warn and not show Swal when date format is invalid', async () => {
    // 🎯 จัดฉาก: จำลอง Error 404
    const mockError500 = { response: { status: 500 } };
    vi.mocked(configService.fetchConfig).mockRejectedValue(mockError500);

    const { result } = renderHook(
      () => useSystemConfig(),
      { wrapper: createSWRWrapper() }
    );

    await waitFor(() => {
      // isErrorConfigBookings ของ SWR จะรับค่า Error เก็บไว้
      expect(result.current.isErrorConfig).toBeDefined(); 
    });

    expect(Swal.fire).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Error',
        icon: 'warning',
      })
    );
  });

  it('3. Should show Swal when error is a connection error or other error', async () => {
    // 🎯 จัดฉาก: จำลอง เน็ตหลุด (ไม่มี status 404)
    const mockNetworkError = new Error('Network timeout');
    vi.mocked(configService.fetchConfig).mockRejectedValue(mockNetworkError);

    const { result } = renderHook(
      () => useSystemConfig(),
      { wrapper: createSWRWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isErrorConfig).toBeDefined();
    });

    // ตรวจสอบว่า Swal.fire ถูกเรียกด้วยหัวข้อ Connection Error
    expect(Swal.fire).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Connection Error',
        icon: 'error',
      })
    );
  });
});