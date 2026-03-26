// RUTA: app/dashboard/layout.tsx
import { auth }    from '@/auth'
import { redirect } from 'next/navigation'
import { Sidebar }  from '@/components/layout/sidebar'
import { ToastContainer } from '@/components/ui/toast'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session) redirect('/login')

  const u      = session.user as { nombre?: string; name?: string; rol?: string } | undefined
  const nombre = u?.nombre ?? u?.name ?? 'Usuario'
  const rol    = u?.rol    ?? 'USUARIO'

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: '#F5F5F5' }}>
      <Sidebar userName={nombre} userRol={rol} />
      <main className="flex-1 overflow-auto" style={{ marginLeft: '82px' }}>
        <div className="p-7 max-w-[1400px]">
          {children}
        </div>
      </main>
      <ToastContainer />
    </div>
  )
}