import { prisma } from '@/lib/db'
import { HorariosSelector } from './horarios-selector'

export default async function HorariosPage() {
  const [periodos, carreras] = await Promise.all([
    prisma.periodoAcademico.findMany({
      where: { activo: true },
      include: { modulos: { orderBy: { numero: 'asc' } } },
      orderBy: [{ anio: 'desc' }, { numero: 'desc' }],
    }),
    prisma.carrera.findMany({ where: { activo: true }, orderBy: { nombre: 'asc' } }),
  ])

  // Sedes activas derivadas de NivelParalelo
  const sedesRaw = await prisma.nivelParalelo.findMany({
    where: { activo: true, periodo: { activo: true } },
    select: { sede: true, jornada: true },
    distinct: ['sede', 'jornada'],
  })

  const sedes = sedesRaw.map(s => ({ sede: s.sede, jornada: s.jornada as string }))

  return (
    <div>
      <h1 style={{ fontSize: '22px', fontWeight: 400, color: '#2D3B45', marginBottom: '24px' }}>Horarios</h1>
      <HorariosSelector periodos={periodos} carreras={carreras} sedes={sedes} />
    </div>
  )
}
