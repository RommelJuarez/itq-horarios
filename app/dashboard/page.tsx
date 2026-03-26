import { prisma } from '@/lib/db'
import Link from 'next/link'

const MOD_COLORS = ['#CC0000', '#0374B5', '#0B874B']

function fmt(d: Date) {
  return d.toLocaleDateString('es-EC', { day: '2-digit', month: 'short' })
}

export default async function DashboardPage() {
  const [docentesCount, asignaturasCount, periodoActivo] = await Promise.all([
    prisma.docente.count({ where: { activo: true } }),
    prisma.asignatura.count({ where: { activo: true } }),
    prisma.periodoAcademico.findFirst({
      where: { activo: true },
      include: {
        modulos: {
          orderBy: { numero: 'asc' },
          include: {
            asignaciones: { select: { id: true, estado: true, docenteId: true } },
          },
        },
      },
      orderBy: [{ anio: 'desc' }, { numero: 'desc' }],
    }),
  ])

  const modulos = periodoActivo?.modulos ?? []
  const todasAsignaciones = modulos.flatMap(m => m.asignaciones)
  const confirmadas = todasAsignaciones.filter(a => a.estado === 'CONFIRMADO').length
  const sinDocente = todasAsignaciones.filter(a => !a.docenteId).length

  const docentesTC = await prisma.docente.findMany({
    where: { activo: true, tipo: 'TC' },
    include: {
      asignaciones: {
        where: { modulo: { periodo: { activo: true } } },
        select: { id: true },
      },
    },
    orderBy: { nombre: 'asc' },
  })

  return (
    <div>
      <h1 style={{ fontSize: '22px', fontWeight: 400, color: '#2D3B45', marginBottom: '24px', borderBottom: '1px solid #DDD', paddingBottom: '14px' }}>
        Panel de control
      </h1>

      {/* Stat row */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '28px' }}>
        {[
          { val: docentesCount, label: 'Docentes activos', color: '#CC0000' },
          { val: asignaturasCount, label: 'Asignaturas', color: '#2D3B45' },
          { val: modulos.length, label: 'Módulos activos', color: '#2D3B45' },
          { val: confirmadas, label: 'Asignaciones confirmadas', color: '#0B874B' },
          { val: sinDocente, label: 'Sin docente asignado', color: '#E8A000' },
        ].map(s => (
          <div key={s.label} style={{ background: 'white', border: '1px solid #C7CDD1', borderRadius: '4px', padding: '14px 18px', flex: 1 }}>
            <p style={{ fontSize: '28px', fontWeight: 700, color: s.color }}>{s.val}</p>
            <p style={{ fontSize: '11px', color: '#8B969D', marginTop: '2px' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Módulos */}
      {periodoActivo && (
        <div style={{ marginBottom: '28px' }}>
          <p className="section-title" style={{ marginBottom: '12px' }}>Módulos — {periodoActivo.nombre}</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            {modulos.map((m, i) => {
              const total = m.asignaciones.length
              const conf = m.asignaciones.filter(a => a.estado === 'CONFIRMADO').length
              const pct = total > 0 ? Math.round((conf / total) * 100) : 0
              return (
                <div key={m.id} style={{ background: 'white', border: '1px solid #C7CDD1', borderRadius: '4px', overflow: 'hidden' }}>
                  <div className="card-strip" style={{ backgroundColor: MOD_COLORS[i] }} />
                  <div style={{ padding: '14px 16px' }}>
                    <p style={{ fontSize: '13px', fontWeight: 700, color: '#2D3B45', marginBottom: '4px' }}>{m.nombre}</p>
                    <p style={{ fontSize: '11px', color: '#8B969D', marginBottom: '12px' }}>
                      {fmt(m.fechaInicio)} — {fmt(m.fechaFin)}
                    </p>
                    <div style={{ height: '4px', background: '#EEF0F2', borderRadius: '2px', marginBottom: '6px' }}>
                      <div style={{ height: '100%', borderRadius: '2px', backgroundColor: MOD_COLORS[i], width: `${pct}%` }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <p style={{ fontSize: '11px', color: '#8B969D' }}>{conf}/{total} confirmadas</p>
                      <Link
                        href="/dashboard/horarios"
                        style={{ fontSize: '11px', color: MOD_COLORS[i], fontWeight: 600 }}
                      >
                        Ver →
                      </Link>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* TC Docentes carga */}
      {docentesTC.length > 0 && (
        <div>
          <p className="section-title" style={{ marginBottom: '12px' }}>Carga docentes TC</p>
          <div style={{ background: 'white', border: '1px solid #C7CDD1', borderRadius: '4px' }}>
            {docentesTC.map((d, i) => {
              const asig = d.asignaciones.length
              const max = 3
              const pct = Math.min((asig / max) * 100, 100)
              return (
                <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderBottom: i < docentesTC.length - 1 ? '1px solid #EEF0F2' : 'none' }}>
                  <p style={{ fontSize: '13px', color: '#2D3B45', flex: 1 }}>{d.nombre}</p>
                  <div style={{ width: '120px' }}>
                    <div style={{ height: '4px', background: '#EEF0F2', borderRadius: '2px' }}>
                      <div style={{ height: '100%', borderRadius: '2px', backgroundColor: pct >= 100 ? '#CC0000' : pct >= 66 ? '#E8A000' : '#0374B5', width: `${pct}%` }} />
                    </div>
                  </div>
                  <p style={{ fontSize: '11px', color: '#8B969D', width: '36px', textAlign: 'right' }}>{asig}/{max}</p>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {!periodoActivo && (
        <div style={{ background: 'white', border: '1px solid #C7CDD1', borderRadius: '4px', padding: '24px', textAlign: 'center' }}>
          <p style={{ fontSize: '13px', color: '#8B969D', marginBottom: '12px' }}>No hay periodos activos.</p>
          <Link
            href="/dashboard/periodos/nuevo"
            style={{ fontSize: '13px', color: '#CC0000', fontWeight: 600 }}
          >
            Crear primer periodo →
          </Link>
        </div>
      )}
    </div>
  )
}
