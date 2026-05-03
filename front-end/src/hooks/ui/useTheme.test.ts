import { describe, it, expect } from "vitest";
import useTheme from "./useTheme";
import { renderHook, act } from "@testing-library/react";

describe('useTheme', () => {
  it('1. Should return correct theme', () => {
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe('dark');
  });

  it('2. Should can change theme', () => {
    const { result } = renderHook(() => useTheme());
    act(() => {
      result.current.toggle();
    });
    expect(result.current.theme).toBe('light');
  });
});