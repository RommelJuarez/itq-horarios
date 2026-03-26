import Link from 'next/link'
import { prisma } from '@/lib/db'
import { getCanEdit } from '@/lib/auth-utils'

export default async function DocentesPage() {
  const [docentes, canEdit] = await Promise.all([
    prisma.docente.findMany({ orderBy: { nombre: 'asc' } }),
    getCanEdit(),
  ])

  const tc = docentes.filter(d => d.tipo === 'TC')
  const mt = docentes.filter(d => d.tipo === 'MT')
  const tp = docentes.filter(d => d.tipo === 'TP')

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 style={{ fontSize: '22px', fontWeight: 400, color: '#2D3B45' }}>Docentes</h1>
        {canEdit && (
          <Link
            href="/dashboard/docentes/nuevo"
            style={{ backgroundColor: '#CC0000', color: 'white', fontSize: '13px', padding: '7px 16px', borderRadius: '4px' }}
          >
            + Nuevo
          </Link>
        )}
      </div>

      {[{ label: 'Tiempo Completo (TC)', items: tc }, { label: 'Medio Tiempo (MT)', items: mt }, { label: 'Tiempo Parcial (TP)', items: tp }].map(group => (
        group.items.length > 0 && (
          <div key={group.label} className="mb-6">
            <p className="section-title mb-3">{group.label}</p>
            <div style={{ background: 'white', border: '1px solid #C7CDD1', borderRadius: '4px' }}>
              {group.items.map((d, i) => (
                <div
                  key={d.id}
                  style={{ borderBottom: i < group.items.length - 1 ? '1px solid #EEF0F2' : 'none' }}
                  className="flex items-center justify-between px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <span
                      style={{
                        width: '8px', height: '8px', borderRadius: '50%',
                        backgroundColor: d.activo ? '#0B874B' : '#C7CDD1',
                        flexShrink: 0,
                      }}
                    />
                    <div>
                      <p style={{ fontSize: '13px', color: '#2D3B45', fontWeight: 600 }}>{d.nombre}</p>
                      {d.especialidad && (
                        <p style={{ fontSize: '11px', color: '#8B969D' }}>{d.especialidad}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span style={{
                      fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '99px',
                      backgroundColor: d.tipo === 'TC' ? '#FFF1F1' : d.tipo === 'MT' ? '#FFF8E6' : '#EEF4FB',
                      color: d.tipo === 'TC' ? '#CC0000' : d.tipo === 'MT' ? '#E8A000' : '#0374B5',
                      border: `1px solid ${d.tipo === 'TC' ? '#FFCCCC' : d.tipo === 'MT' ? '#F5D080' : '#BDD4EE'}`,
                    }}>
                      {d.tipo}
                    </span>
                    {canEdit && (
                      <Link
                        href={`/dashboard/docentes/${d.id}`}
                        style={{ fontSize: '12px', color: '#0374B5' }}
                      >
                        Editar
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      ))}

      {docentes.length === 0 && (
        <p style={{ color: '#8B969D', fontSize: '13px' }}>No hay docentes registrados.</p>
      )}
    </div>
  )
}
