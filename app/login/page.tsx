// RUTA: app/login/page.tsx
'use client'

import { useState } from 'react'
import { signIn }   from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router  = useRouter()
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const form   = new FormData(e.currentTarget)
    const result = await signIn('credentials', {
      email:    form.get('email'),
      password: form.get('password'),
      redirect: false,
    })
    setLoading(false)
    if (result?.error) {
      setError('Credenciales incorrectas. Verifica tu email y contrasena.')
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  return (
    <div
      className="min-h-screen flex"
      style={{ backgroundColor: '#F5F5F5', fontFamily: 'Lato, Helvetica Neue, Arial, sans-serif' }}
    >
      {/* Panel izquierdo — branding */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12"
        style={{ backgroundColor: '#2D2D2D' }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded flex items-center justify-center"
            style={{ backgroundColor: '#CC0000' }}
          >
            <span className="text-white font-bold text-sm" style={{ fontFamily: 'Lato, sans-serif' }}>ITQ</span>
          </div>
          <span className="text-white font-bold text-lg" style={{ fontFamily: 'Lato, sans-serif' }}>ITQ Horarios</span>
        </div>

        {/* Centro */}
        <div className="space-y-6">
          <div
            className="w-14 h-14 rounded flex items-center justify-center"
            style={{ backgroundColor: '#CC0000' }}
          >
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>

          <div>
            <h1
              className="text-4xl text-white leading-tight"
              style={{ fontWeight: 300, fontFamily: 'Lato, sans-serif' }}
            >
              Sistema de<br />
              <span style={{ fontWeight: 700 }}>Planificacion</span><br />
              Academica
            </h1>
            <p className="mt-4 text-sm leading-relaxed max-w-xs" style={{ color: '#AAAAAA' }}>
              Gestiona horarios, docentes y asignaturas del Instituto Superior Tecnologico Quito.
            </p>
          </div>

          
        </div>

        {/* Footer */}
        <p className="text-xs" style={{ color: '#556572' }}>
          Instituto Superior Tecnologico Quito &copy; {new Date().getFullYear()}
        </p>
      </div>

      {/* Panel derecho — formulario */}
      <div className="flex-1 flex items-center justify-center bg-white px-6 py-12">
        <div className="w-full max-w-sm">
          {/* Logo mobile */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-9 h-9 rounded flex items-center justify-center" style={{ backgroundColor: '#CC0000' }}>
              <span className="text-white font-bold text-xs">ITQ</span>
            </div>
            <span className="font-bold text-gray-900" style={{ fontFamily: 'Lato, sans-serif' }}>ITQ Horarios</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold" style={{ color: '#2D3B45', fontFamily: 'Lato, sans-serif' }}>
              Bienvenido
            </h2>
            <p className="mt-1 text-sm" style={{ color: '#8B969D' }}>
              Ingresa tus credenciales para acceder
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-bold mb-1.5" style={{ color: '#556572' }}>
                Correo electronico
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  <svg className="w-4 h-4" style={{ color: '#8B969D' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <input
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="usuario@itq.edu.ec"
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded"
                  style={{
                    border: '1px solid #C7CDD1',
                    color: '#2D3B45',
                    outline: 'none',
                    fontFamily: 'Lato, sans-serif',
                  }}
                  onFocus={e => e.target.style.borderColor = '#CC0000'}
                  onBlur={e => e.target.style.borderColor = '#C7CDD1'}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-bold mb-1.5" style={{ color: '#556572' }}>
                Contrasena
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  <svg className="w-4 h-4" style={{ color: '#8B969D' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  name="password"
                  type={showPass ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 text-sm rounded"
                  style={{
                    border: '1px solid #C7CDD1',
                    color: '#2D3B45',
                    outline: 'none',
                    fontFamily: 'Lato, sans-serif',
                  }}
                  onFocus={e => e.target.style.borderColor = '#CC0000'}
                  onBlur={e => e.target.style.borderColor = '#C7CDD1'}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  className="absolute inset-y-0 right-3 flex items-center"
                  style={{ color: '#8B969D' }}
                >
                  {showPass ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div
                className="flex items-start gap-2.5 rounded p-3 text-sm"
                style={{ backgroundColor: '#FFF1F1', border: '1px solid #FFCCCC', color: '#AA0000' }}
              >
                <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 text-white font-bold text-sm rounded transition-opacity disabled:opacity-60 flex items-center justify-center gap-2"
              style={{
                backgroundColor: '#CC0000',
                fontFamily: 'Lato, sans-serif',
              }}
              onMouseEnter={e => !loading && ((e.target as HTMLElement).style.backgroundColor = '#AA0000')}
              onMouseLeave={e => !loading && ((e.target as HTMLElement).style.backgroundColor = '#CC0000')}
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Ingresando...
                </>
              ) : 'Ingresar al sistema'}
            </button>
          </form>

          <p className="mt-8 text-center text-xs" style={{ color: '#AAAAAA' }}>
            Instituto Superior Tecnologico Quito
          </p>
        </div>
      </div>
    </div>
  )
}