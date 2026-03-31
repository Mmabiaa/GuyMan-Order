'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function loginUser(prevState: any, formData: FormData) {
    const username = formData.get('username')
    const password = formData.get('password')

    if (!username || !password) {
        return { error: 'Invalid username or password' }
    }

    const backendBaseUrl =
        process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:4000'

    const res = await fetch(`${backendBaseUrl}/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    })

    if (!res.ok) {
        return { error: 'Invalid username or password' }
    }

    const setCookie = res.headers.get('set-cookie') ?? ''
    const match = setCookie.match(/auth-token=([^;]+)/)
    const token = match?.[1]

    if (!token) {
        return { error: 'Login failed (missing auth token)' }
    }

    const cookieStore = await cookies()
    cookieStore.set('auth-token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/'
    })

    redirect('/')
}
