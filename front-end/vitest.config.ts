import { defineConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths' // 🌟 1. Import plugin เข้ามา

export default defineConfig({
  plugins: [tsconfigPaths()], // 🌟 2. เรียกใช้งาน Plugin ตรงนี้
  test: {
    environment: 'jsdom',
  },
})