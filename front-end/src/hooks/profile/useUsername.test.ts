import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useUsername } from './useUsername'; // เปลี่ยน path ให้ตรงกับของคุณ

describe('useUsername Hook', () => {
  it('1. Should can init name', () => {
    const { result } = renderHook(() => useUsername('Apisit'));
    expect(result.current.username).toBe('Apisit');
  });

  it('2. Should can change username ', () => {
    const { result } = renderHook(() => useUsername('Apisit'));

    // 🌟 ถ้าจะรันฟังก์ชันที่ทำให้ State เปลี่ยน ต้องครอบด้วย act() เสมอ!
    act(() => {
      result.current.changeUsername('Guy');
    });

    expect(result.current.username).toBe('Guy');
  });

  it('3. Should can cancel change username', () => {
    const { result } = renderHook(() => useUsername('Apisit'));

    act(() => {
      result.current.changeUsername('Guy');
    });
    
    act(() => {
      result.current.cancelUsername();
    });

    expect(result.current.username).toBe('Apisit');
  });

});