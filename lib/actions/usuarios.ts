'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/db'
import { auth } from '@/auth'
import bcrypt from 'bcryptjs'

type FormState = { error?: string; success?: boolean } | undefined

export async function crearUsuario(_prev: FormState, fd: FormData): Promise<FormState> {
  const session = await auth()
  const rol = (session?.user as { rol?: string })?.rol ?? ''
  if (rol !== 'ADMIN') return { error: 'Sin permiso' }

  const nombre   = (fd.get('nombre')   as string)?.trim()
  const email    = (fd.get('email')    as string)?.trim().toLowerCase()
  const password = (fd.get('password') as string)?.trim()
  const userRol  = (fd.get('rol')      as string)?.trim()

  if (!nombre || !email || !password || !userRol) return { error: 'Todos los campos son obligatorios' }
  if (password.length < 6) return { error: 'La contraseña debe tener al menos 6 caracteres' }
  if (!['ADMIN', 'COORDINADOR', 'DOCENTE', 'ADMINISTRATIVO'].includes(userRol)) return { error: 'Rol inválido' }

  const existe = await prisma.usuario.findUnique({ where: { email } })
  if (existe) return { error: 'Ya existe un usuario con ese correo' }

  const passwordHash = await bcrypt.hash(password, 10)
  await prisma.usuario.create({
    data: { nombre, email, passwordHash, rol: userRol as 'ADMIN' | 'COORDINADOR' | 'DOCENTE' | 'ADMINISTRATIVO' },
  })

  revalidatePath('/dashboard/configuracion')
  return { success: true }
}

export async function toggleActivoUsuario(id: number): Promise<FormState> {
  const session = await auth()
  const rol = (session?.user as { rol?: string })?.rol ?? ''
  if (rol !== 'ADMIN') return { error: 'Sin permiso' }

  const u = await prisma.usuario.findUnique({ where: { id } })
  if (!u) return { error: 'Usuario no encontrado' }

  await prisma.usuario.update({ where: { id }, data: { activo: !u.activo } })
  revalidatePath('/dashboard/configuracion')
  return { success: true }
}
