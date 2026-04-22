import { hasEnvVars } from "@/lib/utils";
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  // If the env vars are not set, skip proxy check. You can remove this
  // once you setup the project.
  if (!hasEnvVars) {
    return supabaseResponse;
  }

  // With Fluid compute, don't put this client in a global environment
  // variable. Always create a new one on each request.
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Do not run code between createServerClient and
  // supabase.auth.getClaims(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  // IMPORTANT: If you remove getClaims() and you use server-side rendering
  // with the Supabase client, your users may be randomly logged out.
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;

  const userStatus = user?.app_metadata?.status;
  const userRole = user?.app_metadata?.role

  // redirect root
  if (request.nextUrl.pathname === "/") {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/sign-in";
    return NextResponse.redirect(url);
  }

  // not login + no user
  if (
    !user &&
    !request.nextUrl.pathname.startsWith("/auth")
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/sign-in";
    return NextResponse.redirect(url);
  }

  if (user && userStatus === 'inactive') {
    // ปล่อยให้เข้าได้แค่หน้า /suspended และหน้า /auth (เผื่อให้เขากด Sign Out ได้)
    if (
      !request.nextUrl.pathname.startsWith("/suspended") && 
      !request.nextUrl.pathname.startsWith("/auth")
    ) {
      const url = request.nextUrl.clone();
      url.pathname = "/suspended"; // เตะไปหน้าแจ้งเตือนโดนแบน
      return NextResponse.redirect(url);
    }
  }

  // logged in แต่เข้า auth page
  if (user && request.nextUrl.pathname.startsWith("/auth")) {
    if (
      request.nextUrl.pathname.startsWith("/auth/update-password") ||
      request.nextUrl.pathname.startsWith("/auth/callback")
    ) {
      return supabaseResponse; 
    }

    // 🌟 ถ้าโดนแบนอยู่ แล้วพยายามมาหน้า auth ให้เตะไป suspended แทนที่จะเป็น dashboard
    const url = request.nextUrl.clone();
    url.pathname = userStatus === 'inactive' ? "/suspended" : "/dashboard";
    return NextResponse.redirect(url);
  }

  if ((
      request.nextUrl.pathname.startsWith("/room-management") ||
      request.nextUrl.pathname.startsWith("/user-management") ||
      request.nextUrl.pathname.startsWith("/system-config")
    ) && userRole === 'user'
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }


  // IMPORTANT: You *must* return the supabaseResponse object as it is.
  // If you're creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!

  return supabaseResponse;
}
