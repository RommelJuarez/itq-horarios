import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { generarHorariosConIA } from '@/lib/ia'
import { prisma } from '@/lib/db'
import type { AsignacionActual } from '@/lib/ia'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user || !['ADMIN', 'COORDINADOR'].includes((session.user as { rol?: string }).rol ?? '')) {
    return NextResponse.json({ error: 'Sin permiso' }, { status: 401 })
  }

  const body = await req.json()
  const moduloId = parseInt(body.moduloId)
  if (isNaN(moduloId)) {
    return NextResponse.json({ error: 'moduloId inválido' }, { status: 400 })
  }

  const asignacionesActuales: AsignacionActual[] = Array.isArray(body.asignacionesActuales)
    ? body.asignacionesActuales
    : []

  try {
    const resultado = await generarHorariosConIA(moduloId, asignacionesActuales)

    const creadas = []
    for (const sug of resultado.asignaciones) {
      try {
        const created = await prisma.asignacion.create({
          data: {
            moduloId:        sug.moduloId,
            docenteId:       sug.docenteId,
            asignaturaId:    sug.asignaturaId,
            nivelParaleloId: sug.nivelParaleloId,
            horario:         sug.horario,
            estado:          'PENDIENTE',
          },
          include: {
            asignatura: { select: { id: true, nombre: true, nivel: true } },
            docente:    { select: { id: true, nombre: true, tipo: true } },
          },
        })
        creadas.push({
          id:              created.id,
          nivelParaleloId: created.nivelParaleloId,
          horario:         created.horario,
          estado:          created.estado as 'PENDIENTE',
          asignatura:      created.asignatura,
          docente:         created.docente,
          asignaturaId:    created.asignaturaId,
          moduloId:        created.moduloId,
        })
      } catch {
        // Skip RF03/P2002 violations — IA might still suggest duplicates
      }
    }

    return NextResponse.json({ advertencias: resultado.advertencias, creadas })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Error al generar horarios con IA'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
