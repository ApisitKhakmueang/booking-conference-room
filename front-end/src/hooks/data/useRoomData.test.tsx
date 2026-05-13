// @vitest-environment jsdom
import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useRoomData } from './useRoomData';
import { roomService } from '@/service/booking.service';
import Swal from 'sweetalert2';
import { SWRConfig } from 'swr';
import React from 'react';
import { RoomResponse } from '@/utils/interface/response';

// 🌟 1. Mock Dependencies
vi.mock('@/service/booking.service', () => ({
  roomService: {
    fetchRoomDetails: vi.fn(),
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

describe('useRoomData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('1. Should retrieved all users', async () => {
    // 🎯 จัดฉาก: จำลองข้อมูลหน้า 1
    const mockResponse = {
      data: [{ id: 'b1', status: 'confirm' }],
      meta: 'meta data'
    };
    vi.mocked(roomService.fetchRoomDetails).mockResolvedValue(mockResponse as unknown as RoomResponse[]);

    const { result } = renderHook(
      () => useRoomData(),
      { wrapper: createSWRWrapper() } // 👈 ใส่ wrapper เสมอเวลาเทส SWR
    );

    // ตอนแรกต้องหมุน Loading
    expect(result.current.isLoading).toBe(true);

    // รอจนกว่าจะดึงข้อมูลเสร็จ
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // ตรวจสอบข้อมูล
    expect(result.current.room).toEqual(mockResponse);
    expect(roomService.fetchRoomDetails).toHaveBeenCalledWith();
  });

  it('2. Should show console.warn and not show Swal when occur an Error 404 (Not Found)', async () => {
    // 🎯 จัดฉาก: จำลอง Error 404
    const mockError404 = { response: { status: 404 } };
    vi.mocked(roomService.fetchRoomDetails).mockRejectedValue(mockError404);

    const { result } = renderHook(
      () => useRoomData(),
      { wrapper: createSWRWrapper() }
    );

    await waitFor(() => {
      // isErrorBookings ของ SWR จะรับค่า Error เก็บไว้
      expect(result.current.isError).toBeDefined(); 
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
    vi.mocked(roomService.fetchRoomDetails).mockRejectedValue(mockNetworkError);

    const { result } = renderHook(
      () => useRoomData(),
      { wrapper: createSWRWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isError).toBeDefined();
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