'use client'

import { useState, useTransition } from 'react'
import { toast } from '@/components/ui/toast'

interface Props {
  id: number
  activo: boolean
  toggle: (id: number, activo: boolean) => Promise<{ error?: string; success?: boolean }>
}

export function ToggleActivoButton({ id, activo, toggle }: Props) {
  const [current, setCurrent] = useState(activo)
  const [isPending, startTransition] = useTransition()

  function handleClick() {
    startTransition(async () => {
      const res = await toggle(id, current)
      if (res?.error) {
        toast(res.error, 'error')
      } else {
        setCurrent(prev => !prev)
        toast(current ? 'Docente desactivado' : 'Docente activado')
      }
    })
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      style={{
        fontSize: '12px', padding: '6px 14px', borderRadius: '4px',
        border: '1px solid #C7CDD1',
        backgroundColor: isPending ? '#F5F5F5' : 'white',
        color: isPending ? '#8B969D' : current ? '#CC0000' : '#0B874B',
        cursor: isPending ? 'wait' : 'pointer',
      }}
    >
      {isPending ? '...' : current ? 'Desactivar' : 'Activar'}
    </button>
  )
}
