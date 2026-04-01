import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
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
      // ✅ แลกโค้ดสำเร็จ ส่งไปหน้าเป้าหมาย
      return NextResponse.redirect(`${origin}${next}`)
    } else {
      // 🚨 ถ้าแลกโค้ดไม่ผ่าน (เช่น โค้ดถูกใช้ไปแล้วจากการโหลดเบิ้ล)
      // ให้ลองเช็คก่อนว่า เรามี Session อยู่แล้วหรือเปล่า?
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session) {
        // ถ้าระบบแอบล็อกอินให้แล้ว (Session มีอยู่จริง) ก็ให้ปล่อยผ่านไปเลย!
        return NextResponse.redirect(`${origin}${next}`)
      }

      // ถ้าไม่มี Session จริงๆ ให้พ่น Error ของ Supabase ออกมาที่ URL จะได้รู้ว่าพังเพราะอะไร
      console.error('Supabase Exchange Error:', error.message)
      return NextResponse.redirect(`${origin}/auth/error?error=${encodeURIComponent(error.message)}`)
    }
  }

  // ถ้าไม่มี code ส่งมาตั้งแต่แรก
  return NextResponse.redirect(`${origin}/auth/error?error=no-code-provided`)
}