import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import { HorarioDndWrapper } from '@/components/horarios/horario-dnd-wrapper'
import { ExportButton } from '@/components/horarios/export-button'
import { getCanEdit } from '@/lib/auth-utils'
import Link from 'next/link'

interface Props {
  params: { moduloId: string }
  searchParams: { carreraId?: string; jornada?: string; sede?: string }
}

const MOD_COLORS: Record<number, string> = { 1: '#CC0000', 2: '#0374B5', 3: '#0B874B' }

function fmt(d: Date) {
  return d.toLocaleDateString('es-EC', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default async function HorarioModuloPage({ params, searchParams }: Props) {
  const [canEdit, moduloId] = [await getCanEdit(), parseInt(params.moduloId)]
  const carreraId = parseInt(searchParams.carreraId ?? '0')
  const jornada = (searchParams.jornada ?? 'MATUTINA') as 'MATUTINA' | 'NOCTURNA'
  const sede = searchParams.sede ?? 'QUITO'

  if (isNaN(moduloId) || isNaN(carreraId) || carreraId === 0) notFound()

  // ── Obtener el módulo primero (necesitamos periodoId) ────────────────────
  const modulo = await prisma.modulo.findUnique({
    where: { id: moduloId },
    include: { periodo: true },
  })

  if (!modulo) notFound()

  // ── Resto de queries en una sola transacción (1 conexión) ───────────────
  const [nivelParalelosReal, asignacionesRaw, todosModulosReal, asignaturas, docentes] =
    await prisma.$transaction([
      prisma.nivelParalelo.findMany({
        where: { periodoId: modulo.periodoId, carreraId, jornada, sede, activo: true },
        orderBy: [{ nivel: 'asc' }, { paralelo: 'asc' }],
      }),

      prisma.asignacion.findMany({
        where: { moduloId },
        include: {
          asignatura: { select: { id: true, nombre: true, nivel: true } },
          docente: { select: { id: true, nombre: true, tipo: true } },
        },
      }),

      prisma.modulo.findMany({
        where: { periodoId: modulo.periodoId },
        orderBy: { numero: 'asc' },
        include: {
          asignaciones: {
            include: {
              docente: { select: { id: true, nombre: true, tipo: true, horasMin: true, horasMax: true } },
              nivelParalelo: { select: { jornada: true } },
              asignatura: { select: { nombre: true } },
            },
          },
        },
      }),

      prisma.asignatura.findMany({
        where: { carreraId, activo: true },
        orderBy: [{ nivel: 'asc' }, { nombre: 'asc' }],
        select: { id: true, nombre: true, nivel: true, codigo: true },
      }),

      prisma.docente.findMany({
        where: { activo: true },
        orderBy: { nombre: 'asc' },
        select: { id: true, nombre: true, tipo: true },
      }),
    ])

  const color = MOD_COLORS[modulo.numero] ?? '#CC0000'
  const totalAsig = asignacionesRaw.length
  const confirmadas = asignacionesRaw.filter(a => a.estado === 'CONFIRMADO').length
  const sinDocente = asignacionesRaw.filter(a => !a.docenteId).length

  const asignacionesData = asignacionesRaw.map(a => ({
    id: a.id,
    nivelParaleloId: a.nivelParaleloId,
    horario: a.horario,
    estado: a.estado as 'PENDIENTE' | 'ASIGNADO' | 'CONFIRMADO',
    asignatura: a.asignatura,
    docente: a.docente,
    asignaturaId: a.asignaturaId,
    moduloId: a.moduloId,
  }))

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 20, borderBottom: '1px solid #DDD', paddingBottom: 16 }}>
        <div className="flex items-center gap-2 mb-2">
          <Link href="/dashboard/horarios" style={{ fontSize: 12, color: '#8B969D' }}>← Horarios</Link>
          <span style={{ color: '#C7CDD1' }}>/</span>
          <span style={{ fontSize: 12, color: '#556572' }}>{modulo.nombre}</span>
        </div>
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-3">
            <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: color, flexShrink: 0 }} />
            <h1 style={{ fontSize: 20, fontWeight: 400, color: '#2D3B45' }}>
              {modulo.nombre} — {sede} {jornada === 'MATUTINA' ? 'Matutina' : 'Nocturna'}
            </h1>
          </div>
          <ExportButton
            periodoId={modulo.periodoId}
            carreraId={carreraId}
            jornada={jornada}
            sede={sede}
            label="Exportar período completo"
          />
        </div>
        <p style={{ fontSize: 12, color: '#8B969D' }}>
          {modulo.periodo.nombre} · {fmt(modulo.fechaInicio)} → {fmt(modulo.fechaFin)} ·
          {jornada === 'MATUTINA' ? ` ${modulo.horasMatutino}h mat` : ` ${modulo.horasNocturno}h noc`}
        </p>
        <div className="flex gap-5 mt-2">
          {[
            { val: totalAsig, label: 'asignadas', color: '#2D3B45' },
            { val: confirmadas, label: 'confirmadas', color: '#0B874B' },
            { val: sinDocente, label: 'sin docente', color: '#E8A000' },
          ].map(s => (
            <span key={s.label} style={{ fontSize: 12, color: '#8B969D' }}>
              <strong style={{ color: s.color }}>{s.val}</strong> {s.label}
            </span>
          ))}
        </div>
      </div>

      {/* DnD Wrapper (Client Component) */}
      <HorarioDndWrapper
        modulo={{
          id: modulo.id,
          nombre: modulo.nombre,
          numero: modulo.numero,
          fechaInicio: modulo.fechaInicio,
          fechaFin: modulo.fechaFin,
          horasMatutino: modulo.horasMatutino,
          horasNocturno: modulo.horasNocturno,
        }}
        jornada={jornada}
        nivelParalelos={nivelParalelosReal.map(np => ({ ...np, jornada: np.jornada as 'MATUTINA' | 'NOCTURNA' }))}
        initialAsignaciones={asignacionesData}
        asignaturas={asignaturas}
        docentes={docentes.map(d => ({ ...d, tipo: d.tipo as 'TC' | 'TP' | 'MT' }))}
        todosModulos={todosModulosReal}
        canEdit={canEdit}
      />
    </div>
  )
}
