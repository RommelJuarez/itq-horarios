'use server'

import { z } from 'zod'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

const DocenteSchema = z.object({
  nombre:       z.string().min(2, 'El nombre es requerido'),
  tipo:         z.enum(['TC', 'TP', 'MT']),
  especialidad: z.string().optional(),
  horasMin:     z.coerce.number().min(0).default(0),
  horasMax:     z.coerce.number().min(0).default(999),
  activo:       z.coerce.boolean().default(true),
})

async function checkPermiso() {
  const session = await auth()
  if (!session || !['ADMIN', 'COORDINADOR'].includes((session.user as any).rol)) {
    return { error: 'Sin permiso' }
  }
  return { session }
}

export async function crearDocente(prevState: any, formData: FormData) {
  const { error } = await checkPermiso()
  if (error) return { error }

  const raw = Object.fromEntries(formData)
  const parsed = DocenteSchema.safeParse({
    ...raw,
    activo: true,
  })

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors }
  }

  // Defaults por tipo
  const { tipo } = parsed.data
  const horasMin = tipo === 'TC' ? 272 : tipo === 'MT' ? 136 : 0
  const horasMax = tipo === 'TC' ? 380 : tipo === 'MT' ? 190 : 999

  try {
    await prisma.docente.create({
      data: {
        nombre:       parsed.data.nombre,
        tipo:         parsed.data.tipo,
        especialidad: parsed.data.especialidad ?? null,
        horasMin,
        horasMax,
        activo:       true,
      },
    })
  } catch {
    return { error: 'Error al guardar el docente' }
  }

  revalidatePath('/dashboard/docentes')
  redirect('/dashboard/docentes')
}

export async function actualizarDocente(id: number, prevState: any, formData: FormData) {
  const { error } = await checkPermiso()
  if (error) return { error }

  const raw = Object.fromEntries(formData)
  const parsed = DocenteSchema.safeParse(raw)

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors }
  }

  const { tipo } = parsed.data
  const horasMin = tipo === 'TC' ? 272 : tipo === 'MT' ? 136 : 0
  const horasMax = tipo === 'TC' ? 380 : tipo === 'MT' ? 190 : 999

  try {
    await prisma.docente.update({
      where: { id },
      data: {
        nombre:       parsed.data.nombre,
        tipo:         parsed.data.tipo,
        especialidad: parsed.data.especialidad ?? null,
        horasMin,
        horasMax,
      },
    })
  } catch {
    return { error: 'Error al actualizar el docente' }
  }

  revalidatePath(`/dashboard/docentes/${id}`)
  revalidatePath('/dashboard/docentes')
  return { success: true }
}

export async function toggleActivoDocente(id: number, activo: boolean) {
  const { error } = await checkPermiso()
  if (error) return { error }

  await prisma.docente.update({ where: { id }, data: { activo: !activo } })
  revalidatePath('/dashboard/docentes')
  revalidatePath(`/dashboard/docentes/${id}`)
  return { success: true }
}
