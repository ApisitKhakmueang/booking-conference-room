'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

// 🌟 สร้างฟังก์ชันเช็คสภาพแวดล้อม (เพิ่มไว้บนสุดของไฟล์)
const getSiteUrl = () => {
  // ถ้ากำลังรันโค้ดด้วย npm run dev บนเครื่องตัวเอง
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:3000';
  }
  // ถ้ากำลังรันบน Docker (EC2) หรือ Vercel
  return process.env.NEXT_PUBLIC_SITE_URL || 'https://guyae-booking.duckdns.org';
}

// 🌟 1. สมัครสมาชิก
export async function signUp(email: string, password: string) {
  const supabase = await createClient()
  const { error } = await supabase.auth.signUp({ email, password })
  return { error: error?.message || null }
}

// 🌟 2. เข้าสู่ระบบ (Email/Password)
export async function signIn(email: string, password: string) {
  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  return { error: error?.message || null }
}

// 🌟 3. เข้าสู่ระบบด้วย Google (OAuth)
export async function signInWithGoogle() {
  const supabase = await createClient()
  
  // เรียกใช้ฟังก์ชันที่เราสร้างไว้ จะได้โดเมนที่เป๊ะ 100% เสมอ
  const origin = getSiteUrl()

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${origin}/auth/callback`,
    },
  })

  if (error) {
    return { error: error.message }
  }

  if (data.url) {
    redirect(data.url)
  }
}

// 🌟 4. ลืมรหัสผ่าน
export async function forgotPassword(email: string) {
  const supabase = await createClient()
  
  // อัปเดตตรงนี้ให้ใช้ getSiteUrl() เหมือนกันครับ
  const origin = getSiteUrl()

  const { error } = await supabase.auth.resetPasswordForEmail(
    email,
    {
      redirectTo: `${origin}/auth/callback?next=/auth/update-password`,
    }
  )

  return { error: error?.message || null }
}

// 🌟 5. ตั้งรหัสผ่านใหม่
export async function updatePassword(newPassword: string) {
  const supabase = await createClient()
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  })
  
  return { error: error?.message || null }
}

// 🌟 6. ออกจากระบบ (รวมมาไว้ที่นี่เลย)
export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut({ scope: 'local' }) // ออกเฉพาะเครื่องนี้
  
  redirect('/auth/sign-in')
}