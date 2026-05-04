import '@testing-library/jest-dom/vitest';

// 🌟 เพิ่มส่วนนี้เพื่อแก้ปัญหา ResizeObserver is not defined
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

window.ResizeObserver = ResizeObserverMock;