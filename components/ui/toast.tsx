'use client'

import { useState, useEffect, useCallback } from 'react'

type ToastItem = { id: number; msg: string; type: 'success' | 'error' }
type Listener = (t: ToastItem) => void

const listeners = new Set<Listener>()

export function toast(msg: string, type: 'success' | 'error' = 'success') {
  listeners.forEach(fn => fn({ id: Date.now(), msg, type }))
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const add = useCallback((t: ToastItem) => {
    setToasts(prev => [...prev, t])
    setTimeout(() => setToasts(prev => prev.filter(x => x.id !== t.id)), 3500)
  }, [])

  useEffect(() => {
    listeners.add(add)
    return () => { listeners.delete(add) }
  }, [add])

  if (toasts.length === 0) return null

  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24,
      display: 'flex', flexDirection: 'column', gap: 8,
      zIndex: 9999, pointerEvents: 'none',
    }}>
      {toasts.map(t => (
        <div key={t.id} style={{
          padding: '10px 18px', borderRadius: 6, fontSize: 13, fontWeight: 500,
          backgroundColor: t.type === 'success' ? '#0B874B' : '#CC0000',
          color: 'white', boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <span style={{ fontWeight: 700 }}>{t.type === 'success' ? '✓' : '✕'}</span>
          {t.msg}
        </div>
      ))}
    </div>
  )
}
