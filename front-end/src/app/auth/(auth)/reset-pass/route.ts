import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  console.log('code: ', code)

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    console.log('error: ', error)
    if (!error) {
      // Login สำเร็จ → redirect ไป /dashboard ตรง ๆ
      return NextResponse.redirect(`${origin}/reset-password`)
    }
  }

  // 🔴 redirect ไปหน้าตั้งรหัสผ่าน
  return NextResponse.redirect(`${origin}/login`)
}
