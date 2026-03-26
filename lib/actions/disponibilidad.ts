'use server'

import { z } from 'zod'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'

const DisponibilidadSchema = z.object({
  docenteId: z.coerce.number(),
  moduloId:  z.coerce.number(),
  jornada:   z.enum(['MATUTINA', 'NOCTURNA']),
  horario:   z.string().min(1),
})

async function checkPermiso() {
  const session = await auth()
  if (!session || !['ADMIN', 'COORDINADOR'].includes((session.user as any).rol)) {
    return { error: 'Sin permiso' }
  }
  return { session }
}

export async function agregarDisponibilidad(prevState: any, formData: FormData) {
  const { error } = await checkPermiso()
  if (error) return { error }

  const parsed = DisponibilidadSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors }

  try {
    await prisma.disponibilidadDocente.create({ data: parsed.data })
  } catch (e: any) {
    if (e.code === 'P2002') return { error: 'Ya existe esa disponibilidad registrada' }
    return { error: 'Error al guardar disponibilidad' }
  }

  revalidatePath(`/dashboard/docentes/${parsed.data.docenteId}`)
  return { success: true }
}

export async function eliminarDisponibilidad(id: number, docenteId: number) {
  const { error } = await checkPermiso()
  if (error) return { error }

  await prisma.disponibilidadDocente.delete({ where: { id } })
  revalidatePath(`/dashboard/docentes/${docenteId}`)
  return { success: true }
}
