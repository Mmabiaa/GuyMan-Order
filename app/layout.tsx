import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import { ClearStaleServiceWorker } from '@/components/clear-service-worker'
import './globals.css'

// Avoid next/font/google here: `next build` fetches fonts from Google at build time and fails
// when the build environment has no outbound access to fonts.googleapis.com (offline, firewall, CI).

export const metadata: Metadata = {
  title: 'GuyMan Food Order System',
  description: 'Manage food delivery orders',
  generator: 'Mmabiaa',
  manifest: '/manifest.json',
  themeColor: '#1a1a1a',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'FD Admin',
  },
  icons: {
    icon: [
      { url: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: '/icon-192x192.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <ClearStaleServiceWorker />
        {children}
        <Analytics />
      </body>
    </html>
  )
}
