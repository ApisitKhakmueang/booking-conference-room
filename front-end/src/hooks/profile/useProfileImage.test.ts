import { describe, it, expect } from "vitest";
import { useProfileImage } from "./useProfileImage";
import { renderHook, act } from "@testing-library/react";
import { ChangeEvent } from "react";

describe('useProfileImage', () => {
  it('1. Should return correct profile image', () => {
    const { result } = renderHook(() => useProfileImage('/user/profile.jpg'));
    expect(result.current.previewProfile).toBe('/user/profile.jpg');
  });

  it('2. Should can change profile image', () => {
    const { result } = renderHook(() => useProfileImage());

    // 1. จำลองไฟล์ภาพ
    const mockFile = new File(['dummy content'], 'profile.png', { type: 'image/png' });

    // 2. สร้าง Mock Event และใช้ท่า as unknown as ChangeEvent 🌟
    const mockEvent = {
      target: { files: [mockFile] }
    } as unknown as ChangeEvent<HTMLInputElement>; 

    // 3. โยนเข้าไปในฟังก์ชัน 
    act(() => {
      result.current.changeProfile(mockEvent); 
    });

    // 4. เช็คผลลัพธ์
    expect(result.current.profileFile).toBe(mockFile); // หรือเช็ค state ของคุณ
  });

  it('3. Should can cancel change profile image', () => {
    const { result } = renderHook(() => useProfileImage('/user/profile.jpg'));
    const mockFile = new File(['dummy content'], 'profile.png', { type: 'image/png' });

    // 2. สร้าง Mock Event และใช้ท่า as unknown as ChangeEvent 🌟
    const mockEvent = {
      target: { files: [mockFile] }
    } as unknown as ChangeEvent<HTMLInputElement>; 

    // 3. โยนเข้าไปในฟังก์ชัน 
    act(() => {
      result.current.changeProfile(mockEvent); 
      result.current.cancelImage();
    });
    expect(result.current.previewProfile).toBe('/user/profile.jpg');
  });

})