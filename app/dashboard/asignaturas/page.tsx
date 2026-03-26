import Link from 'next/link'
import { prisma } from '@/lib/db'
import { getCanEdit } from '@/lib/auth-utils'

const NIVEL_COLORS: Record<number, { bg: string; text: string; border: string }> = {
  1: { bg: '#FFF1F1', text: '#CC0000', border: '#FFCCCC' },
  2: { bg: '#EEF4FB', text: '#0374B5', border: '#BDD4EE' },
  3: { bg: '#F0FFF7', text: '#0B874B', border: '#BBDDCC' },
  4: { bg: '#FFF8E6', text: '#E8A000', border: '#F5D080' },
  5: { bg: '#F5F0FF', text: '#7B3FC4', border: '#D0B8F0' },
}

export default async function AsignaturasPage() {
  const canEdit = await getCanEdit()
  const asignaturas = await prisma.asignatura.findMany({
    include: { carrera: true },
    orderBy: [{ nivel: 'asc' }, { nombre: 'asc' }],
  })

  const byNivel: Record<number, typeof asignaturas> = {}
  for (const a of asignaturas) {
    if (!byNivel[a.nivel]) byNivel[a.nivel] = []
    byNivel[a.nivel].push(a)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 style={{ fontSize: '22px', fontWeight: 400, color: '#2D3B45' }}>Asignaturas</h1>
        {canEdit && (
          <Link
            href="/dashboard/asignaturas/nueva"
            style={{ backgroundColor: '#CC0000', color: 'white', fontSize: '13px', padding: '7px 16px', borderRadius: '4px' }}
          >
            + Nueva
          </Link>
        )}
      </div>

      {Object.entries(byNivel).map(([nivel, items]) => {
        const n = parseInt(nivel)
        const colors = NIVEL_COLORS[n] ?? NIVEL_COLORS[1]
        return (
          <div key={nivel} className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <span style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: '22px', height: '22px', borderRadius: '4px',
                backgroundColor: colors.bg, color: colors.text, border: `1px solid ${colors.border}`,
                fontSize: '11px', fontWeight: 700,
              }}>
                {n}
              </span>
              <p className="section-title">Nivel {n}</p>
            </div>
            <div style={{ background: 'white', border: '1px solid #C7CDD1', borderRadius: '4px' }}>
              {items.map((a, i) => (
                <div
                  key={a.id}
                  style={{ borderBottom: i < items.length - 1 ? '1px solid #EEF0F2' : 'none' }}
                  className="flex items-center justify-between px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <span style={{
                      width: '4px', height: '30px', borderRadius: '2px',
                      backgroundColor: colors.text, flexShrink: 0,
                    }} />
                    <div>
                      <p style={{ fontSize: '13px', color: '#2D3B45', fontWeight: 600 }}>{a.nombre}</p>
                      <p style={{ fontSize: '11px', color: '#8B969D' }}>
                        {a.carrera.nombre} · {a.horasMatutino}h mat / {a.horasNocturno}h noc
                        {a.codigo && ` · ${a.codigo}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {!a.activo && (
                      <span style={{ fontSize: '10px', color: '#8B969D', border: '1px solid #C7CDD1', padding: '1px 6px', borderRadius: '99px' }}>
                        Inactiva
                      </span>
                    )}
                    {canEdit && (
                      <Link href={`/dashboard/asignaturas/${a.id}`} style={{ fontSize: '12px', color: '#0374B5' }}>
                        Editar
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      })}

      {asignaturas.length === 0 && (
        <p style={{ color: '#8B969D', fontSize: '13px' }}>No hay asignaturas registradas.</p>
      )}
    </div>
  )
}
