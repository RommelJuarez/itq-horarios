'use server'

import { z } from 'zod'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'

const ModuloUpdateSchema = z.object({
  nombre:        z.string().min(1),
  fechaInicio:   z.string().min(1),
  fechaFin:      z.string().min(1),
  horasMatutino: z.coerce.number().min(1),
  horasNocturno: z.coerce.number().min(1),
})

async function checkPermiso() {
  const session = await auth()
  if (!session || !['ADMIN', 'COORDINADOR'].includes((session.user as any).rol)) {
    return { error: 'Sin permiso' }
  }
  return { session }
}

export async function actualizarModulo(id: number, periodoId: number, prevState: any, formData: FormData) {
  const { error } = await checkPermiso()
  if (error) return { error }

  const parsed = ModuloUpdateSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors }

  try {
    await prisma.modulo.update({
      where: { id },
      data: {
        nombre:        parsed.data.nombre,
        fechaInicio:   new Date(parsed.data.fechaInicio),
        fechaFin:      new Date(parsed.data.fechaFin),
        horasMatutino: parsed.data.horasMatutino,
        horasNocturno: parsed.data.horasNocturno,
      },
    })
  } catch {
    return { error: 'Error al actualizar el modulo' }
  }

  revalidatePath(`/dashboard/periodos/${periodoId}`)
  return { success: true }
}
