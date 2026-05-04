import { defineConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths' // 🌟 1. Import plugin เข้ามา

export default defineConfig({
  plugins: [tsconfigPaths()], // 🌟 2. เรียกใช้งาน Plugin ตรงนี้
  test: {
    globals: true, // 🌟 สำคัญมาก ต้องเปิดเป็น true
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'], // 👈 ชี้ไปที่ไฟล์ที่เราสร้างในข้อ 2
  },
})