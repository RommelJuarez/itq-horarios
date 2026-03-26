import { prisma } from '@/lib/db'

// RF03: máx 3 asignaturas por docente por módulo
export async function validarCargaDocente(
  docenteId: number,
  moduloId: number,
  excludeId?: number
): Promise<string | null> {
  const total = await prisma.asignacion.count({
    where: {
      docenteId,
      moduloId,
      ...(excludeId ? { id: { not: excludeId } } : {}),
    },
  })
  if (total >= 3) return 'El docente ya tiene 3 asignaturas en este modulo (RF03)'
  return null
}

// RF04: validar horas TC en el periodo (272h min — 380h max)
export async function validarHorasTC(
  docenteId: number,
  periodoId: number
): Promise<string | null> {
  const docente = await prisma.docente.findUnique({ where: { id: docenteId } })
  if (!docente || docente.tipo !== 'TC') return null

  const cargas = await prisma.cargaHoraria.findMany({ where: { docenteId, periodoId } })
  const total  = cargas.reduce((s, c) => s + c.horasModulo, 0)

  if (total > docente.horasMax) {
    return `El docente TC supera el maximo de ${docente.horasMax}h en el periodo (RF04)`
  }
  return null
}

// RF05: choque de docente en mismo módulo y horario
export async function verificarChoqueDocente(
  docenteId: number,
  moduloId: number,
  horario: string,
  excludeId?: number
): Promise<string | null> {
  const choque = await prisma.asignacion.findFirst({
    where: {
      docenteId,
      moduloId,
      horario,
      ...(excludeId ? { id: { not: excludeId } } : {}),
    },
    include: { asignatura: true, nivelParalelo: true },
  })
  if (choque) {
    return `El docente ya tiene asignado "${choque.asignatura.nombre}" (Nivel ${choque.nivelParalelo.nivel}-${choque.nivelParalelo.paralelo}) en el horario ${horario} (RF05)`
  }
  return null
}
