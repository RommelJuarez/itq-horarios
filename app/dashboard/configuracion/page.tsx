import { prisma } from '@/lib/db'
import { getPermisos } from '@/lib/auth-utils'
import { ConfiguracionTabs } from './configuracion-tabs'

export default async function ConfiguracionPage() {
  const { canEdit, isAdmin } = await getPermisos()

  const [periodos, carreras, usuarios] = await Promise.all([
    prisma.periodoAcademico.findMany({
      where: { activo: true },
      include: {
        nivelesParalelos: {
          orderBy: [{ nivel: 'asc' }, { jornada: 'asc' }, { sede: 'asc' }, { paralelo: 'asc' }],
        },
      },
      orderBy: [{ anio: 'desc' }, { numero: 'desc' }],
    }),
    prisma.carrera.findMany({ where: { activo: true }, orderBy: { nombre: 'asc' } }),
    isAdmin
      ? prisma.usuario.findMany({ orderBy: { nombre: 'asc' }, select: { id: true, nombre: true, email: true, rol: true, activo: true } })
      : Promise.resolve([]),
  ])

  return (
    <div>
      <h1 style={{ fontSize: '22px', fontWeight: 400, color: '#2D3B45', marginBottom: '24px' }}>Configuración</h1>
      <ConfiguracionTabs
        periodos={periodos}
        carreras={carreras}
        canEdit={canEdit}
        isAdmin={isAdmin}
        usuarios={usuarios}
      />
    </div>
  )
}
