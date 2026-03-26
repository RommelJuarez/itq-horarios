'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { agregarParalelo, eliminarParalelo, eliminarSede } from '@/lib/actions/paralelos'
import { toast } from '@/components/ui/toast'
import { UsuariosTab } from './usuarios-tab'

interface NP {
  id: number; periodoId: number; carreraId: number
  nivel: number; paralelo: string; jornada: string; sede: string; activo: boolean
}

interface Periodo { id: number; nombre: string; nivelesParalelos: NP[] }
interface Carrera { id: number; nombre: string }

interface Props { periodos: Periodo[]; carreras: Carrera[]; canEdit: boolean; isAdmin: boolean; usuarios?: { id: number; nombre: string; email: string; rol: string; activo: boolean }[] }

const PARALELOS_SEQ = ['A', 'B', 'C', 'D', 'E']

function nextParalelo(existing: string[]): string | null {
  for (const p of PARALELOS_SEQ) if (!existing.includes(p)) return p
  return null
}

export function ConfiguracionTabs({ periodos, carreras, canEdit, isAdmin, usuarios = [] }: Props) {
  const [tab, setTab] = useState<'paralelos' | 'sedes' | 'limites' | 'usuarios'>('paralelos')
  const [periodoId, setPeriodoId] = useState<number>(periodos[0]?.id ?? 0)
  const [carreraId, setCarreraId] = useState<number>(carreras[0]?.id ?? 0)
  const [addState, setAddState] = useState<{ nivel: number; jornada: string; sede: string } | null>(null)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const periodo = periodos.find(p => p.id === periodoId)
  const nps = periodo?.nivelesParalelos.filter(np => np.carreraId === carreraId) ?? []

  // Group by jornada+sede
  const combos: Record<string, { jornada: string; sede: string }> = {}
  for (const np of nps) {
    const key = `${np.jornada}|${np.sede}`
    combos[key] = { jornada: np.jornada, sede: np.sede }
  }

  // Unique sede+jornada combos for the selected period (all carreras) — for sedes tab
  const sedesDelPeriodo: { sede: string; jornada: string }[] = []
  const seenSedes = new Set<string>()
  for (const np of periodo?.nivelesParalelos ?? []) {
    const key = `${np.sede}|${np.jornada}`
    if (!seenSedes.has(key)) { seenSedes.add(key); sedesDelPeriodo.push({ sede: np.sede, jornada: np.jornada }) }
  }

  function handleAgregar(nivel: number, jornada: string, sede: string) {
    const existing = nps.filter(np => np.nivel === nivel && np.jornada === jornada && np.sede === sede).map(np => np.paralelo)
    const next = nextParalelo(existing)
    if (!next) { toast('Máximo de paralelos alcanzado', 'error'); return }

    const fd = new FormData()
    fd.set('periodoId', String(periodoId)); fd.set('carreraId', String(carreraId))
    fd.set('nivel', String(nivel)); fd.set('paralelo', next)
    fd.set('jornada', jornada); fd.set('sede', sede)

    startTransition(async () => {
      const res = await agregarParalelo(undefined, fd)
      if (res?.error) toast(String(res.error), 'error')
      else { toast(`Paralelo ${next} agregado`); router.refresh() }
    })
  }

  function handleEliminarParalelo(id: number, label: string) {
    startTransition(async () => {
      const res = await eliminarParalelo(id)
      if (res?.error) toast(res.error, 'error')
      else { toast(`Paralelo ${label} eliminado`); router.refresh() }
    })
  }

  function handleEliminarSede(sede: string, jornada: string) {
    startTransition(async () => {
      const res = await eliminarSede(periodoId, sede, jornada)
      if (res?.error) toast(res.error, 'error')
      else { toast(`Sede ${sede} ${jornada === 'MATUTINA' ? 'Matutina' : 'Nocturna'} eliminada`); router.refresh() }
    })
  }

  function handleAddNueva() {
    if (!addState) return
    const existing = nps.filter(np => np.nivel === addState.nivel && np.jornada === addState.jornada && np.sede === addState.sede).map(np => np.paralelo)
    const next = nextParalelo(existing)
    if (!next) { toast('Máximo de paralelos alcanzado', 'error'); return }

    const fd = new FormData()
    fd.set('periodoId', String(periodoId)); fd.set('carreraId', String(carreraId))
    fd.set('nivel', String(addState.nivel)); fd.set('paralelo', next)
    fd.set('jornada', addState.jornada); fd.set('sede', addState.sede)

    startTransition(async () => {
      const res = await agregarParalelo(undefined, fd)
      if (res?.error) toast(String(res.error), 'error')
      else { toast('Nueva combinación agregada'); setAddState(null); router.refresh() }
    })
  }

  const TAB_STYLE = (t: string) => ({
    padding: '8px 16px', fontSize: '12px',
    fontWeight: tab === t ? 700 : 400,
    color: tab === t ? '#CC0000' : '#556572',
    borderTop: 'none', borderLeft: 'none', borderRight: 'none',
    borderBottom: tab === t ? '2px solid #CC0000' : '2px solid transparent',
    cursor: 'pointer', background: 'none',
  } as React.CSSProperties)

  const btnDisabled = isPending || !canEdit

  return (
    <div>
      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #C7CDD1', marginBottom: '24px' }}>
        <button style={TAB_STYLE('paralelos')} onClick={() => setTab('paralelos')}>Paralelos</button>
        <button style={TAB_STYLE('sedes')} onClick={() => setTab('sedes')}>Sedes</button>
        <button style={TAB_STYLE('limites')} onClick={() => setTab('limites')}>Límites de carga</button>
        {isAdmin && <button style={TAB_STYLE('usuarios')} onClick={() => setTab('usuarios')}>Usuarios</button>}
      </div>

      {/* PARALELOS */}
      {tab === 'paralelos' && (
        <div>
          <div className="flex gap-3 mb-6" style={{ maxWidth: '500px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#556572', marginBottom: '4px' }}>Periodo</label>
              <select value={periodoId} onChange={e => setPeriodoId(Number(e.target.value))}
                style={{ width: '100%', border: '1px solid #C7CDD1', borderRadius: '4px', padding: '7px 10px', fontSize: '12px', color: '#2D3B45', background: 'white' }}>
                {periodos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#556572', marginBottom: '4px' }}>Carrera</label>
              <select value={carreraId} onChange={e => setCarreraId(Number(e.target.value))}
                style={{ width: '100%', border: '1px solid #C7CDD1', borderRadius: '4px', padding: '7px 10px', fontSize: '12px', color: '#2D3B45', background: 'white' }}>
                {carreras.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
            </div>
          </div>

          {Object.keys(combos).length === 0 ? (
            <p style={{ fontSize: '13px', color: '#8B969D' }}>No hay paralelos para este periodo/carrera.</p>
          ) : (
            <div className="flex flex-col gap-4">
              {Object.entries(combos).map(([key, combo]) => (
                <div key={key} style={{ background: 'white', border: '1px solid #C7CDD1', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ padding: '10px 16px', background: '#F5F5F5', borderBottom: '1px solid #EEF0F2' }}>
                    <p style={{ fontSize: '12px', fontWeight: 700, color: '#2D3B45' }}>
                      {combo.sede} — {combo.jornada === 'MATUTINA' ? 'Matutina' : 'Nocturna'}
                    </p>
                  </div>
                  {[1, 2, 3, 4, 5].map(nivel => {
                    const filas = nps.filter(np => np.nivel === nivel && np.jornada === combo.jornada && np.sede === combo.sede)
                    return (
                      <div key={nivel} style={{ display: 'flex', alignItems: 'center', padding: '10px 16px', borderBottom: nivel < 5 ? '1px solid #EEF0F2' : 'none', gap: '12px' }}>
                        <span style={{ fontSize: '12px', fontWeight: 700, color: '#556572', width: '52px', flexShrink: 0 }}>Nivel {nivel}</span>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', flex: 1 }}>
                          {filas.map(np => (
                            <span key={np.id} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', background: '#F5F5F5', border: '1px solid #C7CDD1', color: '#2D3B45' }}>
                              Par. {np.paralelo}
                              <button
                                onClick={() => handleEliminarParalelo(np.id, np.paralelo)}
                                disabled={btnDisabled}
                                style={{ background: 'none', border: 'none', cursor: btnDisabled ? 'wait' : 'pointer', color: '#CC0000', fontSize: '12px', padding: '0 0 0 2px', lineHeight: 1, opacity: btnDisabled ? 0.5 : 1 }}
                                title="Eliminar"
                              >×</button>
                            </span>
                          ))}
                          <button
                            onClick={() => handleAgregar(nivel, combo.jornada, combo.sede)}
                            disabled={btnDisabled}
                            style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '4px', border: '1px dashed #C7CDD1', background: 'none', color: btnDisabled ? '#C7CDD1' : '#8B969D', cursor: btnDisabled ? 'wait' : 'pointer' }}
                          >
                            {isPending ? '...' : '+ Añadir'}
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          )}

          <div style={{ marginTop: '20px' }}>
            {addState === null ? (
              <button
                onClick={() => setAddState({ nivel: 1, jornada: 'MATUTINA', sede: 'QUITO' })}
                disabled={btnDisabled}
                style={{ fontSize: '12px', padding: '7px 16px', borderRadius: '4px', border: '1px dashed #C7CDD1', background: 'none', color: btnDisabled ? '#C7CDD1' : '#556572', cursor: btnDisabled ? 'wait' : 'pointer' }}
              >
                + Nueva combinación sede/jornada
              </button>
            ) : (
              <div style={{ background: 'white', border: '1px solid #C7CDD1', borderRadius: '4px', padding: '16px', maxWidth: '500px' }}>
                <p className="section-title mb-4">Nueva combinación</p>
                <div className="flex flex-col gap-3">
                  <div className="flex gap-3">
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#556572', marginBottom: '4px' }}>Sede</label>
                      <input value={addState.sede} onChange={e => setAddState(s => s && ({ ...s, sede: e.target.value }))} placeholder="Ej: QUITO"
                        style={{ width: '100%', border: '1px solid #C7CDD1', borderRadius: '4px', padding: '7px 10px', fontSize: '12px' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#556572', marginBottom: '4px' }}>Jornada</label>
                      <select value={addState.jornada} onChange={e => setAddState(s => s && ({ ...s, jornada: e.target.value }))}
                        style={{ width: '100%', border: '1px solid #C7CDD1', borderRadius: '4px', padding: '7px 10px', fontSize: '12px', background: 'white' }}>
                        <option value="MATUTINA">Matutina</option>
                        <option value="NOCTURNA">Nocturna</option>
                      </select>
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#556572', marginBottom: '4px' }}>Nivel</label>
                      <select value={addState.nivel} onChange={e => setAddState(s => s && ({ ...s, nivel: Number(e.target.value) }))}
                        style={{ width: '100%', border: '1px solid #C7CDD1', borderRadius: '4px', padding: '7px 10px', fontSize: '12px', background: 'white' }}>
                        {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>Nivel {n}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={handleAddNueva} disabled={btnDisabled}
                      style={{ fontSize: '12px', padding: '6px 16px', borderRadius: '4px', border: 'none', backgroundColor: btnDisabled ? '#E5E7EB' : '#CC0000', color: btnDisabled ? '#8B969D' : 'white', cursor: btnDisabled ? 'wait' : 'pointer' }}>
                      {isPending ? 'Agregando...' : 'Agregar'}
                    </button>
                    <button onClick={() => setAddState(null)} disabled={btnDisabled}
                      style={{ fontSize: '12px', padding: '6px 14px', borderRadius: '4px', border: '1px solid #C7CDD1', background: 'none', color: '#556572', cursor: btnDisabled ? 'wait' : 'pointer' }}>
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SEDES */}
      {tab === 'sedes' && (
        <div>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#556572', marginBottom: '4px' }}>Periodo</label>
            <select value={periodoId} onChange={e => setPeriodoId(Number(e.target.value))}
              style={{ border: '1px solid #C7CDD1', borderRadius: '4px', padding: '7px 10px', fontSize: '12px', color: '#2D3B45', background: 'white', minWidth: 200 }}>
              {periodos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
            </select>
          </div>

          <p style={{ fontSize: '12px', color: '#8B969D', marginBottom: '12px' }}>
            Combinaciones sede+jornada configuradas en este periodo. Eliminar una sede borra todos sus paralelos.
          </p>

          {sedesDelPeriodo.length === 0 ? (
            <p style={{ fontSize: '13px', color: '#8B969D' }}>No hay paralelos configurados. Ve a la pestaña Paralelos.</p>
          ) : (
            <div style={{ background: 'white', border: '1px solid #C7CDD1', borderRadius: '4px' }}>
              {sedesDelPeriodo.map(({ sede, jornada }, i) => {
                const isLast = sedesDelPeriodo.length === 1
                return (
                  <div key={`${sede}|${jornada}`} style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', borderBottom: i < sedesDelPeriodo.length - 1 ? '1px solid #EEF0F2' : 'none' }}>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#2D3B45', flex: 1 }}>{sede}</span>
                    <span style={{ fontSize: '12px', color: '#556572', marginRight: 16 }}>{jornada === 'MATUTINA' ? 'Matutina' : 'Nocturna'}</span>
                    <button
                      onClick={() => handleEliminarSede(sede, jornada)}
                      disabled={btnDisabled || isLast}
                      title={isLast ? 'Debe quedar al menos una sede' : 'Eliminar sede'}
                      style={{
                        fontSize: '12px', padding: '4px 12px', borderRadius: '4px',
                        border: '1px solid #FFCCCC',
                        backgroundColor: (btnDisabled || isLast) ? '#F5F5F5' : '#FFF1F1',
                        color: (btnDisabled || isLast) ? '#C7CDD1' : '#CC0000',
                        cursor: (btnDisabled || isLast) ? 'not-allowed' : 'pointer',
                      }}
                    >
                      {isPending ? '...' : 'Eliminar'}
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* USUARIOS — solo ADMIN */}
      {tab === 'usuarios' && isAdmin && (
        <UsuariosTab usuarios={usuarios} />
      )}

      {/* LÍMITES */}
      {tab === 'limites' && (
        <div style={{ maxWidth: '480px' }}>
          <p style={{ fontSize: '13px', color: '#8B969D', marginBottom: '16px' }}>
            Límites de horas por tipo de docente (por periodo completo = 3 módulos).
          </p>
          <div style={{ background: 'white', border: '1px solid #C7CDD1', borderRadius: '4px' }}>
            {[
              { tipo: 'TC', label: 'Tiempo Completo', min: 272, max: 380, color: '#CC0000', bg: '#FFF1F1', border: '#FFCCCC' },
              { tipo: 'MT', label: 'Medio Tiempo',    min: 136, max: 190, color: '#E8A000', bg: '#FFF8E6', border: '#F5D080' },
              { tipo: 'TP', label: 'Tiempo Parcial',  min: 0,   max: null, color: '#0374B5', bg: '#EEF4FB', border: '#BDD4EE' },
            ].map(({ tipo, label, min, max, color, bg, border }, i) => (
              <div key={tipo} style={{ display: 'flex', alignItems: 'center', padding: '14px 16px', borderBottom: i < 2 ? '1px solid #EEF0F2' : 'none', gap: '12px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '99px', backgroundColor: bg, color, border: `1px solid ${border}` }}>{tipo}</span>
                <span style={{ fontSize: '13px', color: '#2D3B45', flex: 1 }}>{label}</span>
                <span style={{ fontSize: '12px', color: '#556572' }}>{max ? `${min}h — ${max}h` : 'Sin límite'}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
