import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
  // 🌟 1. ดึงมาแค่ searchParams ส่วน origin ให้ลบทิ้งไปจากการดึงใน request.url
  const { searchParams } = new URL(request.url)
  
  // 🌟 2. ประกาศตัวแปร origin ใหม่ โดยดึงจาก .env ชี้เป้าไปที่โดเมนจริงแบบหักดิบ!
  const origin = process.env.NEXT_PUBLIC_SITE_URL

  const code = searchParams.get('code')
  let next = searchParams.get('next') ?? '/dashboard'

  // จัดการรูปแบบ URL ให้ปลอดภัย (ป้องกัน Redirect ผิดที่)
  if (!next.startsWith('/')) {
    next = '/'
  }

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // ✅ แลกโค้ดสำเร็จ ส่งไปหน้าเป้าหมาย (ด้วย origin จาก .env)
      return NextResponse.redirect(`${origin}${next}`)
    } else {
      // 🚨 ถ้าแลกโค้ดไม่ผ่าน
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session) {
        // ถ้าระบบแอบล็อกอินให้แล้ว
        return NextResponse.redirect(`${origin}${next}`)
      }

      // ถ้าไม่มี Session จริงๆ
      console.error('Supabase Exchange Error:', error.message)
      return NextResponse.redirect(`${origin}/auth/error?error=${encodeURIComponent(error.message)}`)
    }
  }

  // ถ้าไม่มี code ส่งมาตั้งแต่แรก
  return NextResponse.redirect(`${origin}/auth/error?error=no-code-provided`)
}