// RUTA: app/layout.tsx
import type { Metadata } from 'next'
import { NextAuthSessionProvider } from '@/components/layout/session-provider'
import './globals.css'

export const metadata: Metadata = {
  title: 'ITQ Horarios',
  description: 'Sistema Generador de Horarios - Instituto Superior Tecnologico Quito',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="bg-surface-page dark:bg-surface-dark text-canvas-text dark:text-gray-100 antialiased">
        <NextAuthSessionProvider>{children}</NextAuthSessionProvider>
      </body>
    </html>
  )
}