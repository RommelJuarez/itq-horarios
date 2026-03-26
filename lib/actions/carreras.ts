'use server'

import { z } from 'zod'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'

const CarreraSchema = z.object({
  nombre: z.string().min(2, 'El nombre es requerido'),
  codigo: z.string().min(1, 'El codigo es requerido').max(20),
  sede:   z.string().min(1).default('QUITO'),
})

async function checkPermiso() {
  const session = await auth()
  if (!session || !['ADMIN', 'COORDINADOR'].includes((session.user as any).rol)) {
    return { error: 'Sin permiso' }
  }
  return { session }
}

export async function crearCarrera(prevState: any, formData: FormData) {
  const { error } = await checkPermiso()
  if (error) return { error }

  const parsed = CarreraSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors }

  try {
    await prisma.carrera.create({ data: { ...parsed.data, activo: true } })
  } catch (e: any) {
    if (e.code === 'P2002') return { error: 'Ya existe una carrera con ese codigo' }
    return { error: 'Error al guardar la carrera' }
  }

  revalidatePath('/dashboard/carreras')
  return { success: true }
}

export async function actualizarCarrera(id: number, prevState: any, formData: FormData) {
  const { error } = await checkPermiso()
  if (error) return { error }

  const parsed = CarreraSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors }

  try {
    await prisma.carrera.update({ where: { id }, data: parsed.data })
  } catch (e: any) {
    if (e.code === 'P2002') return { error: 'Ya existe una carrera con ese codigo' }
    return { error: 'Error al actualizar' }
  }

  revalidatePath('/dashboard/carreras')
  return { success: true }
}

export async function toggleActivoCarrera(id: number, activo: boolean) {
  const { error } = await checkPermiso()
  if (error) return { error }

  await prisma.carrera.update({ where: { id }, data: { activo: !activo } })
  revalidatePath('/dashboard/carreras')
  return { success: true }
}
