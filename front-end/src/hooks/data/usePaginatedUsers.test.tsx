// @vitest-environment jsdom
import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { usePaginatedUsers } from './usePaginatedUsers'; // แก้ path ให้ตรง
import { adminService } from '@/service/booking.service';
import Swal from 'sweetalert2';
import { SWRConfig } from 'swr';
import React from 'react';
import { PaginatedUserResponse } from '@/utils/interface/response';

// 🌟 1. Mock Dependencies
vi.mock('@/service/booking.service', () => ({
  adminService: {
    fetchPaginatedUsers: vi.fn(),
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

describe('usePaginatedUsers', () => {

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('1. Should retrieved all users', async () => {
    // 🎯 จัดฉาก: จำลองข้อมูลหน้า 1
    const mockResponse = {
      data: [{ id: 'b1', status: 'confirm' }],
      meta: 'meta data'
    };
    vi.mocked(adminService.fetchPaginatedUsers).mockResolvedValue(mockResponse as unknown as PaginatedUserResponse);

    const { result } = renderHook(
      () => usePaginatedUsers(1, 5, 'search'),
      { wrapper: createSWRWrapper() } // 👈 ใส่ wrapper เสมอเวลาเทส SWR
    );

    // ตอนแรกต้องหมุน Loading
    expect(result.current.isLoadingUsers).toBe(true);

    // รอจนกว่าจะดึงข้อมูลเสร็จ
    await waitFor(() => {
      expect(result.current.isLoadingUsers).toBe(false);
    });

    // ตรวจสอบข้อมูล
    expect(result.current.usersData).toEqual(mockResponse);
    expect(adminService.fetchPaginatedUsers).toHaveBeenCalledWith(1, 5, 'search');
  });

  it('2. Should show console.warn and not show Swal when occur an Error 404 (Not Found)', async () => {
    // 🎯 จัดฉาก: จำลอง Error 404
    const mockError404 = { response: { status: 404 } };
    vi.mocked(adminService.fetchPaginatedUsers).mockRejectedValue(mockError404);

    const { result } = renderHook(
      () => usePaginatedUsers(1, 5, 'search'),
      { wrapper: createSWRWrapper() }
    );

    await waitFor(() => {
      // isErrorBookings ของ SWR จะรับค่า Error เก็บไว้
      expect(result.current.isErrorUsers).toBeDefined(); 
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
    vi.mocked(adminService.fetchPaginatedUsers).mockRejectedValue(mockNetworkError);

    const { result } = renderHook(
      () => usePaginatedUsers(1, 5),
      { wrapper: createSWRWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isErrorUsers).toBeDefined();
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