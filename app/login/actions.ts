'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function loginUser(prevState: any, formData: FormData) {
    const username = formData.get('username')
    const password = formData.get('password')

    if (username === 'admin' && password === 'Admin@123.') {
        const cookieStore = await cookies()
        cookieStore.set('auth-token', 'admin-token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/'
        })

        redirect('/')
    } else {
        return {
            error: 'Invalid username or password'
        }
    }
}
