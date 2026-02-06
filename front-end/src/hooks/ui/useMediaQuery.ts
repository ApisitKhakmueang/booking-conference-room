import { useState, useEffect } from 'react';

// --- 1. Base Hook (ตัวเดิมของคุณ) ---
// ผมปรับปรุง dependency array นิดหน่อยเพื่อ performance ที่ดีขึ้น
export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    
    // Set ค่าครั้งแรกทันทีที่ Mount
    if (media.matches !== matches) {
      setMatches(media.matches);
    }

    const listener = () => setMatches(media.matches);
    
    // ใช้ addEventListener แบบ modern
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [query]); // ลบ 'matches' ออกจาก dependency เพื่อกันลูป (ถึงโค้ดคุณจะมี if กันไว้แล้วก็ตาม)

  return matches;
}

// --- 2. The Wrapper Hook (พระเอกของเรา) ---
export function useResponsive() {
  // กำหนด Breakpoints ตรงนี้ที่เดียว (แก้ง่ายในอนาคต)
  const isMobile  = useMediaQuery('(max-width: 425px)');
  const isTablet  = useMediaQuery('(min-width: 426px) and (max-width: 767px)');
  const isDesktop = useMediaQuery('(min-width: 768)');

  // แถม: เช็คแบบ "ใหญ่กว่า Mobile ขึ้นไป" (สำหรับเคสที่ Tablet กับ Desktop หน้าตาเหมือนกัน)
  const isTabletOrDesktop = useMediaQuery('(min-width: 768px)');

  return { 
    isMobile, 
    isTablet, 
    isDesktop,
    isTabletOrDesktop 
  };
}