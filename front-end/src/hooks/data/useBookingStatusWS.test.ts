// @vitest-environment jsdom
import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import useBookingStatusWS from './useBookingStatusWS';
import useWebSocket from 'react-use-websocket';

// 🌟 1. Mock Dependencies (สิ่งแวดล้อมที่ Hook ต้องใช้)
// 1.1 Mock useAuthStore เพื่อจำลองว่ามี Token แล้ว
vi.mock('@/stores/auth.store', () => ({
  useAuthStore: vi.fn((selector) => selector({ sessionToken: 'mock-token' })),
}));

// 1.2 Mock formatBookingEvent เพื่อให้คืนค่ากลับมาง่ายๆ ไม่ต้องใส่ข้อมูลให้ครบทุกฟิลด์
vi.mock('@/lib/form', () => ({
  formatBookingEvent: vi.fn((data) => ({ ...data, isFormatted: true })),
}));

// 1.3 Mock useWebSocket ของจริงทิ้งไป
vi.mock('react-use-websocket');

describe('useBookingStatusWS', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // ป้องกันปัญหาเรื่อง setInterval 30 วิ ใน Hook ทำเทสค้าง
    vi.useFakeTimers(); 
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // สร้างฟังก์ชันผู้ช่วยสำหรับจำลองข้อความที่ส่งมาจาก Backend
  const mockWebSocketMessage = (message: any) => {
    vi.mocked(useWebSocket).mockReturnValue({
      lastJsonMessage: message,
      sendMessage: vi.fn(),
      readyState: 1, // OPEN
    } as any);
  };

  it('1. Should get initial data and set isLoadingBooking to false', () => {
    // จัดฉาก: จำลองว่าเปิดมาปุ๊บ ได้รับข้อความ initial_data เลย
    mockWebSocketMessage({
      type: 'initial_data',
      data: [{ id: 'b1', title: 'Meeting A' }, { id: 'b2', title: 'Meeting B' }]
    });

    const { result } = renderHook(() => 
      useBookingStatusWS()
    );

    // ตรวจสอบ: ต้องมีข้อมูล 2 ตัว, ถูก format แล้ว, และ loading ต้องเป็น false
    expect(result.current.isLoadingBooking).toBe(false);
    expect(result.current.bookings).toHaveLength(2);
    expect(result.current.bookings[0]).toHaveProperty('isFormatted', true);
  });

  it('2. Should add new booking when received booking_start', () => {
    // Step 1: จำลองว่ามีข้อมูลตั้งต้น 1 ตัว
    mockWebSocketMessage({
      type: 'initial_data',
      data: [{ id: 'b1' }]
    });
    const { result, rerender } = renderHook(() => 
      useBookingStatusWS()
    );

    // Step 2: มีคนจองห้องเข้ามาใหม่ (ส่งข้อความ booking_start)
    mockWebSocketMessage({
      type: 'booking_start',
      data: { booking: { id: 'b2' } } // ข้อมูลห้องใหม่
    });
    
    // สั่งให้ Hook ทำงานซ้ำ (เหมือนการรับ Message ใหม่)
    rerender();

    // ตรวจสอบ: ข้อมูลต้องเพิ่มขึ้นเป็น 2 ตัว โดยมี id b2 อยู่ท้ายสุด
    expect(result.current.bookings).toHaveLength(2);
    expect(result.current.bookings[1].id).toBe('b2');
  });

  it('3. Should delete booking when received booking_end or booking_noshow', () => {
    mockWebSocketMessage({
      type: 'initial_data',
      data: [{ id: 'b1' }, { id: 'b2' }] // มี 2 รายการ
    });
    const { result, rerender } = renderHook(() => useBookingStatusWS());

    // ลบรายการที่ 1 ออก
    mockWebSocketMessage({
      type: 'booking_end',
      data: { booking: { id: 'b1' } } 
    });
    rerender();

    // ตรวจสอบ: ต้องเหลือแค่ b2 ตัวเดียว
    expect(result.current.bookings).toHaveLength(1);
    expect(result.current.bookings[0].id).toBe('b2');
  });
})

