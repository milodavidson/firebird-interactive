import React from 'react'
export const metadata = {
  title: 'Interactive Listening Map',
  description: 'Beat-aligned multi-part playback with tempo switching'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif' }}>{children}</body>
    </html>
  )
}
