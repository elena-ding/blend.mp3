// app/layout.tsx
import type { ReactNode } from 'react'
import './globals.css'

export const metadata = {
  title: 'blend.mp3',
  description: 'enter a song. unlock a whole new mood.',
}

export default function RootLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
