import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Public website readers are anonymous and do not require Supabase auth checks.
  // Returning next() directly bypasses any missing API credentials and speeds up loading!
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
