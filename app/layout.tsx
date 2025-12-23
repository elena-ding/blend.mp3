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
      <body>
        <div className="video-bg">
          <video
            autoPlay
            loop
            muted
            src="/assets/gradient-home.mp4"
          ></video>
        </div>
        <div style={{ position: 'relative', zIndex: 1 }}>
          {children}
        </div>
      </body>
    </html>
  )
}
