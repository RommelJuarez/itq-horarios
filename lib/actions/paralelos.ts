'use server'

import { z } from 'zod'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'

const ParaleloSchema = z.object({
  periodoId: z.coerce.number().min(1),
  carreraId: z.coerce.number().min(1),
  nivel:     z.coerce.number().min(1).max(10),
  paralelo:  z.string().min(1).max(5).toUpperCase(),
  jornada:   z.enum(['MATUTINA', 'NOCTURNA']),
  sede:      z.string().min(1).default('QUITO'),
})

async function checkPermiso() {
  const session = await auth()
  if (!session || !['ADMIN', 'COORDINADOR'].includes((session.user as any).rol)) {
    return { error: 'Sin permiso' }
  }
  return { session }
}

export async function agregarParalelo(prevState: any, formData: FormData) {
  const { error } = await checkPermiso()
  if (error) return { error }

  const parsed = ParaleloSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors }

  try {
    await prisma.nivelParalelo.create({ data: { ...parsed.data, activo: true } })
  } catch (e: any) {
    if (e.code === 'P2002') return { error: 'Ese nivel/paralelo/jornada ya existe en este periodo' }
    return { error: 'Error al agregar el paralelo' }
  }

  revalidatePath('/dashboard/configuracion')
  revalidatePath(`/dashboard/periodos/${parsed.data.periodoId}`)
  return { success: true }
}

export async function eliminarParalelo(id: number) {
  const { error } = await checkPermiso()
  if (error) return { error }

  try {
    await prisma.nivelParalelo.delete({ where: { id } })
  } catch {
    return { error: 'No se puede eliminar: tiene asignaciones asociadas' }
  }

  revalidatePath('/dashboard/configuracion')
  return { success: true }
}

export async function eliminarSede(periodoId: number, sede: string, jornada: string) {
  const { error } = await checkPermiso()
  if (error) return { error }

  // Verificar que quede al menos una sede en este periodo
  const combos = await prisma.nivelParalelo.findMany({
    where: { periodoId },
    select: { sede: true, jornada: true },
    distinct: ['sede', 'jornada'] as const,
  })

  if (combos.length <= 1) {
    return { error: 'Debe quedar al menos una sede configurada en el periodo' }
  }

  try {
    await prisma.nivelParalelo.deleteMany({ where: { periodoId, sede, jornada: jornada as 'MATUTINA' | 'NOCTURNA' } })
  } catch {
    return { error: 'No se puede eliminar: algunos paralelos tienen asignaciones activas' }
  }

  revalidatePath('/dashboard/configuracion')
  return { success: true }
}

export async function toggleActivoParalelo(id: number, activo: boolean) {
  const { error } = await checkPermiso()
  if (error) return { error }

  await prisma.nivelParalelo.update({ where: { id }, data: { activo: !activo } })
  revalidatePath('/dashboard/configuracion')
  return { success: true }
}
