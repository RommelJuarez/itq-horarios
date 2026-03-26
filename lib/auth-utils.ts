import { auth } from '@/auth'

async function getRol(): Promise<string> {
  // auth() is overloaded; cast via unknown to avoid TS picking the middleware signature
  const session = await (auth as () => Promise<{ user?: unknown } | null>)()
  return (session?.user as { rol?: string } | undefined)?.rol ?? ''
}

/** Returns whether the current user can create/edit/delete records. */
export async function getCanEdit(): Promise<boolean> {
  return ['ADMIN', 'COORDINADOR'].includes(await getRol())
}

/** Returns both flags in one call. */
export async function getPermisos(): Promise<{ canEdit: boolean; isAdmin: boolean }> {
  const rol = await getRol()
  return {
    canEdit: ['ADMIN', 'COORDINADOR'].includes(rol),
    isAdmin: rol === 'ADMIN',
  }
}
