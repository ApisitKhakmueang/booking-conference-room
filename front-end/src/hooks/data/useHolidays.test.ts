// @vitest-environment jsdom
import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useHolidays } from './useHolidays'; // แก้ path ให้ตรงกับไฟล์จริง
import { helperService } from '@/service/booking.service';
import Swal from 'sweetalert2';
import { parseISO } from 'date-fns';

// 🌟 1. Mock Dependencies
// Mock การยิง API
vi.mock('@/service/booking.service', () => ({
  helperService: {
    fetchHolidays: vi.fn(),
  },
}));

// Mock SweetAlert2
vi.mock('sweetalert2', () => ({
  default: {
    fire: vi.fn(),
  },
}));

describe('useHolidays', () => {
  // ล้างค่า Mock ทุกครั้งก่อนเริ่มเทสใหม่
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('1. Should retrieved all holidays', async () => {
    // 🎯 จัดฉาก: ให้ API ตอบกลับมาสำเร็จพร้อมข้อมูล (mockResolvedValue)
    const mockData = [
      { 
        id: "1", 
        name: 'Songkran', 
        date: '2026-04-13T00:00:00.000Z', 
        updatedAt: '2026-01-01T00:00:00.000Z',
        isDayOff: true,
        source: 'google'
      },
    ];

    vi.mocked(helperService.fetchHolidays).mockResolvedValue(mockData);

    // เริ่มรัน Hook
    const { result } = renderHook(() => useHolidays('2026', '2026'));

    // ตอนแรกสุด Loading ต้องเป็น true
    expect(result.current.isLoadingHoliday).toBe(true);

    // 🌟 รอให้ Hook ประมวลผล API และ State จนเสร็จ
    await waitFor(() => {
      expect(result.current.isLoadingHoliday).toBe(false);
    });

    // ตรวจสอบว่าแปลง String เป็น Date Object ด้วย parseISO สำเร็จไหม
    expect(result.current.holiday).toHaveLength(1);
    expect(result.current.holiday![0].date).toEqual(parseISO('2026-04-13T00:00:00.000Z'));
    expect(result.current.holiday![0].updatedAt).toEqual(parseISO('2026-01-01T00:00:00.000Z'));
  });

  it('2. Should show error alert when holidays not found', async () => {
    // 🎯 จัดฉาก: ให้ API ตอบกลับมาว่าพัง (mockRejectedValue) พร้อมแนบ Status 404
    const mockError = { response: { status: 404 } };
    vi.mocked(helperService.fetchHolidays).mockRejectedValue(mockError);

    const { result } = renderHook(() => useHolidays('2026', '2026'));

    await waitFor(() => {
      expect(result.current.isLoadingHoliday).toBe(false);
    });

    // ตรวจสอบว่า Swal.fire ถูกเรียกด้วยหน้าตาแบบ 404 ใช่ไหม
    expect(Swal.fire).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Holidays Not Found', // (แอบเห็น title แปลกๆ เดี๋ยวบอกวิธีแก้ด้านล่างครับ 😆)
        icon: 'warning',
      })
    );
    // ข้อมูลวันหยุดต้องคงค่า null ไว้เหมือนเดิม
    expect(result.current.holiday).toBeNull();
  });

  it('3. Should show error alert when connection error', async () => {
    // 🎯 จัดฉาก: ให้ API ตอบกลับมาว่าพังแบบเน็ตหลุด (ไม่มี response.status)
    const mockError = new Error('Network Error');
    vi.mocked(helperService.fetchHolidays).mockRejectedValue(mockError);

    const { result } = renderHook(() => useHolidays('2026', '2026'));

    await waitFor(() => {
      expect(result.current.isLoadingHoliday).toBe(false);
    });

    // ตรวจสอบว่า Swal.fire ถูกเรียกด้วยหน้าตาแบบ Connection Error ใช่ไหม
    expect(Swal.fire).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Connection Error',
        icon: 'error',
      })
    );
  });
});