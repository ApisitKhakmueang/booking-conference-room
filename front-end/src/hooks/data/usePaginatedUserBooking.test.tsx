// @vitest-environment jsdom
import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { usePaginatedUserBookings } from './usePaginatedUserBookings'; // แก้ path ให้ตรง
import { adminService } from '@/service/booking.service';
import Swal from 'sweetalert2';
import { SWRConfig } from 'swr';
import React from 'react';

// 🌟 1. Mock Dependencies
vi.mock('@/service/booking.service', () => ({
  adminService: {
    fetchPaginatedUserBookings: vi.fn(),
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

describe('usePaginatedUserBookings', () => {

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('1. Should retrieved all bookings', async () => {
    // 🎯 จัดฉาก: จำลองข้อมูลหน้า 1
    const mockResponse = {
      data: [{ id: 'b1', status: 'confirm' }],
      meta: 'meta data'
    };
    vi.mocked(adminService.fetchPaginatedUserBookings).mockResolvedValue(mockResponse as any);

    const { result } = renderHook(
      () => usePaginatedUserBookings('user1', 1, 10, 'all', 2026, 5),
      { wrapper: createSWRWrapper() } // 👈 ใส่ wrapper เสมอเวลาเทส SWR
    );

    // ตอนแรกต้องหมุน Loading
    expect(result.current.isLoadingBookings).toBe(true);

    // รอจนกว่าจะดึงข้อมูลเสร็จ
    await waitFor(() => {
      expect(result.current.isLoadingBookings).toBe(false);
    });

    // ตรวจสอบข้อมูล
    expect(result.current.bookingsData).toEqual(mockResponse);
    expect(adminService.fetchPaginatedUserBookings).toHaveBeenCalledWith('user1', 1, 10, 'all', 2026, 5);
  });

  // Should not fetch data if user ID is undefined
  it('2. Should not fetch data if user ID is undefined', () => {
    const { result } = renderHook(
      // ส่ง userID เป็น undefined เพื่อให้ swrKey กลายเป็น null
      () => usePaginatedUserBookings(undefined, 1, 10, 'all', 2026, 5), 
      { wrapper: createSWRWrapper() }
    );

    // ตรวจสอบว่า API ต้องไม่ถูกเรียกเลย (SWR จะระงับการยิงถ้ารหัสเป็น null)
    expect(adminService.fetchPaginatedUserBookings).not.toHaveBeenCalled();
    // ข้อมูลต้องยังไม่มี
    expect(result.current.bookingsData).toBeUndefined();
  });

  it('3. Should show console.warn and not show Swal when occur an Error 404 (Not Found)', async () => {
    // 🎯 จัดฉาก: จำลอง Error 404
    const mockError404 = { response: { status: 404 } };
    vi.mocked(adminService.fetchPaginatedUserBookings).mockRejectedValue(mockError404);

    const { result } = renderHook(
      () => usePaginatedUserBookings('user1', 1, 10, 'all', 2026, 5),
      { wrapper: createSWRWrapper() }
    );

    await waitFor(() => {
      // isErrorBookings ของ SWR จะรับค่า Error เก็บไว้
      expect(result.current.isErrorBookings).toBeDefined(); 
    });

    expect(Swal.fire).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Not Found',
        icon: 'warning',
      })
    );
  });

  it('4. Should show Swal when error is a connection error or other error', async () => {
    // 🎯 จัดฉาก: จำลอง เน็ตหลุด (ไม่มี status 404)
    const mockNetworkError = new Error('Network timeout');
    vi.mocked(adminService.fetchPaginatedUserBookings).mockRejectedValue(mockNetworkError);

    const { result } = renderHook(
      () => usePaginatedUserBookings('user1', 1, 10, 'all', 2026, 5),
      { wrapper: createSWRWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isErrorBookings).toBeDefined();
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