import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'url' // 🌟 1. Import ตัวช่วยจัดการ Path

export default defineConfig({
  plugins: [react()], // 🌟 2. เรียกใช้งาน Plugin ตรงนี้
  resolve: {
    // 🌟 2. สอนให้ Vitest รู้จักว่า @ คือโฟลเดอร์ src
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  test: {
    globals: true, // 🌟 สำคัญมาก ต้องเปิดเป็น true
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'], // 👈 ชี้ไปที่ไฟล์ที่เราสร้างในข้อ 2
  },
})