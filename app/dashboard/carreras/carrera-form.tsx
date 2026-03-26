'use client'

import { useFormState } from 'react-dom'
import Link from 'next/link'

type FormState = { error?: string; errors?: Record<string, string[]>; success?: boolean } | undefined

interface Props {
  action: (state: FormState, formData: FormData) => Promise<FormState>
  defaultValues?: { nombre?: string; codigo?: string; sede?: string }
  isEdit?: boolean
}

export function CarreraForm({ action, defaultValues = {}, isEdit }: Props) {
  const [state, formAction] = useFormState(action, undefined)

  return (
    <form action={formAction} className="flex flex-col gap-4" style={{ maxWidth: '420px' }}>
      {state?.error && (
        <div style={{ background: '#FFF1F1', border: '1px solid #FFCCCC', color: '#CC0000', fontSize: '13px', padding: '10px 14px', borderRadius: '4px' }}>
          {state.error}
        </div>
      )}
      {state?.success && (
        <div style={{ background: '#F0FFF7', border: '1px solid #BBDDCC', color: '#0B874B', fontSize: '13px', padding: '10px 14px', borderRadius: '4px' }}>
          Guardado correctamente.
        </div>
      )}

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
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#556572', marginBottom: '5px' }}>Código *</label>
          <input
            name="codigo"
            defaultValue={defaultValues.codigo}
            placeholder="Ej: DS"
            required
            style={{ width: '100%', border: '1px solid #C7CDD1', borderRadius: '4px', padding: '8px 10px', fontSize: '13px', color: '#2D3B45' }}
          />
          {state?.errors?.codigo && <p style={{ fontSize: '11px', color: '#CC0000', marginTop: '3px' }}>{state.errors.codigo[0]}</p>}
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#556572', marginBottom: '5px' }}>Sede</label>
          <input
            name="sede"
            defaultValue={defaultValues.sede ?? 'QUITO'}
            style={{ width: '100%', border: '1px solid #C7CDD1', borderRadius: '4px', padding: '8px 10px', fontSize: '13px', color: '#2D3B45' }}
          />
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          style={{ backgroundColor: '#CC0000', color: 'white', fontSize: '13px', padding: '8px 20px', borderRadius: '4px', border: 'none', cursor: 'pointer' }}
        >
          {isEdit ? 'Guardar cambios' : 'Crear carrera'}
        </button>
        <Link
          href="/dashboard/carreras"
          style={{ fontSize: '13px', color: '#556572', padding: '8px 16px', border: '1px solid #C7CDD1', borderRadius: '4px' }}
        >
          Cancelar
        </Link>
      </div>
    </form>
  )
}
