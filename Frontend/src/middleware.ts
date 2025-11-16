import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Paths that require authentication (prefix match)
const PROTECTED_PATHS = ['/dashboard', '/complete-profile', '/ai-interviewer']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if the requested path is protected
  const requiresAuth = PROTECTED_PATHS.some((path) => pathname.startsWith(path))

  if (!requiresAuth) {
    return NextResponse.next()
  }

  const token = request.cookies.get('authToken')?.value

  // If no token, redirect to login page
  if (!token) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname) // optional return path
    return NextResponse.redirect(loginUrl)
  }

  // TODO: Optionally verify token signature / expiry here

  return NextResponse.next()
}

// Apply middleware to all routes by default (fine-tuned inside the function)
export const config = {
  matcher: '/:path*',
}
