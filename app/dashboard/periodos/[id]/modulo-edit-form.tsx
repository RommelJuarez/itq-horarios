'use client'

import { useFormState } from 'react-dom'
import { actualizarModulo } from '@/lib/actions/modulos'

type ModuloLike = { id: number; nombre: string; horasMatutino: number; horasNocturno: number }
type FormState = { error?: string; errors?: Record<string, string[]>; success?: boolean } | undefined

interface Props {
  modulo: ModuloLike
  periodoId: number
  color: string
  defaultFechaInicio: string
  defaultFechaFin: string
}

export function ModuloEditForm({ modulo, periodoId, color, defaultFechaInicio, defaultFechaFin }: Props) {
  const action = actualizarModulo.bind(null, modulo.id, periodoId)
  const [state, formAction] = useFormState(action, undefined)

  return (
    <form
      action={formAction}
      style={{ background: 'white', border: '1px solid #C7CDD1', borderRadius: '4px', borderLeft: `4px solid ${color}`, padding: '18px' }}
    >
      <div className="flex items-center justify-between mb-4">
        <p style={{ fontSize: '13px', fontWeight: 700, color: '#2D3B45' }}>{modulo.nombre}</p>
        {state?.success && <span style={{ fontSize: '11px', color: '#0B874B' }}>Guardado ✓</span>}
        {state?.error && <span style={{ fontSize: '11px', color: '#CC0000' }}>{state.error}</span>}
      </div>

      <input type="hidden" name="nombre" value={modulo.nombre} />

      <div className="flex flex-col gap-3">
        <div className="flex gap-3">
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#556572', marginBottom: '4px' }}>Fecha inicio</label>
            <input
              name="fechaInicio"
              type="date"
              defaultValue={defaultFechaInicio}
              style={{ width: '100%', border: '1px solid #C7CDD1', borderRadius: '4px', padding: '7px 10px', fontSize: '12px', color: '#2D3B45' }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#556572', marginBottom: '4px' }}>Fecha fin</label>
            <input
              name="fechaFin"
              type="date"
              defaultValue={defaultFechaFin}
              style={{ width: '100%', border: '1px solid #C7CDD1', borderRadius: '4px', padding: '7px 10px', fontSize: '12px', color: '#2D3B45' }}
            />
          </div>
        </div>
        <div className="flex gap-3">
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#556572', marginBottom: '4px' }}>Horas matutino</label>
            <input
              name="horasMatutino"
              type="number"
              defaultValue={modulo.horasMatutino}
              min={1}
              style={{ width: '100%', border: '1px solid #C7CDD1', borderRadius: '4px', padding: '7px 10px', fontSize: '12px', color: '#2D3B45' }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#556572', marginBottom: '4px' }}>Horas nocturno</label>
            <input
              name="horasNocturno"
              type="number"
              defaultValue={modulo.horasNocturno}
              min={1}
              style={{ width: '100%', border: '1px solid #C7CDD1', borderRadius: '4px', padding: '7px 10px', fontSize: '12px', color: '#2D3B45' }}
            />
          </div>
        </div>
        <div>
          <button
            type="submit"
            style={{ fontSize: '12px', padding: '6px 16px', borderRadius: '4px', border: 'none', backgroundColor: color, color: 'white', cursor: 'pointer' }}
          >
            Guardar módulo
          </button>
        </div>
      </div>
    </form>
  )
}
