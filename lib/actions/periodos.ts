'use server'

import { z } from 'zod'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

const ModuloInputSchema = z.object({
  numero:        z.coerce.number().min(1).max(3),
  nombre:        z.string().min(1),
  fechaInicio:   z.string().min(1, 'Fecha inicio requerida'),
  fechaFin:      z.string().min(1, 'Fecha fin requerida'),
  horasMatutino: z.coerce.number().min(1).default(36),
  horasNocturno: z.coerce.number().min(1).default(27),
})

const PeriodoSchema = z.object({
  nombre:      z.string().min(2, 'El nombre es requerido'),
  anio:        z.coerce.number().min(2020).max(2099),
  numero:      z.coerce.number().min(1).max(2),
  fechaInicio: z.string().min(1, 'Fecha inicio requerida'),
  fechaFin:    z.string().min(1, 'Fecha fin requerida'),
})

async function checkPermiso() {
  const session = await auth()
  if (!session || !['ADMIN', 'COORDINADOR'].includes((session.user as any).rol)) {
    return { error: 'Sin permiso' }
  }
  return { session }
}

export async function crearPeriodo(prevState: any, formData: FormData) {
  const { error } = await checkPermiso()
  if (error) return { error }

  const raw = Object.fromEntries(formData)

  const parsedPeriodo = PeriodoSchema.safeParse(raw)
  if (!parsedPeriodo.success) {
    return { errors: parsedPeriodo.error.flatten().fieldErrors }
  }

  // Parsear los 3 módulos del formData
  const modulos = []
  for (let i = 1; i <= 3; i++) {
    const modRaw = {
      numero:        i,
      nombre:        raw[`modulo${i}_nombre`],
      fechaInicio:   raw[`modulo${i}_fechaInicio`],
      fechaFin:      raw[`modulo${i}_fechaFin`],
      horasMatutino: raw[`modulo${i}_horasMatutino`],
      horasNocturno: raw[`modulo${i}_horasNocturno`],
    }
    const parsedMod = ModuloInputSchema.safeParse(modRaw)
    if (!parsedMod.success) {
      return { error: `Modulo ${i}: datos incompletos o invalidos` }
    }
    modulos.push(parsedMod.data)
  }

  // Verificar que no exista ya ese año+número
  const existe = await prisma.periodoAcademico.findUnique({
    where: { anio_numero: { anio: parsedPeriodo.data.anio, numero: parsedPeriodo.data.numero } },
  })
  if (existe) {
    return { error: `Ya existe el periodo ${parsedPeriodo.data.anio}-${parsedPeriodo.data.numero}` }
  }

  try {
    await prisma.periodoAcademico.create({
      data: {
        nombre:      parsedPeriodo.data.nombre,
        anio:        parsedPeriodo.data.anio,
        numero:      parsedPeriodo.data.numero,
        fechaInicio: new Date(parsedPeriodo.data.fechaInicio),
        fechaFin:    new Date(parsedPeriodo.data.fechaFin),
        activo:      true,
        modulos: {
          create: modulos.map(m => ({
            numero:        m.numero,
            nombre:        m.nombre,
            fechaInicio:   new Date(m.fechaInicio),
            fechaFin:      new Date(m.fechaFin),
            horasMatutino: m.horasMatutino,
            horasNocturno: m.horasNocturno,
          })),
        },
      },
    })
  } catch (e: any) {
    if (e.code === 'P2002') return { error: 'Ya existe un periodo con ese año y número' }
    return { error: 'Error al guardar el periodo' }
  }

  revalidatePath('/dashboard/periodos')
  redirect('/dashboard/periodos')
}

export async function toggleActivoPeriodo(id: number, activo: boolean) {
  const { error } = await checkPermiso()
  if (error) return { error }

  await prisma.periodoAcademico.update({ where: { id }, data: { activo: !activo } })
  revalidatePath('/dashboard/periodos')
  revalidatePath(`/dashboard/periodos/${id}`)
  return { success: true }
}
