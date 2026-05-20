import { NextResponse, type NextRequest } from 'next/server'
import { verifyJWT } from '@/utils/jwt'

export async function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get('session')
  let user = null

  if (sessionCookie) {
    user = await verifyJWT(sessionCookie.value)
  }

  const { pathname } = request.nextUrl
  const isLoginPage = pathname === '/login'
  const isAuthApi = pathname.startsWith('/api/auth')
  const isUploadApi = pathname.startsWith('/api/upload')
  const isDbApi = pathname.startsWith('/api/db')

  // Allow API routes to be reached directly
  if (isAuthApi || isUploadApi || isDbApi) {
    return NextResponse.next()
  }

  if (!user && !isLoginPage) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  if (user && isLoginPage) {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - uploads folder (media folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|uploads|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
