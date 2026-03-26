import Link from 'next/link'
import { prisma } from '@/lib/db'
import { getCanEdit } from '@/lib/auth-utils'

const MOD_COLORS = ['#CC0000', '#0374B5', '#0B874B']

function fmt(d: Date) {
  return d.toLocaleDateString('es-EC', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default async function PeriodosPage() {
  const canEdit = await getCanEdit()
  const periodos = await prisma.periodoAcademico.findMany({
    include: { modulos: { orderBy: { numero: 'asc' } } },
    orderBy: [{ anio: 'desc' }, { numero: 'desc' }],
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 style={{ fontSize: '22px', fontWeight: 400, color: '#2D3B45' }}>Periodos académicos</h1>
        {canEdit && (
          <Link
            href="/dashboard/periodos/nuevo"
            style={{ backgroundColor: '#CC0000', color: 'white', fontSize: '13px', padding: '7px 16px', borderRadius: '4px' }}
          >
            + Nuevo
          </Link>
        )}
      </div>

      <div className="flex flex-col gap-4">
        {periodos.map(p => (
          <div key={p.id} style={{ background: 'white', border: '1px solid #C7CDD1', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ borderBottom: '1px solid #EEF0F2', padding: '14px 18px' }} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span style={{
                  width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0,
                  backgroundColor: p.activo ? '#0B874B' : '#C7CDD1',
                }} />
                <div>
                  <p style={{ fontSize: '14px', fontWeight: 700, color: '#2D3B45' }}>{p.nombre}</p>
                  <p style={{ fontSize: '11px', color: '#8B969D' }}>
                    {fmt(p.fechaInicio)} — {fmt(p.fechaFin)}
                  </p>
                </div>
              </div>
              {canEdit && (
                <Link href={`/dashboard/periodos/${p.id}`} style={{ fontSize: '12px', color: '#0374B5' }}>
                  Editar
                </Link>
              )}
            </div>
            <div className="flex">
              {p.modulos.map((m, i) => (
                <div key={m.id} style={{ flex: 1, borderRight: i < 2 ? '1px solid #EEF0F2' : 'none', padding: '12px 16px' }}>
                  <div className="flex items-center gap-2 mb-1">
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: MOD_COLORS[i], flexShrink: 0 }} />
                    <p style={{ fontSize: '12px', fontWeight: 700, color: '#2D3B45' }}>{m.nombre}</p>
                  </div>
                  <p style={{ fontSize: '11px', color: '#8B969D' }}>
                    {fmt(m.fechaInicio)} → {fmt(m.fechaFin)}
                  </p>
                  <p style={{ fontSize: '11px', color: '#8B969D' }}>
                    {m.horasMatutino}h mat / {m.horasNocturno}h noc
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {periodos.length === 0 && (
        <p style={{ color: '#8B969D', fontSize: '13px' }}>No hay periodos registrados.</p>
      )}
    </div>
  )
}
