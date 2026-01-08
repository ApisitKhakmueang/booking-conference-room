import type { NextRequest } from 'next/server'
import { updateSession } from './lib/supabase/proxy'

export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

// matcher: จะทำงานกับทุกหน้า ยกเว้น _next, favicon, auth/callback, auth/confirm
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|logo|.*\\.(?:svg|png|jpg|jpeg|webp|ico)$|auth/callback|auth/confirm|auth/reset-pass).*)',
  ],
};
