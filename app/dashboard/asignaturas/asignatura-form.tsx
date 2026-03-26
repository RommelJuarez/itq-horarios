'use client'

import { useFormState } from 'react-dom'
import Link from 'next/link'

type FormState = { error?: string; errors?: Record<string, string[]>; success?: boolean } | undefined

interface Carrera {
  id: number
  nombre: string
}

interface Props {
  action: (state: FormState, formData: FormData) => Promise<FormState>
  carreras: Carrera[]
  defaultValues?: {
    carreraId?: number
    nombre?: string
    codigo?: string
    nivel?: number
    horasMatutino?: number
    horasNocturno?: number
  }
  isEdit?: boolean
}

export function AsignaturaForm({ action, carreras, defaultValues = {}, isEdit }: Props) {
  const [state, formAction] = useFormState(action, undefined)

  return (
    <form action={formAction} className="flex flex-col gap-4" style={{ maxWidth: '480px' }}>
      {state?.error && (
        <div style={{ background: '#FFF1F1', border: '1px solid #FFCCCC', color: '#CC0000', fontSize: '13px', padding: '10px 14px', borderRadius: '4px' }}>
          {state.error}
        </div>
      )}

      <div>
        <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#556572', marginBottom: '5px' }}>Carrera *</label>
        <select
          name="carreraId"
          defaultValue={defaultValues.carreraId}
          style={{ width: '100%', border: '1px solid #C7CDD1', borderRadius: '4px', padding: '8px 10px', fontSize: '13px', color: '#2D3B45', background: 'white' }}
        >
          <option value="">— Selecciona —</option>
          {carreras.map(c => (
            <option key={c.id} value={c.id}>{c.nombre}</option>
          ))}
        </select>
        {state?.errors?.carreraId && <p style={{ fontSize: '11px', color: '#CC0000', marginTop: '3px' }}>{state.errors.carreraId[0]}</p>}
      </div>

      <div>
        <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#556572', marginBottom: '5px' }}>Nombre *</label>
        <input
          name="nombre"
          defaultValue={defaultValues.nombre}
          required
          style={{ width: '100%', border: '1px solid #C7CDD1', borderRadius: '4px', padding: '8px 10px', fontSize: '13px', color: '#2D3B45' }}
        />
        {state?.errors?.nombre && <p style={{ fontSize: '11px', color: '#CC0000', marginTop: '3px' }}>{state.errors.nombre[0]}</p>}
      </div>

      <div className="flex gap-3">
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#556572', marginBottom: '5px' }}>Nivel (1-5) *</label>
          <select
            name="nivel"
            defaultValue={defaultValues.nivel ?? 1}
            style={{ width: '100%', border: '1px solid #C7CDD1', borderRadius: '4px', padding: '8px 10px', fontSize: '13px', color: '#2D3B45', background: 'white' }}
          >
            {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>Nivel {n}</option>)}
          </select>
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#556572', marginBottom: '5px' }}>Código</label>
          <input
            name="codigo"
            defaultValue={defaultValues.codigo ?? ''}
            placeholder="Ej: DS-201"
            style={{ width: '100%', border: '1px solid #C7CDD1', borderRadius: '4px', padding: '8px 10px', fontSize: '13px', color: '#2D3B45' }}
          />
        </div>
      </div>

      <div className="flex gap-3">
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#556572', marginBottom: '5px' }}>Horas matutino</label>
          <input
            name="horasMatutino"
            type="number"
            defaultValue={defaultValues.horasMatutino ?? 36}
            min={1}
            style={{ width: '100%', border: '1px solid #C7CDD1', borderRadius: '4px', padding: '8px 10px', fontSize: '13px', color: '#2D3B45' }}
          />
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#556572', marginBottom: '5px' }}>Horas nocturno</label>
          <input
            name="horasNocturno"
            type="number"
            defaultValue={defaultValues.horasNocturno ?? 27}
            min={1}
            style={{ width: '100%', border: '1px solid #C7CDD1', borderRadius: '4px', padding: '8px 10px', fontSize: '13px', color: '#2D3B45' }}
          />
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          style={{ backgroundColor: '#CC0000', color: 'white', fontSize: '13px', padding: '8px 20px', borderRadius: '4px', border: 'none', cursor: 'pointer' }}
        >
          {isEdit ? 'Guardar cambios' : 'Crear asignatura'}
        </button>
        <Link
          href="/dashboard/asignaturas"
          style={{ fontSize: '13px', color: '#556572', padding: '8px 16px', border: '1px solid #C7CDD1', borderRadius: '4px' }}
        >
          Cancelar
        </Link>
      </div>
    </form>
  )
}
