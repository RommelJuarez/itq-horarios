'use server'

import { z } from 'zod'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

const AsignaturaSchema = z.object({
  carreraId:     z.coerce.number().min(1, 'Selecciona una carrera'),
  nombre:        z.string().min(2, 'El nombre es requerido'),
  codigo:        z.string().optional(),
  nivel:         z.coerce.number().min(1).max(10),
  horasMatutino: z.coerce.number().min(1).default(36),
  horasNocturno: z.coerce.number().min(1).default(27),
})

async function checkPermiso() {
  const session = await auth()
  if (!session || !['ADMIN', 'COORDINADOR'].includes((session.user as any).rol)) {
    return { error: 'Sin permiso' }
  }
  return { session }
}

export async function crearAsignatura(prevState: any, formData: FormData) {
  const { error } = await checkPermiso()
  if (error) return { error }

  const parsed = AsignaturaSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors }

  try {
    await prisma.asignatura.create({
      data: {
        carreraId:     parsed.data.carreraId,
        nombre:        parsed.data.nombre,
        codigo:        parsed.data.codigo || null,
        nivel:         parsed.data.nivel,
        horasMatutino: parsed.data.horasMatutino,
        horasNocturno: parsed.data.horasNocturno,
        activo:        true,
      },
    })
  } catch {
    return { error: 'Error al guardar la asignatura' }
  }

  revalidatePath('/dashboard/asignaturas')
  redirect('/dashboard/asignaturas')
}

export async function actualizarAsignatura(id: number, prevState: any, formData: FormData) {
  const { error } = await checkPermiso()
  if (error) return { error }

  const parsed = AsignaturaSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors }

  try {
    await prisma.asignatura.update({
      where: { id },
      data: {
        carreraId:     parsed.data.carreraId,
        nombre:        parsed.data.nombre,
        codigo:        parsed.data.codigo || null,
        nivel:         parsed.data.nivel,
        horasMatutino: parsed.data.horasMatutino,
        horasNocturno: parsed.data.horasNocturno,
      },
    })
  } catch {
    return { error: 'Error al actualizar la asignatura' }
  }

  revalidatePath('/dashboard/asignaturas')
  revalidatePath(`/dashboard/asignaturas/${id}`)
  return { success: true }
}

export async function toggleActivoAsignatura(id: number, activo: boolean) {
  const { error } = await checkPermiso()
  if (error) return { error }

  await prisma.asignatura.update({ where: { id }, data: { activo: !activo } })
  revalidatePath('/dashboard/asignaturas')
  return { success: true }
}
