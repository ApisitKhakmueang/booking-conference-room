import { describe, it, expect } from 'vitest';
import { BookingStatus, DisplayRooms } from './booking-status';
import { RoomResponse, BookingEventResponse } from '@/utils/interface/response';

describe('booking-status.ts', () => {
  
  // 🌟 1. สร้าง Mock Data จำลองข้อมูลเสมือนจริงเตรียมไว้
  const mockRooms: RoomResponse[] = [
    { id: '1', name: 'Room A', roomNumber: 101, location: 'Thailand', capacity: 10, status: 'available' },
    { id: '2', name: 'Room B', roomNumber: 102, location: 'Thailand', capacity: 5, status: 'available' },
    { id: '3', name: 'Room C', roomNumber: 103, location: 'Thailand', capacity: 20, status: 'maintenance' },
  ];

  const mockBookings: BookingEventResponse[] = [
    // 🟢 เคสที่ 1: การจองที่ได้รับการยืนยันแล้ว (Confirm)
    { 
      id: 'b1', 
      title: 'Monthly Team Meeting',
      startTime: '2026-05-02T09:00:00Z', // เริ่ม 9 โมงเช้า (UTC)
      endTime: '2026-05-02T11:00:00Z',   // จบ 11 โมงเช้า
      passcode: '1234',
      status: 'confirm', 
      User: {
        id: 'u1',
        email: 'guy.apisit2546@gmail.com',
        fullName: 'Apisit Khakmueang',
        avatarUrl: 'https://ui-avatars.com/api/?name=Apisit+K',
        role: 'admin',
        status: 'active'
      },
      Room: { 
        id: '1', 
        name: 'Room A', 
        roomNumber: 101, 
        location: 'Floor 1, Building A', 
        capacity: 10, 
        status: 'available' 
      } 
    },
    
    // 🟡 เคสที่ 2: การจองที่รอการตรวจสอบ (Pending) หรือเพิ่งจองเข้ามา
    { 
      id: 'b2', 
      title: 'Client Pitching',
      startTime: '2026-05-02T13:00:00Z',
      endTime: '2026-05-02T15:00:00Z',
      passcode: '5678',
      status: 'pending', 
      User: {
        id: 'u2',
        email: 'waruneethr@gmail.com',
        fullName: 'Warunee Thr',
        role: 'user',
        status: 'active' // ไม่มี avatarUrl ก็ได้ เพราะใน Interface ใส่ ? ไว้
      },
      Room: { 
        id: '2', 
        name: 'Room B', 
        roomNumber: 102, 
        location: 'Floor 1, Building A', 
        capacity: 5, 
        status: 'available' 
      } 
    },

    // 🔴 เคสที่ 3: การจองที่ถูกยกเลิก (Cancelled)
    { 
      id: 'b3', 
      title: 'System Design Interview',
      startTime: '2026-05-03T10:00:00Z',
      endTime: '2026-05-03T11:30:00Z',
      passcode: '9999',
      status: 'cancelled', 
      User: {
        id: 'u1', // ยืม User 1 มาใช้
        email: 'guy.apisit2546@gmail.com',
        fullName: 'Apisit Khakmueang',
        role: 'admin',
        status: 'active'
      },
      Room: { 
        id: '3', 
        name: 'Executive Boardroom', 
        roomNumber: 201, 
        location: 'Floor 2, Building B', 
        capacity: 20, 
        status: 'maintenance' // ห้องอาจจะปิดปรับปรุงอยู่
      } 
    }
  ];

  // ---------------------------------------------------------
  // 🌟 เทสฟังก์ชันที่ 1: DisplayRooms (อัปเดตสถานะห้องจากการจอง)
  // ---------------------------------------------------------
  describe('DisplayRooms()', () => {
    
    it('1. Status should be changed to occupied if the room is being booked (has in bookings)', () => {
      const result = DisplayRooms(mockRooms, mockBookings);

      const roomA = result.find(r => r.id === '1');
      expect(roomA?.status).toBe('occupied');
    });

    it('2. Status should remain available if the room is not being booked', () => {
      const result = DisplayRooms(mockRooms, mockBookings);

      const roomB = result.find(r => r.id === '2');
      expect(roomB?.status).toBe('available');
    });

    it('3. Should return an empty array or handle gracefully if rooms is undefined', () => {
      const result = DisplayRooms(undefined, mockBookings);
      expect(result).toEqual([]); // คาดหวังว่าไม่พัง และคืนค่าเป็น []
    }); 
  });

  // ---------------------------------------------------------
  // 🌟 เทสฟังก์ชันที่ 2: BookingStatus (สรุปจำนวนสถานะห้อง)
  // ---------------------------------------------------------
  describe('BookingStatus()', () => {
    
    it('1. Should count correctly the number of each status', () => {
      const activeRooms = [
        { status: 'occupied' }, // 1 ห้อง
        { status: 'available' }, // 2 ห้อง
        { status: 'available' },
        { status: 'maintenance' } // 1 ห้อง
      ] as RoomResponse[];

      const result = BookingStatus(activeRooms);

      // Assert: คาดหวังว่าต้องนับเลขได้ตรง
      // (อันนี้ขึ้นอยู่กับว่าฟังก์ชันคุณ return หน้าตาแบบไหน สมมติว่าเป็น Object)
      expect(result).toEqual([
        { name: 'Total', amount: 4, variant: 'purple' },
        { name: 'Available', amount: 2, variant: 'purple' },
        { name: 'Occupied', amount: 1, variant: 'purple' },
        { name: 'Maintainance', amount: 1, variant: 'purple' },
      ]);
    });

  });
});