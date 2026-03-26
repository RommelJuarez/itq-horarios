'use client'

import { useState } from 'react'

interface Props {
  tablaContent: React.ReactNode
  semanalContent: React.ReactNode
  totalContent: React.ReactNode
}

export function TabsCliente({ tablaContent, semanalContent, totalContent }: Props) {
  const [tab, setTab] = useState<'horario' | 'semanal' | 'total'>('horario')

  const TAB = (t: typeof tab) => ({
    padding: '8px 16px', fontSize: '12px',
    fontWeight: tab === t ? 700 : 400,
    color: tab === t ? '#CC0000' : '#556572',
    borderTop: 'none', borderLeft: 'none', borderRight: 'none',
    borderBottom: tab === t ? '2px solid #CC0000' : '2px solid transparent',
    background: 'none', cursor: 'pointer',
  } as React.CSSProperties)

  return (
    <div>
      <div style={{ display: 'flex', borderBottom: '1px solid #C7CDD1', marginBottom: '20px' }}>
        <button style={TAB('horario')} onClick={() => setTab('horario')}>Horario</button>
        <button style={TAB('semanal')} onClick={() => setTab('semanal')}>Carga semanal</button>
        <button style={TAB('total')} onClick={() => setTab('total')}>Carga total</button>
      </div>
      {tab === 'horario' && tablaContent}
      {tab === 'semanal' && semanalContent}
      {tab === 'total' && totalContent}
    </div>
  )
}
