'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { useEffect } from 'react'
import Link from 'next/link'
import { toast } from '@/components/ui/toast'

type FormState = { error?: string; errors?: Record<string, string[]>; success?: boolean } | undefined

interface Props {
  action: (state: FormState, formData: FormData) => Promise<FormState>
  defaultValues?: { nombre?: string; tipo?: string; especialidad?: string; activo?: boolean }
  isEdit?: boolean
}

function SubmitButton({ isEdit }: { isEdit?: boolean }) {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      style={{
        backgroundColor: pending ? '#E5E7EB' : '#CC0000',
        color: pending ? '#8B969D' : 'white',
        fontSize: '13px', padding: '8px 20px', borderRadius: '4px',
        border: 'none', cursor: pending ? 'wait' : 'pointer',
        minWidth: 130,
      }}
    >
      {pending ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear docente'}
    </button>
  )
}

export function DocenteForm({ action, defaultValues = {}, isEdit }: Props) {
  const [state, formAction] = useFormState(action, undefined)

  useEffect(() => {
    if (state?.success) toast(isEdit ? 'Docente actualizado' : 'Docente creado')
    if (state?.error)   toast(state.error, 'error')
  }, [state, isEdit])

  return (
    <form action={formAction} className="flex flex-col gap-4" style={{ maxWidth: '480px' }}>
      {state?.error && (
        <div style={{ background: '#FFF1F1', border: '1px solid #FFCCCC', color: '#CC0000', fontSize: '13px', padding: '10px 14px', borderRadius: '4px' }}>
          {state.error}
        </div>
      )}

      <div>
        <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#556572', marginBottom: '5px' }}>
          Nombre completo *
        </label>
        <input
          name="nombre"
          defaultValue={defaultValues.nombre}
          required
          style={{ width: '100%', border: '1px solid #C7CDD1', borderRadius: '4px', padding: '8px 10px', fontSize: '13px', color: '#2D3B45' }}
        />
        {state?.errors?.nombre && (
          <p style={{ fontSize: '11px', color: '#CC0000', marginTop: '3px' }}>{state.errors.nombre[0]}</p>
        )}
      </div>

      <div>
        <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#556572', marginBottom: '5px' }}>
          Tipo *
        </label>
        <select
          name="tipo"
          defaultValue={defaultValues.tipo ?? 'TC'}
          style={{ width: '100%', border: '1px solid #C7CDD1', borderRadius: '4px', padding: '8px 10px', fontSize: '13px', color: '#2D3B45', background: 'white' }}
        >
          <option value="TC">TC — Tiempo Completo</option>
          <option value="MT">MT — Medio Tiempo</option>
          <option value="TP">TP — Tiempo Parcial</option>
        </select>
        {state?.errors?.tipo && (
          <p style={{ fontSize: '11px', color: '#CC0000', marginTop: '3px' }}>{state.errors.tipo[0]}</p>
        )}
      </div>

      <div>
        <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#556572', marginBottom: '5px' }}>
          Especialidad
        </label>
        <input
          name="especialidad"
          defaultValue={defaultValues.especialidad ?? ''}
          style={{ width: '100%', border: '1px solid #C7CDD1', borderRadius: '4px', padding: '8px 10px', fontSize: '13px', color: '#2D3B45' }}
        />
      </div>

      {isEdit && (
        <p style={{ fontSize: '11px', color: '#8B969D' }}>
          Los límites de horas se calculan automáticamente según el tipo.
        </p>
      )}

      <div className="flex gap-3 pt-2">
        <SubmitButton isEdit={isEdit} />
        <Link
          href="/dashboard/docentes"
          style={{ fontSize: '13px', color: '#556572', padding: '8px 16px', border: '1px solid #C7CDD1', borderRadius: '4px' }}
        >
          Cancelar
        </Link>
      </div>
    </form>
  )
}
