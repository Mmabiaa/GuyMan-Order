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
         * Match all request paths except for the ones starting with:
         * - login
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - manifest.json
         * - favicon.ico
         * - icon-*.png
         * - sw.js
         * - workbox-*.js
         */
        '/((?!login|api|_next/static|_next/image|manifest.json|favicon.ico|icon-|sw.js|workbox-).*)',
    ],
}
