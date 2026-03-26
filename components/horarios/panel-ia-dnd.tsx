'use client'

import { useState } from 'react'
import { useDraggable } from '@dnd-kit/core'
import type { AsignaturaHorario, AsignacionHorario, DocenteHorario, DragItemData } from './types'
import { NIVEL_COLORS } from './types'

// ─── Draggable chip ──────────────────────────────────────────────────────────

function DraggableAsignatura({ a }: { a: AsignaturaHorario }) {
  const colors = NIVEL_COLORS[a.nivel] ?? NIVEL_COLORS[1]
  const data: DragItemData = { type: 'asignatura', id: a.id, nivel: a.nivel, nombre: a.nombre }
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `asignatura-${a.id}`,
    data,
  })

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={{
        padding: '6px 10px',
        borderRadius: 4,
        backgroundColor: isDragging ? colors.border : colors.bg,
        border: `1px solid ${colors.border}`,
        cursor: isDragging ? 'grabbing' : 'grab',
        fontSize: 12,
        fontWeight: 600,
        color: colors.text,
        userSelect: 'none',
        opacity: isDragging ? 0.4 : 1,
        touchAction: 'none',
      }}
    >
      {a.nombre}
    </div>
  )
}

function DotsIndicator({ count }: { count: number }) {
  const dotColors = ['#C7CDD1', '#0374B5', '#E8A000', '#CC0000']
  const color = dotColors[Math.min(count, 3)]
  return (
    <div style={{ display: 'flex', gap: 3 }}>
      {[0, 1, 2].map(i => (
        <span key={i} style={{
          width: 7, height: 7, borderRadius: '50%', display: 'inline-block',
          backgroundColor: i < count ? color : '#E5E7EB',
          flexShrink: 0,
        }} />
      ))}
    </div>
  )
}

function DraggableDocente({ d }: { d: DocenteHorario }) {
  const lleno = d.asignacionesEnModulo >= 3
  const data: DragItemData = { type: 'docente', id: d.id, nombre: d.nombre, tipo: d.tipo }
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `docente-${d.id}`,
    data,
    disabled: lleno,
  })

  const tipoColors: Record<string, { bg: string; text: string; border: string }> = {
    TC: { bg: '#FFF1F1', text: '#CC0000', border: '#FFCCCC' },
    MT: { bg: '#FFF8E6', text: '#E8A000', border: '#F5D080' },
    TP: { bg: '#EEF4FB', text: '#0374B5', border: '#BDD4EE' },
  }
  const tc = tipoColors[d.tipo] ?? tipoColors.TP

  return (
    <div
      ref={setNodeRef}
      {...(lleno ? {} : { ...listeners, ...attributes })}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '7px 10px',
        borderRadius: 4,
        border: '1px solid #E5E7EB',
        backgroundColor: lleno ? '#F5F5F5' : 'white',
        cursor: lleno ? 'not-allowed' : (isDragging ? 'grabbing' : 'grab'),
        opacity: lleno ? 0.5 : (isDragging ? 0.4 : 1),
        userSelect: 'none',
        touchAction: 'none',
      }}
    >
      <DotsIndicator count={d.asignacionesEnModulo} />
      <p style={{ fontSize: 12, color: '#2D3B45', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {d.nombre}
      </p>
      <span style={{ fontSize: 9, fontWeight: 700, padding: '1px 5px', borderRadius: 3, backgroundColor: tc.bg, color: tc.text, border: `1px solid ${tc.border}` }}>
        {d.tipo}
      </span>
    </div>
  )
}

// ─── Panel principal ─────────────────────────────────────────────────────────

interface Props {
  asignaturas: AsignaturaHorario[]
  docentes: DocenteHorario[]
  moduloId: number
  asignaciones: AsignacionHorario[]
  onIAApply: (creadas: AsignacionHorario[]) => void
}

export function PanelIaDnd({ asignaturas, docentes, moduloId, asignaciones, onIAApply }: Props) {
  const [tab, setTab] = useState<'asignaturas' | 'docentes'>('asignaturas')
  const [busqueda, setBusqueda] = useState('')
  const [cargandoIA, setCargandoIA] = useState(false)
  const [iaMsg, setIaMsg] = useState<string | null>(null)

  // Agrupar asignaturas por nivel
  const byNivel: Record<number, AsignaturaHorario[]> = {}
  for (const a of asignaturas) {
    if (!byNivel[a.nivel]) byNivel[a.nivel] = []
    byNivel[a.nivel].push(a)
  }

  const docentesFiltrados = docentes.filter(d =>
    d.nombre.toLowerCase().includes(busqueda.toLowerCase())
  )

  async function handleGenerarIA() {
    setCargandoIA(true)
    setIaMsg(null)
    try {
      const asignacionesActuales = asignaciones.map(a => ({
        nivelParaleloId: a.nivelParaleloId,
        horario:         a.horario,
        docenteId:       a.docente?.id ?? null,
        asignaturaId:    a.asignaturaId,
      }))

      const res = await fetch('/api/ia/generar-horarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moduloId, asignacionesActuales }),
      })
      const data = await res.json()

      if (data.error) {
        setIaMsg(data.error)
        return
      }

      const creadas: AsignacionHorario[] = data.creadas ?? []
      if (creadas.length > 0) {
        onIAApply(creadas)
        setIaMsg(`IA asignó ${creadas.length} combinación${creadas.length !== 1 ? 'es' : ''} correctamente`)
      } else {
        setIaMsg('IA no generó nuevas asignaciones (todos los slots ya están cubiertos)')
      }
    } catch {
      setIaMsg('Error al conectar con la IA')
    } finally {
      setCargandoIA(false)
    }
  }

  const TAB = (t: typeof tab): React.CSSProperties => ({
    flex: 1, fontSize: 12, fontWeight: tab === t ? 700 : 400,
    color: tab === t ? '#CC0000' : '#556572',
    padding: '8px', border: 'none', background: 'none', cursor: 'pointer',
    borderTop: 'none', borderLeft: 'none', borderRight: 'none',
    borderBottom: tab === t ? '2px solid #CC0000' : '2px solid transparent',
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', borderBottom: '1px solid #C7CDD1' }}>
        <button style={TAB('asignaturas')} onClick={() => setTab('asignaturas')}>Asignaturas</button>
        <button style={TAB('docentes')} onClick={() => setTab('docentes')}>Docentes</button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: 12 }}>
        {tab === 'asignaturas' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {Object.entries(byNivel).map(([nivel, items]) => (
              <div key={nivel}>
                <p style={{ fontSize: 10, fontWeight: 700, color: '#556572', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>
                  Nivel {nivel}
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {items.map(a => <DraggableAsignatura key={a.id} a={a} />)}
                </div>
              </div>
            ))}
            {asignaturas.length === 0 && (
              <p style={{ fontSize: 12, color: '#8B969D' }}>Sin asignaturas para esta carrera.</p>
            )}
          </div>
        )}

        {tab === 'docentes' && (
          <div>
            <input
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              placeholder="Buscar docente..."
              style={{ width: '100%', border: '1px solid #C7CDD1', borderRadius: 4, padding: '6px 10px', fontSize: 12, marginBottom: 10, boxSizing: 'border-box' }}
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {docentesFiltrados.map(d => <DraggableDocente key={d.id} d={d} />)}
              {docentesFiltrados.length === 0 && (
                <p style={{ fontSize: 12, color: '#8B969D' }}>Sin resultados.</p>
              )}
            </div>
          </div>
        )}
      </div>

      <div style={{ padding: 12, borderTop: '1px solid #EEF0F2', flexShrink: 0 }}>
        {iaMsg && <p style={{ fontSize: 11, color: '#556572', marginBottom: 6 }}>{iaMsg}</p>}
        <button
          onClick={handleGenerarIA}
          disabled={cargandoIA}
          style={{
            width: '100%', padding: '8px 0', borderRadius: 4,
            backgroundColor: cargandoIA ? '#F5F5F5' : '#2D3B45',
            color: cargandoIA ? '#8B969D' : 'white',
            border: 'none', cursor: cargandoIA ? 'wait' : 'pointer',
            fontSize: 12, fontWeight: 600,
          }}
        >
          {cargandoIA ? 'Generando...' : '✦ Generar con IA'}
        </button>
      </div>
    </div>
  )
}
