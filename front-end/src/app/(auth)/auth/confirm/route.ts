import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  const token = searchParams.get('token')
  const type = searchParams.get('type')
  const email = searchParams.get('email')

  if (!token || !type || !email) {
    return NextResponse.redirect(
      new URL('/login?error=invalid_link', request.url)
    )
  }

  const response = NextResponse.redirect(
    new URL('/dashboard', request.url)
  )

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookies) => {
          cookies.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: type as 'signup',
  })

  if (error) {
    return NextResponse.redirect(
      new URL('/login?error=verify_failed', request.url)
    )
  }

  return response
}
