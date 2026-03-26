import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { generarExcelHorarios } from '@/lib/excel'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Sin permiso' }, { status: 401 })

  const p = req.nextUrl.searchParams
  const periodoId = parseInt(p.get('periodoId') ?? '0')
  const carreraId = parseInt(p.get('carreraId') ?? '0')
  const jornada   = (p.get('jornada') ?? 'MATUTINA') as 'MATUTINA' | 'NOCTURNA'
  const sede      = p.get('sede') ?? 'QUITO'

  if (!periodoId || !carreraId) {
    return NextResponse.json({ error: 'periodoId y carreraId son requeridos' }, { status: 400 })
  }

  try {
    const buffer = await generarExcelHorarios(periodoId, carreraId, jornada, sede)
    const filename = `horarios-${sede}-${jornada.toLowerCase()}.xlsx`.replace(/\s+/g, '-')
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Error al generar Excel'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
