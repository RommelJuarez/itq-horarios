import Link from 'next/link'
import { prisma } from '@/lib/db'
import { ToggleActivoButton } from '@/app/dashboard/docentes/[id]/toggle-activo'
import { toggleActivoCarrera } from '@/lib/actions/carreras'
import { getCanEdit } from '@/lib/auth-utils'

export default async function CarrerasPage() {
  const [carreras, canEdit] = await Promise.all([
    prisma.carrera.findMany({ orderBy: { nombre: 'asc' } }),
    getCanEdit(),
  ])

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 style={{ fontSize: '22px', fontWeight: 400, color: '#2D3B45' }}>Carreras</h1>
        {canEdit && (
          <Link
            href="/dashboard/carreras/nueva"
            style={{ backgroundColor: '#CC0000', color: 'white', fontSize: '13px', padding: '7px 16px', borderRadius: '4px' }}
          >
            + Nueva
          </Link>
        )}
      </div>

      <div style={{ background: 'white', border: '1px solid #C7CDD1', borderRadius: '4px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px 140px 80px 80px', padding: '10px 16px', borderBottom: '1px solid #EEF0F2' }}>
          <p className="section-title">Nombre</p>
          <p className="section-title">Código</p>
          <p className="section-title">Sede</p>
          <p className="section-title">Estado</p>
          <p className="section-title"></p>
        </div>
        {carreras.map((c, i) => (
          <div
            key={c.id}
            style={{ display: 'grid', gridTemplateColumns: '1fr 100px 140px 80px 80px', padding: '12px 16px', borderBottom: i < carreras.length - 1 ? '1px solid #EEF0F2' : 'none', alignItems: 'center' }}
          >
            <p style={{ fontSize: '13px', fontWeight: 600, color: '#2D3B45' }}>{c.nombre}</p>
            <p style={{ fontSize: '12px', color: '#556572' }}>{c.codigo}</p>
            <p style={{ fontSize: '12px', color: '#556572' }}>{c.sede}</p>
            <span style={{
              fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '99px', display: 'inline-block',
              backgroundColor: c.activo ? '#F0FFF7' : '#F5F5F5',
              color: c.activo ? '#0B874B' : '#8B969D',
              border: `1px solid ${c.activo ? '#BBDDCC' : '#C7CDD1'}`,
            }}>
              {c.activo ? 'Activa' : 'Inactiva'}
            </span>
            <div className="flex gap-2 items-center">
              {canEdit && <Link href={`/dashboard/carreras/${c.id}`} style={{ fontSize: '12px', color: '#0374B5' }}>Editar</Link>}
              {canEdit && <ToggleActivoButton id={c.id} activo={c.activo} toggle={toggleActivoCarrera} />}
            </div>
          </div>
        ))}
        {carreras.length === 0 && (
          <p style={{ padding: '16px', fontSize: '13px', color: '#8B969D' }}>No hay carreras registradas.</p>
        )}
      </div>
    </div>
  )
}
