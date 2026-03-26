'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'

interface SidebarProps {
  userName: string
  userRol: string
}

const NAV_ITEMS = [
  {
    href: '/dashboard',
    label: 'Panel',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <rect x="2" y="2" width="8" height="8" rx="1"/>
        <rect x="14" y="2" width="8" height="8" rx="1"/>
        <rect x="2" y="14" width="8" height="8" rx="1"/>
        <rect x="14" y="14" width="8" height="8" rx="1"/>
      </svg>
    ),
    exact: true,
  },
  {
    href: '/dashboard/periodos',
    label: 'Periodos',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <rect x="3" y="4" width="18" height="18" rx="2"/>
        <path d="M16 2v4M8 2v4M3 10h18"/>
      </svg>
    ),
  },
  {
    href: '/dashboard/horarios',
    label: 'Horarios',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <rect x="3" y="3" width="18" height="18" rx="2"/>
        <path d="M3 9h18M9 21V9"/>
      </svg>
    ),
  },
  {
    href: '/dashboard/docentes',
    label: 'Docentes',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <circle cx="9" cy="7" r="4"/>
        <path d="M2 21c0-3.9 3.1-7 7-7"/>
        <circle cx="17" cy="11" r="3"/>
        <path d="M14 21c0-2.8 1.3-5 3-5s3 2.2 3 5"/>
      </svg>
    ),
  },
  {
    href: '/dashboard/asignaturas',
    label: 'Asigna-\nturas',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M4 19.5V5A2.5 2.5 0 016.5 2.5H20v19H6.5A2.5 2.5 0 014 19.5z"/>
        <path d="M4 19.5A2.5 2.5 0 016.5 17H20"/>
      </svg>
    ),
  },
  {
    href: '/dashboard/carreras',
    label: 'Carreras',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16"/>
        <path d="M3 21h18"/>
        <path d="M9 21v-6h6v6"/>
      </svg>
    ),
  },
  {
    href: '/dashboard/reportes',
    label: 'Reportes',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.6a1 1 0 01.7.3l5.4 5.4a1 1 0 01.3.7V19a2 2 0 01-2 2z"/>
      </svg>
    ),
  },
  {
    href: '/dashboard/configuracion',
    label: 'Config.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <circle cx="12" cy="12" r="3"/>
        <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
      </svg>
    ),
  },
]

export function Sidebar({ userName, userRol }: SidebarProps) {
  const pathname = usePathname()

  function getInitials(name: string) {
    const cleaned = name.trim()
    if (!cleaned) return 'U'
    const parts = cleaned.split(/\s+/).filter(Boolean)
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href
    return pathname === href || pathname.startsWith(href + '/')
  }

  return (
    <aside
      style={{ backgroundColor: '#2D2D2D', width: '82px', minWidth: '82px' }}
      className="fixed left-0 top-0 h-screen flex flex-col items-center z-30 overflow-x-hidden"
    >
      <div
        className="w-full h-[52px] flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: '#CC0000' }}
      >
        <span className="text-white font-bold text-sm">ITQ</span>
      </div>

      <nav className="flex-1 w-full flex flex-col overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href, item.exact)
          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.label.replace('\n', '')}
              style={{
                borderLeft: active ? '3px solid #CC0000' : '3px solid transparent',
                backgroundColor: active ? '#242424' : 'transparent',
                color: active ? '#FF5555' : '#AAAAAA',
              }}
              className="w-full flex flex-col items-center justify-center py-2.5 px-1 transition-colors hover:bg-[#3D3D3D] hover:text-[#CCCCCC]"
            >
              {item.icon}
              <span className="mt-1 text-center leading-tight text-[10px] whitespace-pre-line">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="w-full flex flex-col items-center gap-1 py-3 flex-shrink-0" style={{ borderTop: '1px solid #1A1A1A' }}>
        <div
          title={`${userName} — ${userRol}`}
          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: '#CC0000' }}
        >
          <span className="text-white font-bold text-[11px]">{getInitials(userName)}</span>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          title="Cerrar sesion"
          style={{ color: '#AAAAAA' }}
          className="w-full flex flex-col items-center py-2 transition-colors hover:bg-[#3D3D3D] hover:text-red-400"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
          </svg>
          <span className="text-[9px] mt-[2px]">Salir</span>
        </button>
      </div>
    </aside>
  )
}
