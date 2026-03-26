import type { CSSProperties } from 'react'

interface ModuloConAsignaciones {
  id: number
  nombre: string
  horasMatutino: number
  horasNocturno: number
  fechaInicio: Date
  fechaFin: Date
  asignaciones: {
    id: number
    horario: string
    docente?: { id: number; nombre: string; tipo: string; horasMin: number; horasMax: number } | null
    nivelParalelo: { jornada: string }
    asignatura: { nombre: string }
  }[]
}

interface Props {
  modulos: ModuloConAsignaciones[]
  vista: 'semanal' | 'total'
}

function semanas(m: ModuloConAsignaciones): number {
  const ms = new Date(m.fechaFin).getTime() - new Date(m.fechaInicio).getTime()
  return Math.round(ms / (7 * 24 * 60 * 60 * 1000))
}

function horasPorBloque(jornada: string): number {
  return jornada === 'MATUTINA' ? 2 : 1.5
}

export function ResumenCarga({ modulos, vista }: Props) {
  // Collect all docentes
  const docenteMap: Record<number, { nombre: string; tipo: string; horasMin: number; horasMax: number }> = {}
  for (const m of modulos) {
    for (const a of m.asignaciones) {
      if (a.docente) {
        docenteMap[a.docente.id] = { nombre: a.docente.nombre, tipo: a.docente.tipo, horasMin: a.docente.horasMin, horasMax: a.docente.horasMax }
      }
    }
  }
  const docentes = Object.entries(docenteMap).map(([id, d]) => ({ id: parseInt(id), ...d }))

  if (vista === 'semanal') {
    // For each docente, calculate hours per week in current (first active) module
    const modulo = modulos[0]
    if (!modulo) return <p style={{ fontSize: '13px', color: '#8B969D' }}>No hay módulos.</p>

    const horasPorDocente: Record<number, number> = {}
    for (const a of modulo.asignaciones) {
      if (!a.docente) continue
      const horas = horasPorBloque(a.nivelParalelo.jornada)
      horasPorDocente[a.docente.id] = (horasPorDocente[a.docente.id] ?? 0) + horas
    }

    const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes']

    return (
      <div style={{ overflowX: 'auto' }}>
        <p className="section-title" style={{ marginBottom: '12px' }}>{modulo.nombre} — Carga semanal</p>
        <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', border: '1px solid #C7CDD1', borderRadius: '4px' }}>
          <thead>
            <tr style={{ background: '#F5F5F5' }}>
              <th style={TH}>Docente</th>
              {DAYS.map(d => <th key={d} style={TH}>{d}</th>)}
              <th style={{ ...TH, color: '#2D3B45' }}>Total/sem</th>
            </tr>
          </thead>
          <tbody>
            {docentes.map((d, i) => {
              const hDay = horasPorDocente[d.id] ?? 0
              const hSem = hDay * 5
              return (
                <tr key={d.id} style={{ borderBottom: i < docentes.length - 1 ? '1px solid #EEF0F2' : 'none' }}>
                  <td style={TD}>{d.nombre}</td>
                  {DAYS.map(day => <td key={day} style={TD}>{hDay > 0 ? `${hDay}h` : '—'}</td>)}
                  <td style={{ ...TD, fontWeight: 700 }}>{hSem > 0 ? `${hSem}h` : '—'}</td>
                </tr>
              )
            })}
            {docentes.length === 0 && (
              <tr>
                <td colSpan={7} style={{ padding: '16px', textAlign: 'center', fontSize: '13px', color: '#8B969D' }}>
                  Sin asignaciones con docente en este módulo.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    )
  }

  // Vista total por módulos
  const totalPorDocente: Record<number, Record<number, number>> = {}
  for (const m of modulos) {
    const sem = semanas(m)
    for (const a of m.asignaciones) {
      if (!a.docente) continue
      const horas = horasPorBloque(a.nivelParalelo.jornada) * 5 * sem
      if (!totalPorDocente[a.docente.id]) totalPorDocente[a.docente.id] = {}
      totalPorDocente[a.docente.id][m.id] = (totalPorDocente[a.docente.id][m.id] ?? 0) + horas
    }
  }

  function estado(d: typeof docentes[0], total: number): { label: string; color: string } {
    if (d.tipo === 'TP') return { label: 'TP', color: '#8B969D' }
    if (total > d.horasMax) return { label: 'Supera máx', color: '#CC0000' }
    if (total < d.horasMin) return { label: 'Bajo mínimo', color: '#E8A000' }
    return { label: 'OK', color: '#0B874B' }
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <p className="section-title" style={{ marginBottom: '12px' }}>Carga total por módulos</p>
      <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', border: '1px solid #C7CDD1', borderRadius: '4px' }}>
        <thead>
          <tr style={{ background: '#F5F5F5' }}>
            <th style={TH}>Docente</th>
            <th style={TH}>Tipo</th>
            {modulos.map(m => <th key={m.id} style={TH}>{m.nombre}</th>)}
            <th style={{ ...TH, color: '#2D3B45' }}>Total</th>
            <th style={TH}>Estado</th>
          </tr>
        </thead>
        <tbody>
          {docentes.map((d, i) => {
            const porModulo = totalPorDocente[d.id] ?? {}
            const total = Object.values(porModulo).reduce((s, v) => s + v, 0)
            const est = estado(d, total)
            return (
              <tr key={d.id} style={{ borderBottom: i < docentes.length - 1 ? '1px solid #EEF0F2' : 'none' }}>
                <td style={TD}>{d.nombre}</td>
                <td style={TD}>{d.tipo}</td>
                {modulos.map(m => (
                  <td key={m.id} style={TD}>{porModulo[m.id] ? `${Math.round(porModulo[m.id])}h` : '—'}</td>
                ))}
                <td style={{ ...TD, fontWeight: 700 }}>{total > 0 ? `${Math.round(total)}h` : '—'}</td>
                <td style={TD}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: est.color }}>{est.label}</span>
                </td>
              </tr>
            )
          })}
          {docentes.length === 0 && (
            <tr>
              <td colSpan={modulos.length + 4} style={{ padding: '16px', textAlign: 'center', fontSize: '13px', color: '#8B969D' }}>
                Sin asignaciones con docente registradas.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

const TH: CSSProperties = {
  padding: '10px 14px',
  textAlign: 'left',
  fontSize: '11px',
  fontWeight: 700,
  color: '#556572',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  borderBottom: '1px solid #C7CDD1',
  borderLeft: '1px solid #EEF0F2',
}

const TD: CSSProperties = {
  padding: '10px 14px',
  fontSize: '12px',
  color: '#2D3B45',
  borderLeft: '1px solid #EEF0F2',
}
