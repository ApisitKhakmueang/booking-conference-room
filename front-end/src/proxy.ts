import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  const response = NextResponse.next()

  // สร้าง server-side Supabase client
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: () => {},
      },
    }
  )

  const {
    data: { session },
  } = await supabase.auth.getSession()

  const pathname = request.nextUrl.pathname

  const isAuthPage = pathname.startsWith('/login')
  const isVerifyPage = pathname.startsWith('/verify-email')
  const isRootPage = pathname === '/' // เพิ่มเงื่อนไขสำหรับหน้า root

  // ❌ ถ้าไม่มี session → redirect ไป /login
  if (!session && !isAuthPage) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // ✅ ถ้า session อยู่แล้ว → allow
  if (session) {
    // ถ้า user อยู่ login page หรือ root page → redirect ไป dashboard
    if (isAuthPage || isRootPage) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // ถ้ายังไม่ verify email → redirect ไป verify page
    if (!session.user.email_confirmed_at && !isVerifyPage)
      return NextResponse.redirect(new URL('/verify-email', request.url))

    // อยู่ dashboard หรือ verify page → return response
    return response
  }

  return response
}

// matcher: จะทำงานกับทุกหน้า ยกเว้น _next, favicon, auth/callback, auth/confirm
export const config = {
  matcher: ['/((?!_next|favicon.ico|auth/callback|auth/confirm).*)'],
}