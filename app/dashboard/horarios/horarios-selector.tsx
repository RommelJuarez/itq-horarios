'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Modulo {
  id: number
  numero: number
  nombre: string
  fechaInicio: Date
  fechaFin: Date
}

interface Periodo {
  id: number
  nombre: string
  modulos: Modulo[]
}

interface Carrera {
  id: number
  nombre: string
}

interface Sede {
  sede: string
  jornada: string
}

interface Props {
  periodos: Periodo[]
  carreras: Carrera[]
  sedes: Sede[]
}

const MOD_COLORS = ['#CC0000', '#0374B5', '#0B874B']

function fmt(d: Date) {
  return new Date(d).toLocaleDateString('es-EC', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function HorariosSelector({ periodos, carreras, sedes }: Props) {
  const [moduloId, setModuloId] = useState<number | null>(null)
  const [sede, setSede] = useState<Sede | null>(null)
  const [carreraId, setCarreraId] = useState<number | null>(null)
  const router = useRouter()

  const allModulos = periodos.flatMap(p => p.modulos)
  const moduloSel = allModulos.find(m => m.id === moduloId)
  const carreraSel = carreras.find(c => c.id === carreraId)

  function handleIr() {
    if (!moduloId || !sede || !carreraId) return
    const url = `/dashboard/horarios/${moduloId}?carreraId=${carreraId}&jornada=${sede.jornada}&sede=${encodeURIComponent(sede.sede)}`
    router.push(url)
  }

  return (
    <div style={{ maxWidth: '700px' }}>
      {/* Breadcrumb */}
      {(moduloSel || sede || carreraSel) && (
        <p style={{ fontSize: '12px', color: '#8B969D', marginBottom: '20px' }}>
          {moduloSel?.nombre ?? '—'}
          {sede && ` › ${sede.sede} ${sede.jornada === 'MATUTINA' ? 'Matutina' : 'Nocturna'}`}
          {carreraSel && ` › ${carreraSel.nombre}`}
        </p>
      )}

      {/* Paso 1 — Módulo */}
      <div style={{ marginBottom: '28px' }}>
        <p className="section-title" style={{ marginBottom: '12px' }}>Paso 1 — Selecciona el módulo</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {periodos.map(periodo => (
            <div key={periodo.id}>
              <p style={{ fontSize: '11px', color: '#8B969D', marginBottom: '6px', fontWeight: 600 }}>{periodo.nombre}</p>
              <div style={{ display: 'flex', gap: '8px' }}>
                {periodo.modulos.map((m, i) => (
                  <button
                    key={m.id}
                    onClick={() => { setModuloId(m.id); setSede(null); setCarreraId(null) }}
                    style={{
                      flex: 1,
                      padding: '12px 14px',
                      borderRadius: '4px',
                      border: moduloId === m.id ? `2px solid ${MOD_COLORS[i]}` : '1px solid #C7CDD1',
                      backgroundColor: moduloId === m.id ? 'white' : 'white',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: MOD_COLORS[i], marginBottom: '6px' }} />
                    <p style={{ fontSize: '12px', fontWeight: 700, color: '#2D3B45', marginBottom: '2px' }}>{m.nombre}</p>
                    <p style={{ fontSize: '10px', color: '#8B969D' }}>{fmt(m.fechaInicio)} → {fmt(m.fechaFin)}</p>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        {periodos.length === 0 && (
          <p style={{ fontSize: '13px', color: '#8B969D' }}>No hay periodos activos. Crea uno en Periodos.</p>
        )}
      </div>

      {/* Paso 2 — Sede/Jornada */}
      {moduloId && (
        <div style={{ marginBottom: '28px' }}>
          <p className="section-title" style={{ marginBottom: '12px' }}>Paso 2 — Selecciona la jornada</p>
          {sedes.length === 0 ? (
            <p style={{ fontSize: '13px', color: '#8B969D' }}>
              No hay paralelos configurados. Ve a Configuración → Paralelos.
            </p>
          ) : (
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {sedes.map(s => {
                const key = `${s.sede}|${s.jornada}`
                const selKey = sede ? `${sede.sede}|${sede.jornada}` : ''
                return (
                  <button
                    key={key}
                    onClick={() => { setSede(s); setCarreraId(null) }}
                    style={{
                      padding: '10px 16px',
                      borderRadius: '4px',
                      border: selKey === key ? '2px solid #CC0000' : '1px solid #C7CDD1',
                      backgroundColor: 'white',
                      cursor: 'pointer',
                    }}
                  >
                    <p style={{ fontSize: '12px', fontWeight: 700, color: '#2D3B45' }}>{s.sede}</p>
                    <p style={{ fontSize: '10px', color: '#8B969D' }}>{s.jornada === 'MATUTINA' ? 'Matutina' : 'Nocturna'}</p>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Paso 3 — Carrera */}
      {moduloId && sede && (
        <div style={{ marginBottom: '28px' }}>
          <p className="section-title" style={{ marginBottom: '12px' }}>Paso 3 — Selecciona la carrera</p>
          <div style={{ background: 'white', border: '1px solid #C7CDD1', borderRadius: '4px' }}>
            {carreras.map((c, i) => (
              <button
                key={c.id}
                onClick={() => setCarreraId(c.id)}
                style={{
                  width: '100%',
                  display: 'block',
                  padding: '12px 16px',
                  textAlign: 'left',
                  border: 'none',
                  borderBottom: i < carreras.length - 1 ? '1px solid #EEF0F2' : 'none',
                  borderLeft: carreraId === c.id ? '3px solid #CC0000' : '3px solid transparent',
                  backgroundColor: carreraId === c.id ? '#FFF8F8' : 'white',
                  cursor: 'pointer',
                }}
              >
                <p style={{ fontSize: '13px', fontWeight: carreraId === c.id ? 700 : 400, color: '#2D3B45' }}>{c.nombre}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Ir */}
      {moduloId && sede && carreraId && (
        <button
          onClick={handleIr}
          style={{ backgroundColor: '#CC0000', color: 'white', fontSize: '13px', padding: '10px 24px', borderRadius: '4px', border: 'none', cursor: 'pointer', fontWeight: 600 }}
        >
          Ver tabla de horarios →
        </button>
      )}
    </div>
  )
}
