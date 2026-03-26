'use client'

import { useDroppable } from '@dnd-kit/core'
import type { AsignacionHorario, NivelParalelo, ModuloInfo, DropCellData } from './types'
import { HORARIOS, NIVEL_COLORS, buildAsigMap } from './types'

// ─── Droppable cell ──────────────────────────────────────────────────────────

function DroppableCell({
  id, data, children,
}: {
  id: string
  data: DropCellData
  children: (isOver: boolean) => React.ReactNode
}) {
  const { setNodeRef, isOver } = useDroppable({ id, data })
  return (
    <td ref={setNodeRef} style={{ padding: 4, border: '1px solid #DDD', verticalAlign: 'middle', minWidth: 140 }}>
      {children(isOver)}
    </td>
  )
}

// ─── Chips de celda ──────────────────────────────────────────────────────────

function AsignaturaChip({
  nombre, nivel, isOver, onEliminar, showDelete,
}: {
  nombre: string
  nivel: number
  isOver: boolean
  onEliminar: () => void
  showDelete: boolean
}) {
  const c = NIVEL_COLORS[nivel] ?? NIVEL_COLORS[1]
  return (
    <div style={{
      padding: '4px 8px', borderRadius: 3, fontSize: 11, fontWeight: 600,
      backgroundColor: isOver ? c.border : c.bg,
      color: c.text,
      border: `1px solid ${c.border}`,
      display: 'flex', alignItems: 'center', gap: 4,
      maxWidth: 160,
    }}>
      <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {nombre}
      </span>
      {showDelete && (
        <button
          onClick={onEliminar}
          title="Eliminar asignación"
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: c.border, fontSize: 14, lineHeight: 1, padding: '0 2px',
            flexShrink: 0, fontWeight: 700,
          }}
        >×</button>
      )}
    </div>
  )
}

function DocenteChip({
  nombre, tipo, isOver, onEliminar, showDelete,
}: {
  nombre: string
  tipo: string
  isOver: boolean
  onEliminar: () => void
  showDelete: boolean
}) {
  return (
    <div style={{
      padding: '4px 8px', borderRadius: 3, fontSize: 11,
      backgroundColor: isOver ? '#E5E7EB' : '#F5F5F5',
      color: '#2D3B45', border: '1px solid #E5E7EB',
      display: 'flex', alignItems: 'center', gap: 4,
      maxWidth: 160,
    }}>
      <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{nombre}</span>
      <span style={{ fontSize: 9, fontWeight: 700, color: '#8B969D', flexShrink: 0 }}>{tipo}</span>
      {showDelete && (
        <button
          onClick={onEliminar}
          title="Quitar docente"
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#C7CDD1', fontSize: 14, lineHeight: 1, padding: '0 2px',
            flexShrink: 0, fontWeight: 700,
          }}
        >×</button>
      )}
    </div>
  )
}

function EmptyDrop({ isOver, hint }: { isOver: boolean; hint: string }) {
  return (
    <div style={{
      border: isOver ? '2px dashed #CC0000' : '2px dashed #E5E7EB',
      borderRadius: 3, height: 32,
      backgroundColor: isOver ? '#FFF5F5' : 'transparent',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <span style={{ fontSize: 10, color: isOver ? '#CC0000' : '#C7CDD1' }}>{hint}</span>
    </div>
  )
}

// ─── Tabla principal ─────────────────────────────────────────────────────────

interface Props {
  modulo: ModuloInfo
  jornada: 'MATUTINA' | 'NOCTURNA'
  nivelParalelos: NivelParalelo[]
  asignaciones: AsignacionHorario[]
  onEliminar: (asignacion: AsignacionHorario) => void
  onEliminarDocente: (asignacion: AsignacionHorario) => void
  canEdit?: boolean
}

function fmtDate(d: Date) {
  return new Date(d).toLocaleDateString('es-EC', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export function TablaHorarioDnd({ modulo, jornada, nivelParalelos, asignaciones, onEliminar, onEliminarDocente, canEdit = true }: Props) {
  const horarios = HORARIOS[jornada]
  const asigMap = buildAsigMap(asignaciones)
  const horas = jornada === 'MATUTINA' ? modulo.horasMatutino : modulo.horasNocturno

  type Fila = {
    key: string
    np: NivelParalelo
    horario: string
    esFirst: boolean
    rowSpanNivel: number
    asignacion: AsignacionHorario | null
  }

  const filas: Fila[] = []
  for (const np of nivelParalelos) {
    horarios.forEach((h, i) => {
      filas.push({
        key: `${np.id}-${h}`,
        np,
        horario: h,
        esFirst: i === 0,
        rowSpanNivel: horarios.length,
        asignacion: asigMap[`${np.id}-${h}`] ?? null,
      })
    })
  }

  const totalFilas = filas.length
  const colors = (nivel: number) => NIVEL_COLORS[nivel] ?? NIVEL_COLORS[1]

  const TH: React.CSSProperties = {
    padding: '8px 10px',
    fontSize: 11,
    fontWeight: 700,
    color: '#556572',
    textTransform: 'uppercase',
    letterSpacing: '0.4px',
    background: '#F5F5F5',
    border: '1px solid #C7CDD1',
    textAlign: 'center',
    whiteSpace: 'nowrap',
  }

  const TD_STATIC: React.CSSProperties = {
    padding: '6px 10px',
    fontSize: 12,
    color: '#556572',
    border: '1px solid #DDD',
    textAlign: 'center',
    verticalAlign: 'middle',
    whiteSpace: 'nowrap',
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      {totalFilas === 0 ? (
        <div style={{ background: 'white', border: '1px solid #C7CDD1', borderRadius: 4, padding: '32px', textAlign: 'center' }}>
          <p style={{ fontSize: 13, color: '#8B969D' }}>
            No hay paralelos para esta jornada/sede. Ve a <strong>Configuración → Paralelos</strong>.
          </p>
        </div>
      ) : (
        <table style={{ borderCollapse: 'collapse', background: 'white', width: '100%', fontSize: 12 }}>
          <thead>
            <tr>
              <th style={TH}>Fecha inicio</th>
              <th style={TH}>Fecha fin</th>
              <th style={{ ...TH, minWidth: 160 }}>Asignatura</th>
              <th style={TH}>Niv.</th>
              <th style={TH}>Par.</th>
              <th style={TH}>Horas</th>
              <th style={TH}>Horario</th>
              <th style={{ ...TH, minWidth: 160 }}>Docente</th>
            </tr>
          </thead>
          <tbody>
            {filas.map((fila, idx) => {
              const c = colors(fila.np.nivel)
              const asig = fila.asignacion

              return (
                <tr key={fila.key}>

                  {/* FECHA INICIO / FIN: solo en la primera fila del módulo */}
                  {idx === 0 && (
                    <td rowSpan={totalFilas} style={{ ...TD_STATIC, background: '#FAFAFA', fontWeight: 600, color: '#2D3B45' }}>
                      {fmtDate(modulo.fechaInicio)}
                    </td>
                  )}
                  {idx === 0 && (
                    <td rowSpan={totalFilas} style={{ ...TD_STATIC, background: '#FAFAFA', fontWeight: 600, color: '#2D3B45' }}>
                      {fmtDate(modulo.fechaFin)}
                    </td>
                  )}

                  {/* ASIGNATURA — droppable, chip con × elimina toda la asignación */}
                  <DroppableCell
                    id={`asig-${fila.np.id}-${fila.horario}`}
                    data={{
                      cellType: 'asignatura',
                      nivelParaleloId: fila.np.id,
                      horario: fila.horario,
                      nivelCelda: fila.np.nivel,
                      asignacion: asig,
                    }}
                  >
                    {(isOver) =>
                      asig ? (
                        <AsignaturaChip
                          nombre={asig.asignatura.nombre}
                          nivel={fila.np.nivel}
                          isOver={false}
                          onEliminar={() => onEliminar(asig)}
                          showDelete={canEdit}
                        />
                      ) : (
                        <EmptyDrop isOver={isOver} hint="Asignatura" />
                      )
                    }
                  </DroppableCell>

                  {/* NIVEL — rowspan */}
                  {fila.esFirst && (
                    <td
                      rowSpan={fila.rowSpanNivel}
                      style={{
                        ...TD_STATIC,
                        backgroundColor: c.bg,
                        color: c.text,
                        fontWeight: 700,
                        borderLeft: `3px solid ${c.solid}`,
                      }}
                    >
                      {fila.np.nivel}
                    </td>
                  )}

                  {/* PARALELO */}
                  <td style={{ ...TD_STATIC, fontWeight: 600, color: '#2D3B45' }}>{fila.np.paralelo}</td>

                  {/* HORAS — rowspan */}
                  {fila.esFirst && (
                    <td rowSpan={fila.rowSpanNivel} style={{ ...TD_STATIC, fontWeight: 600, color: '#2D3B45' }}>
                      {horas}h
                    </td>
                  )}

                  {/* HORARIO */}
                  <td style={{ ...TD_STATIC, fontFamily: 'monospace', fontSize: 11 }}>{fila.horario}</td>

                  {/* DOCENTE — droppable, chip con × elimina solo el docente */}
                  <DroppableCell
                    id={`doc-${fila.np.id}-${fila.horario}`}
                    data={{
                      cellType: 'docente',
                      nivelParaleloId: fila.np.id,
                      horario: fila.horario,
                      nivelCelda: fila.np.nivel,
                      asignacion: asig,
                    }}
                  >
                    {(isOver) =>
                      asig?.docente ? (
                        <DocenteChip
                          nombre={asig.docente.nombre}
                          tipo={asig.docente.tipo}
                          isOver={false}
                          onEliminar={() => onEliminarDocente(asig)}
                          showDelete={canEdit}
                        />
                      ) : (
                        <EmptyDrop isOver={isOver && !!asig} hint={asig ? 'Docente' : '—'} />
                      )
                    }
                  </DroppableCell>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}
    </div>
  )
}
