import type { Metadata } from 'next'
import '@copilotkit/react-core/v2/styles.css'
import '../src/styles/global.css'
import '../src/styles/app.css'

export const metadata: Metadata = {
  title: 'Atlas Travel',
  description: 'Fictional corporate travel planning demonstration.',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>
}
