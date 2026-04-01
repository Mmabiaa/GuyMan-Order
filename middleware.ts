import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    const token = request.cookies.get('auth-token')?.value

    if (!token) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        /*
         * Match all request paths except login, API routes, and Next/static assets.
         */
        '/((?!login|api|_next/static|_next/image|manifest.json|favicon.ico|icon-|sw\\.js).*)',
    ],
}
