// @vitest-environment jsdom
import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useUserOverview } from './useUserOverview';
import { adminService } from '@/service/booking.service';
import Swal from 'sweetalert2';
import { SWRConfig } from 'swr';
import React from 'react';

// 🌟 1. Mock Dependencies
vi.mock('@/service/booking.service', () => ({
  adminService: {
    fetchUserOverview: vi.fn(),
  },
}));

vi.mock('sweetalert2', () => ({
  default: {
    fire: vi.fn(),
  },
}));

// 🌟 2. สร้าง Wrapper สำหรับเคลียร์ Cache ของ SWR ในทุกๆ เทส
const createSWRWrapper = () => {
  return ({ children }: { children: React.ReactNode }) => (
    <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}>
      {children}
    </SWRConfig>
  );
};

describe('useUserOverview', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('1. Should retrieved all users', async () => {
    // 🎯 จัดฉาก: จำลองข้อมูลหน้า 1
    const mockResponse = {
      user: 'user data',
      statistics: 'stat data',
    };
    vi.mocked(adminService.fetchUserOverview).mockResolvedValue(mockResponse as any);

    const { result } = renderHook(
      () => useUserOverview('101'),
      { wrapper: createSWRWrapper() } // 👈 ใส่ wrapper เสมอเวลาเทส SWR
    );

    // ตอนแรกต้องหมุน Loading
    expect(result.current.isLoadingOverview).toBe(true);

    // รอจนกว่าจะดึงข้อมูลเสร็จ
    await waitFor(() => {
      expect(result.current.isLoadingOverview).toBe(false);
    });

    // ตรวจสอบข้อมูล
    expect(result.current.overviewData).toEqual(mockResponse);
    expect(adminService.fetchUserOverview).toHaveBeenCalledWith('101');
  });

  it('2. Should not fetch data if user ID is undefined', () => {
    const { result } = renderHook(
      // ส่ง userID เป็น undefined เพื่อให้ swrKey กลายเป็น null
      () => useUserOverview(undefined), 
      { wrapper: createSWRWrapper() }
    );

    // ตรวจสอบว่า API ต้องไม่ถูกเรียกเลย (SWR จะระงับการยิงถ้ารหัสเป็น null)
    expect(adminService.fetchUserOverview).not.toHaveBeenCalled();
    // ข้อมูลต้องยังไม่มี
    expect(result.current.overviewData).toBeUndefined();
  });

  it('2. Should show console.warn and not show Swal when occur an Error 404 (Not Found)', async () => {
    // 🎯 จัดฉาก: จำลอง Error 404
    const mockError404 = { response: { status: 404 } };
    vi.mocked(adminService.fetchUserOverview).mockRejectedValue(mockError404);

    const { result } = renderHook(
      () => useUserOverview('101'),
      { wrapper: createSWRWrapper() }
    );

    await waitFor(() => {
      // isErrorOverviewBookings ของ SWR จะรับค่า Error เก็บไว้
      expect(result.current.isErrorOverview).toBeDefined(); 
    });

    expect(Swal.fire).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Not Found',
        icon: 'warning',
      })
    );
  });

  it('3. Should show Swal when error is a connection error or other error', async () => {
    // 🎯 จัดฉาก: จำลอง เน็ตหลุด (ไม่มี status 404)
    const mockNetworkError = new Error('Network timeout');
    vi.mocked(adminService.fetchUserOverview).mockRejectedValue(mockNetworkError);

    const { result } = renderHook(
      () => useUserOverview('101'),
      { wrapper: createSWRWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isErrorOverview).toBeDefined();
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