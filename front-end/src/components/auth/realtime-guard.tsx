'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'

export default function RealtimeGuard({ userId }: { userId?: string }) {
  const router = useRouter()

  useEffect(() => {
    if (!userId) return;

    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
    )

    // 🌟 สร้างท่อดักฟังการเปลี่ยนแปลง (Subscribe)
    const channel = supabase
      .channel('user-status-listener')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE', // ฟังเฉพาะตอนมีการ Update
          schema: 'public',
          table: 'users',
          filter: `id=eq.${userId}`, // ฟังเฉพาะแถวที่เป็นของ User คนนี้เท่านั้น!
        },
        async (payload) => {
          // ถ้าสถานะใหม่ถูกเปลี่ยนเป็น inactive
          if (payload.new.status === 'inactive') {
            
            // 1. บังคับให้ Supabase ดึง JWT Token ใบใหม่ (ซึ่งจะมี status: inactive ฝังมาด้วย)
            await supabase.auth.refreshSession();
            
            // 2. เตะไปหน้า suspended ทันที
            router.push('/suspended');
            
            // 3. รีเฟรชหน้าต่างเพื่อให้ Middleware ทำงานรอบใหม่ด้วย Token ใบใหม่
            router.refresh();
          }
        }
      )
      .subscribe()

    // คืนค่า Memory เมื่อเปลี่ยนหน้าหรือปิดเว็บ
    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, router])

  return null // ไม่ต้องแสดงผลอะไรบนหน้าจอ
}