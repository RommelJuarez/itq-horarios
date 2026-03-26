'use client'

import { useFormState } from 'react-dom'
import Link from 'next/link'

type FormState = { error?: string; errors?: Record<string, string[]>; success?: boolean } | undefined

interface Props {
  action: (state: FormState, formData: FormData) => Promise<FormState>
}

const MOD_NAMES = ['Módulo I', 'Módulo II', 'Módulo III']
const MOD_COLORS = ['#CC0000', '#0374B5', '#0B874B']

// Defaults: Periodo Marzo-Agosto 2026
const MOD_DEFAULTS = [
  { nombre: 'Módulo I', fechaInicio: '2026-03-24', fechaFin: '2026-04-17', horasMatutino: 36, horasNocturno: 27 },
  { nombre: 'Módulo II', fechaInicio: '2026-04-28', fechaFin: '2026-06-12', horasMatutino: 64, horasNocturno: 48 },
  { nombre: 'Módulo III', fechaInicio: '2026-06-23', fechaFin: '2026-07-17', horasMatutino: 36, horasNocturno: 27 },
]

export function PeriodoForm({ action }: Props) {
  const [state, formAction] = useFormState(action, undefined)

  return (
    <form action={formAction} className="flex flex-col gap-6" style={{ maxWidth: '600px' }}>
      {state?.error && (
        <div style={{ background: '#FFF1F1', border: '1px solid #FFCCCC', color: '#CC0000', fontSize: '13px', padding: '10px 14px', borderRadius: '4px' }}>
          {state.error}
        </div>
      )}

      {/* Datos del periodo */}
      <div style={{ background: 'white', border: '1px solid #C7CDD1', borderRadius: '4px', padding: '18px' }}>
        <p className="section-title mb-4">Datos del periodo</p>
        <div className="flex flex-col gap-4">
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#556572', marginBottom: '5px' }}>Nombre *</label>
            <input
              name="nombre"
              defaultValue="Periodo Marzo-Agosto 2026"
              required
              style={{ width: '100%', border: '1px solid #C7CDD1', borderRadius: '4px', padding: '8px 10px', fontSize: '13px', color: '#2D3B45' }}
            />
          </div>
          <div className="flex gap-3">
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#556572', marginBottom: '5px' }}>Año *</label>
              <input
                name="anio"
                type="number"
                defaultValue={2026}
                required
                style={{ width: '100%', border: '1px solid #C7CDD1', borderRadius: '4px', padding: '8px 10px', fontSize: '13px', color: '#2D3B45' }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#556572', marginBottom: '5px' }}>Número (1 o 2) *</label>
              <select
                name="numero"
                defaultValue={1}
                style={{ width: '100%', border: '1px solid #C7CDD1', borderRadius: '4px', padding: '8px 10px', fontSize: '13px', color: '#2D3B45', background: 'white' }}
              >
                <option value={1}>1 — Marzo-Agosto</option>
                <option value={2}>2 — Septiembre-Febrero</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3">
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#556572', marginBottom: '5px' }}>Fecha inicio *</label>
              <input
                name="fechaInicio"
                type="date"
                defaultValue="2026-03-24"
                required
                style={{ width: '100%', border: '1px solid #C7CDD1', borderRadius: '4px', padding: '8px 10px', fontSize: '13px', color: '#2D3B45' }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#556572', marginBottom: '5px' }}>Fecha fin *</label>
              <input
                name="fechaFin"
                type="date"
                defaultValue="2026-07-17"
                required
                style={{ width: '100%', border: '1px solid #C7CDD1', borderRadius: '4px', padding: '8px 10px', fontSize: '13px', color: '#2D3B45' }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Módulos */}
      {[1, 2, 3].map((num, i) => (
        <div key={num} style={{ background: 'white', border: '1px solid #C7CDD1', borderRadius: '4px', padding: '18px', borderLeft: `4px solid ${MOD_COLORS[i]}` }}>
          <p className="section-title mb-4">{MOD_NAMES[i]}</p>
          <input type="hidden" name={`modulo${num}_nombre`} value={MOD_DEFAULTS[i].nombre} />
          <div className="flex flex-col gap-3">
            <div className="flex gap-3">
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#556572', marginBottom: '5px' }}>Fecha inicio *</label>
                <input
                  name={`modulo${num}_fechaInicio`}
                  type="date"
                  defaultValue={MOD_DEFAULTS[i].fechaInicio}
                  required
                  style={{ width: '100%', border: '1px solid #C7CDD1', borderRadius: '4px', padding: '8px 10px', fontSize: '13px', color: '#2D3B45' }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#556572', marginBottom: '5px' }}>Fecha fin *</label>
                <input
                  name={`modulo${num}_fechaFin`}
                  type="date"
                  defaultValue={MOD_DEFAULTS[i].fechaFin}
                  required
                  style={{ width: '100%', border: '1px solid #C7CDD1', borderRadius: '4px', padding: '8px 10px', fontSize: '13px', color: '#2D3B45' }}
                />
              </div>
            </div>
            <div className="flex gap-3">
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#556572', marginBottom: '5px' }}>Horas matutino</label>
                <input
                  name={`modulo${num}_horasMatutino`}
                  type="number"
                  defaultValue={MOD_DEFAULTS[i].horasMatutino}
                  min={1}
                  style={{ width: '100%', border: '1px solid #C7CDD1', borderRadius: '4px', padding: '8px 10px', fontSize: '13px', color: '#2D3B45' }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#556572', marginBottom: '5px' }}>Horas nocturno</label>
                <input
                  name={`modulo${num}_horasNocturno`}
                  type="number"
                  defaultValue={MOD_DEFAULTS[i].horasNocturno}
                  min={1}
                  style={{ width: '100%', border: '1px solid #C7CDD1', borderRadius: '4px', padding: '8px 10px', fontSize: '13px', color: '#2D3B45' }}
                />
              </div>
            </div>
          </div>
        </div>
      ))}

      <div className="flex gap-3">
        <button
          type="submit"
          style={{ backgroundColor: '#CC0000', color: 'white', fontSize: '13px', padding: '8px 20px', borderRadius: '4px', border: 'none', cursor: 'pointer' }}
        >
          Crear periodo
        </button>
        <Link
          href="/dashboard/periodos"
          style={{ fontSize: '13px', color: '#556572', padding: '8px 16px', border: '1px solid #C7CDD1', borderRadius: '4px' }}
        >
          Cancelar
        </Link>
      </div>
    </form>
  )
}
