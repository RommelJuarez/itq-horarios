'use server'

import { z } from 'zod'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { validarCargaDocente, verificarChoqueDocente } from '@/lib/validaciones'

const AsignacionSchema = z.object({
  moduloId:        z.coerce.number().min(1),
  asignaturaId:    z.coerce.number().min(1),
  nivelParaleloId: z.coerce.number().min(1),
  horario:         z.string().min(1),
  docenteId:       z.coerce.number().optional().nullable(),
  aula:            z.string().optional(),
})

async function checkPermiso() {
  const session = await auth()
  if (!session?.user || !['ADMIN', 'COORDINADOR'].includes((session.user as { rol?: string }).rol ?? '')) {
    return { error: 'Sin permiso' }
  }
  return { session }
}

export async function crearAsignacion(_: unknown, formData: FormData) {
  const { error } = await checkPermiso()
  if (error) return { error }

  const raw    = Object.fromEntries(formData)
  const parsed = AsignacionSchema.safeParse({
    ...raw,
    docenteId: raw.docenteId && raw.docenteId !== '' ? Number(raw.docenteId) : null,
  })

  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors }

  const { docenteId, moduloId, horario } = parsed.data

  // Obtener periodoId desde el módulo
  const modulo = await prisma.modulo.findUnique({ where: { id: moduloId } })
  if (!modulo) return { error: 'Modulo no encontrado' }

  // Validaciones RF03 y RF05 solo si hay docente asignado
  if (docenteId) {
    const errCarga  = await validarCargaDocente(docenteId, moduloId)
    if (errCarga) return { error: errCarga }

    const errChoque = await verificarChoqueDocente(docenteId, moduloId, horario)
    if (errChoque) return { error: errChoque }
  }

  try {
    await prisma.asignacion.create({
      data: {
        moduloId:        parsed.data.moduloId,
        asignaturaId:    parsed.data.asignaturaId,
        nivelParaleloId: parsed.data.nivelParaleloId,
        horario:         parsed.data.horario,
        docenteId:       docenteId ?? null,
        aula:            parsed.data.aula || null,
        estado:          'ASIGNADO',
      },
    })
  } catch (e: any) {
    if (e.code === 'P2002') return { error: 'Ya existe una asignacion para ese paralelo en ese horario (choque)' }
    return { error: 'Error al guardar la asignacion' }
  }

  revalidatePath(`/dashboard/horarios/${moduloId}`)
  return { success: true }
}

export async function actualizarAsignacion(id: number, _: unknown, formData: FormData) {
  const { error } = await checkPermiso()
  if (error) return { error }

  const raw    = Object.fromEntries(formData)
  const parsed = AsignacionSchema.safeParse({
    ...raw,
    docenteId: raw.docenteId && raw.docenteId !== '' ? Number(raw.docenteId) : null,
  })

  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors }

  const { docenteId, moduloId, horario } = parsed.data

  if (docenteId) {
    const errCarga  = await validarCargaDocente(docenteId, moduloId, id)
    if (errCarga) return { error: errCarga }

    const errChoque = await verificarChoqueDocente(docenteId, moduloId, horario, id)
    if (errChoque) return { error: errChoque }
  }

  try {
    await prisma.asignacion.update({
      where: { id },
      data: {
        asignaturaId: parsed.data.asignaturaId,
        docenteId:    docenteId ?? null,
        aula:         parsed.data.aula || null,
        estado:       docenteId ? 'ASIGNADO' : 'PENDIENTE',
      },
    })
  } catch (e: any) {
    if (e.code === 'P2002') return { error: 'Choque de horario detectado' }
    return { error: 'Error al actualizar la asignacion' }
  }

  revalidatePath(`/dashboard/horarios/${moduloId}`)
  return { success: true }
}

export async function eliminarAsignacion(id: number, moduloId: number) {
  const { error } = await checkPermiso()
  if (error) return { error }

  await prisma.asignacion.delete({ where: { id } })
  revalidatePath(`/dashboard/horarios/${moduloId}`)
  return { success: true }
}

export async function quitarDocente(id: number, moduloId: number) {
  const { error } = await checkPermiso()
  if (error) return { error }

  await prisma.asignacion.update({
    where: { id },
    data: { docenteId: null, estado: 'PENDIENTE' },
  })
  revalidatePath(`/dashboard/horarios/${moduloId}`)
  return { success: true }
}

export async function confirmarAsignacion(id: number, moduloId: number) {
  const { error } = await checkPermiso()
  if (error) return { error }

  await prisma.asignacion.update({ where: { id }, data: { estado: 'CONFIRMADO' } })
  revalidatePath(`/dashboard/horarios/${moduloId}`)
  return { success: true }
}
