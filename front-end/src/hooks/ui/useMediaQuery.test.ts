// @vitest-environment jsdom
import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { useMediaQuery, useResponsive } from './useMediaQuery'; // แก้ path ให้ตรงกับไฟล์จริง

// 🌟 1. พระเอกของงาน: ฟังก์ชันสำหรับจำลองหน้าจอ
// เราจะส่ง 'ขนาดหน้าจอจำลอง' เข้าไป เพื่อให้ matchMedia คืนค่า true เฉพาะตอนที่เงื่อนไขตรงกัน
const mockScreenSize = (expectedQuery: string) => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
      matches: query === expectedQuery, // จะเป็น true ถ้า query ตรงกับที่จำลองไว้
      media: query,
      onchange: null,
      addEventListener: vi.fn(), // จำลอง event listener เปล่าๆ ไม่ให้โค้ดพัง
      removeEventListener: vi.fn(),
    })),
  });
};

describe('Responsive Hooks', () => {
  
  // ล้างค่า Mock ทิ้งทุกครั้งหลังรันแต่ละเทสเสร็จ เพื่อไม่ให้มันตีกัน
  afterEach(() => {
    vi.clearAllMocks();
  });

  // --- เทส Base Hook ---
  describe('useMediaQuery()', () => {
    it('1. Should return true if the screen size matches the query', () => {
      // จำลองว่าตอนนี้หน้าจอตรงกับเงื่อนไขนี้
      mockScreenSize('(max-width: 425px)'); 
      
      const { result } = renderHook(() => useMediaQuery('(max-width: 425px)'));
      expect(result.current).toBe(true);
    });

    it('2. Should return false if the screen size not matches the query', () => {
      // จำลองว่าหน้าจอเป็นแบบอื่น
      mockScreenSize('(min-width: 1024px)'); 
      
      const { result } = renderHook(() => useMediaQuery('(max-width: 425px)'));
      expect(result.current).toBe(false);
    });
  });

  // --- เทส Wrapper Hook ---
  describe('useResponsive()', () => {
    it('1. Should return isMobile is true', () => {
      // จำลองว่าหน้าจอเป็น Mobile
      mockScreenSize('(max-width: 425px)');
      
      const { result } = renderHook(() => useResponsive());

      expect(result.current.isMobile).toBe(true);
      expect(result.current.isTablet).toBe(false);
      expect(result.current.isDesktop).toBe(false);
    });

    it('2. Should return isTablet is true', () => {
      // จำลองว่าหน้าจอเป็น Tablet
      mockScreenSize('(min-width: 426px) and (max-width: 767px)');
      
      const { result } = renderHook(() => useResponsive());

      expect(result.current.isMobile).toBe(false);
      expect(result.current.isTablet).toBe(true); // ต้องเป็น true แค่ตัวเดียว
      expect(result.current.isDesktop).toBe(false);
    });

    it('3. Should return isDesktop is true', () => {
      // จำลองว่าหน้าจอเป็น Desktop
      mockScreenSize('(min-width: 768px)');
      
      const { result } = renderHook(() => useResponsive());

      expect(result.current.isMobile).toBe(false);
      expect(result.current.isTablet).toBe(false);
      expect(result.current.isDesktop).toBe(true);
    });
  });
});