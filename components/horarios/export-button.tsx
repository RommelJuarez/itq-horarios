'use client'

import { useState } from 'react'
import { toast } from '@/components/ui/toast'

interface Props {
  periodoId: number
  carreraId: number
  jornada: 'MATUTINA' | 'NOCTURNA'
  sede: string
  label?: string
}

export function ExportButton({ periodoId, carreraId, jornada, sede, label }: Props) {
  const [loading, setLoading] = useState(false)

  async function handleExport() {
    setLoading(true)
    try {
      const url = `/api/exportar/horarios?periodoId=${periodoId}&carreraId=${carreraId}&jornada=${jornada}&sede=${sede}`
      const res = await fetch(url)

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        toast(data.error ?? 'Error al generar el Excel', 'error')
        return
      }

      const blob = await res.blob()
      const a    = document.createElement('a')
      a.href     = URL.createObjectURL(blob)
      a.download = `horarios-${sede}-${jornada.toLowerCase()}.xlsx`
      a.click()
      URL.revokeObjectURL(a.href)
      toast('Excel generado correctamente')
    } catch {
      toast('Error al conectar con el servidor', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleExport}
      disabled={loading}
      style={{
        display: 'flex', alignItems: 'center', gap: 6,
        fontSize: 12, padding: '6px 14px', borderRadius: 4,
        border: '1px solid #C7CDD1',
        backgroundColor: loading ? '#F5F5F5' : 'white',
        color: loading ? '#8B969D' : '#2D3B45',
        cursor: loading ? 'wait' : 'pointer',
        fontWeight: 500,
      }}
    >
      {loading ? (
        <>
          <span style={{ fontSize: 14 }}>⏳</span> Generando...
        </>
      ) : (
        <>
          <span style={{ fontSize: 14 }}>⬇</span> {label ?? 'Exportar Excel'}
        </>
      )}
    </button>
  )
}
