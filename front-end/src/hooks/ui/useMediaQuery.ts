import { useState, useEffect } from 'react';

// --- 1. Base Hook (ตัวเดิมของคุณ) ---
// ผมปรับปรุง dependency array นิดหน่อยเพื่อ performance ที่ดีขึ้น
export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia(query).matches
  })

  useEffect(() => {
    const media = window.matchMedia(query)
    
    const listener = (e: MediaQueryListEvent) => setMatches(e.matches)
    media.addEventListener('change', listener)
    return () => media.removeEventListener('change', listener)
  }, [query])

  return matches
}

// --- 2. The Wrapper Hook (พระเอกของเรา) ---
export function useResponsive() {
  // กำหนด Breakpoints ตรงนี้ที่เดียว (แก้ง่ายในอนาคต)
  const isMobile = useMediaQuery('(max-width: 425px)');
  const isTablet = useMediaQuery('(min-width: 426px) and (max-width: 767px)');
  const isDesktop = useMediaQuery('(min-width: 768px)');

  return {
    isMobile,
    isTablet,
    isDesktop,
  };
}