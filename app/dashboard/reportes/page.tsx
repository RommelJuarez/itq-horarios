import Link from 'next/link'

const REPORTES = [
  {
    title: 'Carga horaria total',
    desc: 'Horas por docente en el periodo completo con semáforo de estado.',
    href: '/dashboard/reportes/carga-horaria',
    color: '#CC0000',
  },
  {
    title: 'Horario por módulo',
    desc: 'Tabla de asignaciones completa por módulo y jornada.',
    href: '/dashboard/horarios',
    color: '#0374B5',
  },
  {
    title: 'Exportar Excel',
    desc: 'Descarga el archivo .xlsx con las 5 hojas del periodo.',
    href: '/api/exportar/horarios',
    color: '#0B874B',
    external: true,
  },
  {
    title: 'Carga semanal',
    desc: 'Distribución de horas por día y docente.',
    href: '/dashboard/horarios',
    color: '#E8A000',
  },
]

export default function ReportesPage() {
  return (
    <div>
      <h1 style={{ fontSize: '22px', fontWeight: 400, color: '#2D3B45', marginBottom: '24px' }}>Reportes</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', maxWidth: '640px' }}>
        {REPORTES.map(r => (
          <Link
            key={r.title}
            href={r.href}
            style={{ background: 'white', border: '1px solid #C7CDD1', borderRadius: '4px', overflow: 'hidden', display: 'block' }}
          >
            <div className="card-strip" style={{ backgroundColor: r.color }} />
            <div style={{ padding: '16px' }}>
              <p style={{ fontSize: '13px', fontWeight: 700, color: '#2D3B45', marginBottom: '6px' }}>{r.title}</p>
              <p style={{ fontSize: '12px', color: '#8B969D', lineHeight: 1.5 }}>{r.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
