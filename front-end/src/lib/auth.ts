'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'

// 🌟 1. สมัครสมาชิก
export async function signUp(email: string, password: string) {
  const supabase = await createClient()
  const { error } = await supabase.auth.signUp({ email, password })
  
  // แปลง error เป็น string เพื่อให้ส่งกลับไปฝั่ง Client ได้อย่างปลอดภัย
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
  
  // บน Server ไม่มี window.location ต้องดึง origin จาก headers ของ request แทน
  const headersList = await headers()
  const origin = headersList.get('origin') || process.env.NEXT_PUBLIC_SITE_URL

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${origin}/auth/callback`,
    },
  })

  if (error) {
    return { error: error.message }
  }

  // 💡 จุดสำคัญ: บน Server การเรียก OAuth จะได้ URL กลับมา เราต้องสั่ง Redirect เอง
  if (data.url) {
    redirect(data.url)
  }
}

// 🌟 4. ลืมรหัสผ่าน
export async function forgotPassword(email: string) {
  const supabase = await createClient()
  const headersList = await headers()
  const origin = headersList.get('origin') || process.env.NEXT_PUBLIC_SITE_URL

  const { error } = await supabase.auth.resetPasswordForEmail(
    email,
    {
      // 🌟 เพิ่ม ?next=/auth/update-password ต่อท้าย URL
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