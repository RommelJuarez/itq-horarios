'use client'

import { useEffect, useState, useTransition } from 'react'
import { useFormState } from 'react-dom'
import { crearUsuario, toggleActivoUsuario } from '@/lib/actions/usuarios'
import { toast } from '@/components/ui/toast'

interface Usuario {
  id: number
  nombre: string
  email: string
  rol: string
  activo: boolean
}

interface Props {
  usuarios: Usuario[]
}

const ROL_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  ADMIN:          { bg: '#FFF1F1', text: '#CC0000',  border: '#FFCCCC' },
  COORDINADOR:    { bg: '#EEF4FB', text: '#0374B5',  border: '#BDD4EE' },
  DOCENTE:        { bg: '#F0FFF7', text: '#0B874B',  border: '#BBDDCC' },
  ADMINISTRATIVO: { bg: '#FFF8E6', text: '#E8A000',  border: '#F5D080' },
}

function ToggleActivoBtn({ id, activo }: { id: number; activo: boolean }) {
  const [localActivo, setLocalActivo] = useState(activo)
  const [isPending, startTransition] = useTransition()

  function handle() {
    const next = !localActivo
    setLocalActivo(next)
    startTransition(async () => {
      const res = await toggleActivoUsuario(id)
      if (res?.error) { setLocalActivo(!next); toast(res.error, 'error') }
      else toast(next ? 'Usuario activado' : 'Usuario desactivado')
    })
  }

  return (
    <button
      onClick={handle}
      disabled={isPending}
      style={{
        fontSize: '11px', padding: '2px 10px', borderRadius: '99px',
        backgroundColor: localActivo ? '#F0FFF7' : '#F5F5F5',
        color: localActivo ? '#0B874B' : '#8B969D',
        border: `1px solid ${localActivo ? '#BBDDCC' : '#C7CDD1'}`,
        cursor: isPending ? 'wait' : 'pointer',
        fontWeight: 700,
      }}
    >
      {localActivo ? 'Activo' : 'Inactivo'}
    </button>
  )
}

export function UsuariosTab({ usuarios }: Props) {
  const [mostrarForm, setMostrarForm] = useState(false)
  const [state, formAction] = useFormState(crearUsuario, undefined)

  useEffect(() => {
    if (state?.success) {
      toast('Usuario creado correctamente')
      setMostrarForm(false)
    }
    if (state?.error) toast(state.error, 'error')
  }, [state])

  const ROL_OPTS = ['ADMIN', 'COORDINADOR', 'DOCENTE', 'ADMINISTRATIVO']

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p style={{ fontSize: '13px', color: '#556572' }}>
          {usuarios.length} usuario{usuarios.length !== 1 ? 's' : ''} registrado{usuarios.length !== 1 ? 's' : ''}
        </p>
        <button
          onClick={() => setMostrarForm(v => !v)}
          style={{
            backgroundColor: '#CC0000', color: 'white', fontSize: '12px',
            padding: '6px 14px', borderRadius: '4px', border: 'none', cursor: 'pointer',
          }}
        >
          {mostrarForm ? '✕ Cancelar' : '+ Nuevo usuario'}
        </button>
      </div>

      {mostrarForm && (
        <form
          action={formAction}
          style={{
            background: 'white', border: '1px solid #C7CDD1', borderRadius: '4px',
            padding: '18px', marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '12px',
          }}
        >
          <p style={{ fontSize: '13px', fontWeight: 600, color: '#2D3B45', marginBottom: 4 }}>Nuevo usuario</p>

          {[
            { name: 'nombre', label: 'Nombre completo', type: 'text', placeholder: 'Ej. María García' },
            { name: 'email',  label: 'Correo electrónico', type: 'email', placeholder: 'usuario@itq.edu.ec' },
            { name: 'password', label: 'Contraseña', type: 'password', placeholder: 'Mínimo 6 caracteres' },
          ].map(f => (
            <div key={f.name}>
              <label style={{ fontSize: '11px', fontWeight: 700, color: '#556572', display: 'block', marginBottom: 4 }}>
                {f.label}
              </label>
              <input
                name={f.name}
                type={f.type}
                placeholder={f.placeholder}
                required
                style={{
                  width: '100%', border: '1px solid #C7CDD1', borderRadius: '4px',
                  padding: '7px 10px', fontSize: '13px', boxSizing: 'border-box',
                }}
              />
            </div>
          ))}

          <div>
            <label style={{ fontSize: '11px', fontWeight: 700, color: '#556572', display: 'block', marginBottom: 4 }}>
              Rol
            </label>
            <select
              name="rol"
              required
              style={{
                width: '100%', border: '1px solid #C7CDD1', borderRadius: '4px',
                padding: '7px 10px', fontSize: '13px', boxSizing: 'border-box',
                backgroundColor: 'white',
              }}
            >
              {ROL_OPTS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          <button
            type="submit"
            style={{
              backgroundColor: '#2D3B45', color: 'white', fontSize: '13px',
              padding: '8px 0', borderRadius: '4px', border: 'none', cursor: 'pointer', fontWeight: 600,
            }}
          >
            Crear usuario
          </button>
        </form>
      )}

      <div style={{ background: 'white', border: '1px solid #C7CDD1', borderRadius: '4px' }}>
        {usuarios.length === 0 && (
          <p style={{ padding: '16px', fontSize: '13px', color: '#8B969D' }}>No hay usuarios registrados.</p>
        )}
        {usuarios.map((u, i) => {
          const c = ROL_COLORS[u.rol] ?? ROL_COLORS.ADMINISTRATIVO
          return (
            <div
              key={u.id}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 16px',
                borderBottom: i < usuarios.length - 1 ? '1px solid #EEF0F2' : 'none',
              }}
            >
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '13px', fontWeight: 600, color: '#2D3B45' }}>{u.nombre}</p>
                <p style={{ fontSize: '11px', color: '#8B969D' }}>{u.email}</p>
              </div>
              <span style={{
                fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '99px',
                backgroundColor: c.bg, color: c.text, border: `1px solid ${c.border}`,
              }}>
                {u.rol}
              </span>
              <ToggleActivoBtn id={u.id} activo={u.activo} />
            </div>
          )
        })}
      </div>
    </div>
  )
}
