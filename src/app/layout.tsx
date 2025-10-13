import React from 'react'
import './globals.css'
import localFont from 'next/font/local'

const cadiz = localFont({
  src: [
    { path: './fonts/Cadiz-Regular.otf', weight: '400', style: 'normal' },
    { path: './fonts/Cadiz-RegularItalic.otf', weight: '400', style: 'italic' },
    { path: './fonts/Cadiz-Black.otf', weight: '900', style: 'normal' },
    { path: './fonts/Cadiz-BlackItalic.otf', weight: '900', style: 'italic' }
  ],
  variable: '--font-cadiz'
})
export const metadata = {
  title: 'Orchestra Sandbox',
  description: 'Build and play parts together with beat-aligned loops and tempo switching'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={cadiz.variable}>
      <body className={`${cadiz.className} min-h-svh text-gray-900`}>
        {children}
      </body>
    </html>
  )
}
