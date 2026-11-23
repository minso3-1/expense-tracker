import { NextRequest, NextResponse } from 'next/server'

const PROTECTED = ['/dashboard', '/expenses', '/categories']

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const hasSession = req.cookies.has('sessionId')

  if (PROTECTED.some((p) => pathname.startsWith(p)) && !hasSession) {
    return NextResponse.redirect(new URL('/login', req.url))
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/expenses/:path*', '/categories/:path*'],
}