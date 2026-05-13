// @vitest-environment jsdom
import { act, renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useBookingWebSocket } from './useBookingWebsocket'; // เปลี่ยน path ให้ตรงกับไฟล์จริง

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
let capturedOnMessage: ((event: { data: string }) => void) | null = null;

// 1.3 Mock useWebSocket แบบใหม่ (ดักจับ onMessage)
vi.mock('react-use-websocket', () => ({
  default: vi.fn((url, options) => {
    // แอบขโมยฟังก์ชัน onMessage ที่ Hook ส่งมา เก็บไว้ในตัวแปรของเรา
    if (options && options.onMessage) {
      capturedOnMessage = options.onMessage; 
    }
    return {
      sendMessage: vi.fn(),
      readyState: 1, // OPEN
    };
  }),
}));

describe('useBookingWebSocket', () => {
  
  beforeEach(() => {
    vi.clearAllMocks();
    capturedOnMessage = null;
    vi.useFakeTimers(); 
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // สร้างฟังก์ชันผู้ช่วยสำหรับจำลองข้อความที่ส่งมาจาก Backend
  const mockWebSocketMessage = (message: Record<string, unknown> | null) => {
    if (capturedOnMessage && message) {
      // ใช้ act() ครอบ เพื่อให้ React อัปเดต State ทันทีที่ยิง Event
      act(() => {
        // จำลอง Event ของ WebSocket โดยต้องแปลง Object เป็น String ก่อนส่ง
        capturedOnMessage!({ data: JSON.stringify(message) });
      });
    }
  };

  // --- เริ่มการทดสอบ ---

  it('1. Should get initial data and set isLoadingBooking to false', () => {
    // จัดฉาก: จำลองว่าเปิดมาปุ๊บ ได้รับข้อความ initial_data เลย
    const { result } = renderHook(() => 
      useBookingWebSocket(101, '2026-05-01', '2026-05-31')
    );

    mockWebSocketMessage({
      type: 'initial_data',
      data: [{ id: 'b1', title: 'Meeting A' }, { id: 'b2', title: 'Meeting B' }]
    });

    // ตรวจสอบ: ต้องมีข้อมูล 2 ตัว, ถูก format แล้ว, และ loading ต้องเป็น false
    expect(result.current.isLoadingBooking).toBe(false);
    expect(result.current.bookings).toHaveLength(2);
    expect(result.current.bookings[0]).toHaveProperty('isFormatted', true);
  });

  it('2. Should add new booking when received booking_created', () => {
    // Step 1: จำลองว่ามีข้อมูลตั้งต้น 1 ตัว
    const { result, rerender } = renderHook(() => 
      useBookingWebSocket(101, '2026-05-01', '2026-05-31')
    );
    mockWebSocketMessage({
      type: 'initial_data',
      data: [{ id: 'b1' }]
    });

    // Step 2: มีคนจองห้องเข้ามาใหม่ (ส่งข้อความ booking_created)
    mockWebSocketMessage({
      type: 'booking_created',
      data: { booking: { id: 'b2' } } // ข้อมูลห้องใหม่
    });
    
    // สั่งให้ Hook ทำงานซ้ำ (เหมือนการรับ Message ใหม่)
    rerender();

    // ตรวจสอบ: ข้อมูลต้องเพิ่มขึ้นเป็น 2 ตัว โดยมี id b2 อยู่ท้ายสุด
    expect(result.current.bookings).toHaveLength(2);
    expect(result.current.bookings[1].id).toBe('b2');
  });

  it('3. Should update booking when received booking_updated', () => {
    const { result, rerender } = renderHook(() => useBookingWebSocket(101, '2026-05-01', '2026-05-31'));
    mockWebSocketMessage({
      type: 'initial_data',
      data: [{ id: 'b1', title: 'Old Title' }]
    });

    // มีการแก้ชื่อการจอง (ส่งข้อความ booking_updated)
    mockWebSocketMessage({
      type: 'booking_updated',
      data: { booking: { id: 'b1', title: 'New Title' } } 
    });
    rerender();

    // ตรวจสอบ: จำนวนข้อมูลเท่าเดิม (1 ตัว) แต่ค่าข้างในเปลี่ยนไป
    expect(result.current.bookings).toHaveLength(1);
    expect(result.current.bookings[0].title).toBe('New Title');
  });

  it('4. Should delete booking when received booking_deleted or booking_end', () => {
    const { result, rerender } = renderHook(() => useBookingWebSocket(101, '2026-05-01', '2026-05-31'));
    mockWebSocketMessage({
      type: 'initial_data',
      data: [{ id: 'b1' }, { id: 'b2' }] // มี 2 รายการ
    });

    // ลบรายการที่ 1 ออก
    mockWebSocketMessage({
      type: 'booking_deleted',
      data: { booking: { id: 'b1' } } 
    });
    rerender();

    // ตรวจสอบ: ต้องเหลือแค่ b2 ตัวเดียว
    expect(result.current.bookings).toHaveLength(1);
    expect(result.current.bookings[0].id).toBe('b2');
  });

  it('5. Should set isLoadingBooking to true when change room number (Dependency changed)', () => {
    mockWebSocketMessage(null); // ยังไม่มีข้อความ
    
    const { result, rerender } = renderHook(
      ({ roomNumber }) => useBookingWebSocket(roomNumber, '2026-05-01', '2026-05-31'),
      { initialProps: { roomNumber: 101 } }
    );

    expect(result.current.isLoadingBooking).toBe(true);

    // จำลองการรับ initial_data โหลดเสร็จแล้ว
    mockWebSocketMessage({ type: 'initial_data', data: [] });
    rerender({ roomNumber: 101 });
    expect(result.current.isLoadingBooking).toBe(false);

    // 🌟 คาดหวังว่า: ถ้าเปลี่ยนห้องเป็น 102 ต้องกลับไป Loading = true
    mockWebSocketMessage(null); // รีเซ็ตข้อความ
    rerender({ roomNumber: 102 }); 
    
    expect(result.current.isLoadingBooking).toBe(true);
  });

});