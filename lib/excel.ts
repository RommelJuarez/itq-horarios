import ExcelJS from 'exceljs'
import { prisma } from '@/lib/db'

// ─── Estilos corporativos ITQ ─────────────────────────────────────────────────
const ROJO      = 'FFCC0000'
const BLANCO    = 'FFFFFFFF'
const GRIS_PAR  = 'FFF5F5F5'
const GRIS2     = 'FFD9D9D9'
const AZUL_SUB  = 'FFDCE6F1'

function headerStyle(sheet: ExcelJS.Worksheet, row: ExcelJS.Row) {
  row.eachCell(cell => {
    cell.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: ROJO } }
    cell.font      = { bold: true, color: { argb: BLANCO }, size: 10 }
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true }
    cell.border    = border('thin')
  })
  row.height = 30
}

function dataStyle(cell: ExcelJS.Cell, isEven: boolean) {
  cell.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: isEven ? GRIS_PAR : BLANCO } }
  cell.border    = border('hair')
  cell.alignment = { vertical: 'middle', wrapText: true }
}

function subtituloStyle(cell: ExcelJS.Cell) {
  cell.font      = { bold: true, size: 10, color: { argb: ROJO } }
  cell.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: AZUL_SUB } }
  cell.alignment = { horizontal: 'center', vertical: 'middle' }
}

function border(style: ExcelJS.BorderStyle): Partial<ExcelJS.Borders> {
  return { top: { style }, bottom: { style }, left: { style }, right: { style } }
}

function fmtDate(d: Date) {
  return new Date(d).toLocaleDateString('es-EC', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

// Horas reales del slot (ej. "08:00-10:00" → 2.0, "18:30-20:00" → 1.5)
function parseSlotHours(horario: string): number {
  const [start, end] = horario.split('-')
  const [sh, sm] = start.split(':').map(Number)
  const [eh, em] = end.split(':').map(Number)
  return (eh * 60 + em - (sh * 60 + sm)) / 60
}

function moduleWeeks(fechaInicio: Date, fechaFin: Date): number {
  const days = (new Date(fechaFin).getTime() - new Date(fechaInicio).getTime()) / (24 * 3600 * 1000)
  return Math.max(1, Math.round(days / 7))
}

// ─── Export principal: por carrera + jornada + sede ──────────────────────────

export async function generarExcelHorarios(
  periodoId: number,
  carreraId: number,
  jornada: 'MATUTINA' | 'NOCTURNA',
  sede: string,
): Promise<Buffer> {

  // ── Fetch de datos en una transacción ──
  const [periodo, carrera, nivelParalelos, modulos] = await prisma.$transaction([
    prisma.periodoAcademico.findUnique({ where: { id: periodoId } }),
    prisma.carrera.findUnique({ where: { id: carreraId } }),
    prisma.nivelParalelo.findMany({
      where: { periodoId, carreraId, jornada: jornada as 'MATUTINA' | 'NOCTURNA', sede, activo: true },
      select: { id: true, nivel: true, paralelo: true },
      orderBy: [{ nivel: 'asc' }, { paralelo: 'asc' }],
    }),
    prisma.modulo.findMany({
      where:   { periodoId },
      orderBy: { numero: 'asc' },
    }),
  ])

  const npIds = nivelParalelos.map(np => np.id)

  const [todasAsignaciones, docentes] = await prisma.$transaction([
    prisma.asignacion.findMany({
      where:   { nivelParaleloId: { in: npIds } },
      include: {
        docente:       { select: { id: true, nombre: true, tipo: true, horasMin: true, horasMax: true } },
        asignatura:    { select: { id: true, nombre: true } },
        nivelParalelo: { select: { id: true, nivel: true, paralelo: true } },
      },
      orderBy: [
        { nivelParalelo: { nivel: 'asc' } },
        { nivelParalelo: { paralelo: 'asc' } },
        { horario: 'asc' },
      ],
    }),
    // Solo docentes con asignaciones en este contexto
    prisma.docente.findMany({
      where: {
        activo: true,
        id: {
          in: await prisma.asignacion
            .findMany({ where: { nivelParaleloId: { in: npIds }, docenteId: { not: null } }, select: { docenteId: true }, distinct: ['docenteId'] })
            .then(rows => rows.map(r => r.docenteId!)),
        },
      },
      orderBy: { nombre: 'asc' },
      select: { id: true, nombre: true, tipo: true, horasMin: true, horasMax: true },
    }),
  ])

  const wb = new ExcelJS.Workbook()
  wb.creator = 'ITQ Horarios'
  wb.created = new Date()

  const jornadaLabel = jornada === 'MATUTINA' ? 'Matutina' : 'Nocturna'
  const NCOLS = 10

  // ── HOJAS 1-3: un módulo por hoja ──────────────────────────────────────────
  for (const modulo of modulos) {
    const ws = wb.addWorksheet(modulo.nombre, {
      pageSetup: { orientation: 'landscape', fitToPage: true, fitToWidth: 1 },
    })

    ws.columns = [
      { key: 'fi',         width: 14 },
      { key: 'ff',         width: 14 },
      { key: 'asignatura', width: 42 },
      { key: 'nivel',      width: 8  },
      { key: 'paralelo',   width: 10 },
      { key: 'horas',      width: 8  },
      { key: 'horario',    width: 16 },
      { key: 'docente',    width: 34 },
      { key: 'aula',       width: 14 },
      { key: 'obs',        width: 20 },
    ]

    const fi          = fmtDate(modulo.fechaInicio)
    const ff          = fmtDate(modulo.fechaFin)
    const horasModulo = jornada === 'MATUTINA' ? modulo.horasMatutino : modulo.horasNocturno

    // ── Cabeceras ──
    ws.mergeCells(1, 1, 1, NCOLS)
    const r1 = ws.getCell('A1')
    r1.value = 'INSTITUTO SUPERIOR TECNOLÓGICO QUITO'
    r1.font  = { bold: true, size: 13, color: { argb: BLANCO } }
    r1.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: ROJO } }
    r1.alignment = { horizontal: 'center', vertical: 'middle' }
    ws.getRow(1).height = 26

    ws.mergeCells(2, 1, 2, NCOLS)
    const r2 = ws.getCell('A2')
    r2.value = `PERÍODO: ${periodo?.nombre ?? ''}  |  CARRERA: ${carrera?.nombre ?? ''}  |  SEDE: ${sede}  |  JORNADA: ${jornadaLabel.toUpperCase()}`
    subtituloStyle(r2)
    ws.getRow(2).height = 18

    ws.mergeCells(3, 1, 3, NCOLS)
    const r3 = ws.getCell('A3')
    r3.value = `${modulo.nombre.toUpperCase()}  —  ${fi} al ${ff}  |  ${horasModulo}h totales`
    subtituloStyle(r3)
    ws.getRow(3).height = 18

    // ── Encabezado de columnas ──
    const hRow = ws.addRow([
      'Fecha Inicio', 'Fecha Fin', 'Asignatura', 'Nivel', 'Paralelo',
      'Horas', 'Horario', 'Docente', 'Aula / Lab.', 'Observación',
    ])
    headerStyle(ws, hRow)

    // ── Filas de datos ──
    const modAsigs = todasAsignaciones.filter(a => a.moduloId === modulo.id)
    const firstDataRowNum = hRow.number + 1

    if (modAsigs.length === 0) {
      const emptyRow = ws.addRow(['Sin asignaciones para esta jornada/sede', ...Array(9).fill('')])
      emptyRow.eachCell(cell => dataStyle(cell, false))
    } else {
      // Agrupar por nivelParaleloId manteniendo el orden
      const npMap = new Map<number, typeof modAsigs[0]['nivelParalelo']>()
      for (const a of modAsigs) if (!npMap.has(a.nivelParaleloId)) npMap.set(a.nivelParaleloId, a.nivelParalelo)
      const npOrder = Array.from(npMap.entries())

      // Estructura para hacer merges luego
      type SpanInfo = { startRow: number; endRow: number }
      const fiSpan: SpanInfo = { startRow: firstDataRowNum, endRow: firstDataRowNum }
      const npSpans: SpanInfo[] = []

      let currentRowNum = firstDataRowNum

      for (const [npId, np] of npOrder) {
        const asigs = modAsigs.filter(a => a.nivelParaleloId === npId)
        const npStart = currentRowNum

        asigs.forEach((a, i) => {
          const row = ws.addRow([
            i === 0 ? fi : null,
            i === 0 ? ff : null,
            a.asignatura.nombre,
            i === 0 ? np.nivel : null,
            np.paralelo,
            i === 0 ? `${horasModulo}h` : null,
            a.horario,
            a.docente?.nombre ?? 'SIN ASIGNAR',
            a.aula ?? '',
            '',
          ])
          row.eachCell(cell => dataStyle(cell, currentRowNum % 2 === 0))
          row.height = 20
          if (!a.docente) {
            row.getCell(8).font = { color: { argb: 'FFFF6600' }, italic: true, size: 10 }
          }
          currentRowNum++
        })

        npSpans.push({ startRow: npStart, endRow: currentRowNum - 1 })
      }

      fiSpan.endRow = currentRowNum - 1

      // ── Merges ──
      // Fecha inicio/fin: span todos los rows
      if (fiSpan.endRow > fiSpan.startRow) {
        ws.mergeCells(fiSpan.startRow, 1, fiSpan.endRow, 1)
        ws.mergeCells(fiSpan.startRow, 2, fiSpan.endRow, 2)
        ws.getCell(fiSpan.startRow, 1).alignment = { horizontal: 'center', vertical: 'middle' }
        ws.getCell(fiSpan.startRow, 2).alignment = { horizontal: 'center', vertical: 'middle' }
      }

      // Nivel y Horas: span por cada NP (si tiene >1 fila)
      for (const span of npSpans) {
        if (span.endRow > span.startRow) {
          ws.mergeCells(span.startRow, 4, span.endRow, 4) // Nivel
          ws.mergeCells(span.startRow, 6, span.endRow, 6) // Horas
          ws.getCell(span.startRow, 4).alignment = { horizontal: 'center', vertical: 'middle' }
          ws.getCell(span.startRow, 6).alignment = { horizontal: 'center', vertical: 'middle' }
        }
      }
    }
  }

  // ── HOJA 4: Carga Semanal ───────────────────────────────────────────────────
  const wsSem = wb.addWorksheet('Carga Semanal', {
    pageSetup: { orientation: 'landscape', fitToPage: true, fitToWidth: 1 },
  })

  const modNames  = modulos.map(m => m.nombre)
  const totalColsSem = 2 + modulos.length + 1   // Docente, Tipo, [M1,M2,M3], Total

  wsSem.columns = [
    { key: 'docente', width: 36 },
    { key: 'tipo',    width: 10 },
    ...modulos.map(() => ({ width: 16 })),
    { key: 'total',   width: 16 },
  ]

  wsSem.mergeCells(1, 1, 1, totalColsSem)
  const sem1 = wsSem.getCell('A1')
  sem1.value = `CARGA HORARIA SEMANAL — ${carrera?.nombre ?? ''}  |  ${jornadaLabel.toUpperCase()}  |  SEDE: ${sede}`
  sem1.font  = { bold: true, size: 12, color: { argb: BLANCO } }
  sem1.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: ROJO } }
  sem1.alignment = { horizontal: 'center', vertical: 'middle' }
  wsSem.getRow(1).height = 28

  wsSem.mergeCells(2, 1, 2, totalColsSem)
  const sem2 = wsSem.getCell('A2')
  sem2.value = `Período: ${periodo?.nombre ?? ''}  |  Horas/semana = suma de horas de cada slot semanal asignado al docente`
  sem2.font  = { italic: true, size: 9 }
  sem2.alignment = { horizontal: 'center' }
  wsSem.getRow(2).height = 14

  const semHeader = wsSem.addRow(['Docente', 'Tipo', ...modNames, 'Total h/sem'])
  headerStyle(wsSem, semHeader)

  docentes.forEach((d, idx) => {
    const horasPorMod = modulos.map(m =>
      todasAsignaciones
        .filter(a => a.moduloId === m.id && a.docenteId === d.id)
        .reduce((sum, a) => sum + parseSlotHours(a.horario), 0)
    )
    const total = horasPorMod.reduce((s, h) => s + h, 0)

    const row = wsSem.addRow([
      d.nombre, d.tipo,
      ...horasPorMod.map(h => h > 0 ? h.toFixed(1) : '—'),
      total > 0 ? total.toFixed(1) : '—',
    ])
    row.eachCell(cell => dataStyle(cell, idx % 2 === 0))
    row.height = 18
  })

  // ── HOJA 5: Carga Horaria Total ─────────────────────────────────────────────
  const wsTot = wb.addWorksheet('Carga Horaria Total', {
    pageSetup: { orientation: 'landscape', fitToPage: true, fitToWidth: 1 },
  })

  const totalColsTot = 2 + modulos.length + 4  // Docente, Tipo, [M1,M2,M3], Total, Min, Max, Estado

  wsTot.columns = [
    { key: 'docente', width: 36 },
    { key: 'tipo',    width: 10 },
    ...modulos.map(() => ({ width: 14 })),
    { key: 'total',  width: 14 },
    { key: 'min',    width: 10 },
    { key: 'max',    width: 10 },
    { key: 'estado', width: 28 },
  ]

  wsTot.mergeCells(1, 1, 1, totalColsTot)
  const tot1 = wsTot.getCell('A1')
  tot1.value = `CARGA HORARIA TOTAL — ${carrera?.nombre ?? ''}  |  ${jornadaLabel.toUpperCase()}  |  SEDE: ${sede}`
  tot1.font  = { bold: true, size: 12, color: { argb: BLANCO } }
  tot1.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: ROJO } }
  tot1.alignment = { horizontal: 'center', vertical: 'middle' }
  wsTot.getRow(1).height = 28

  wsTot.mergeCells(2, 1, 2, totalColsTot)
  const tot2 = wsTot.getCell('A2')
  tot2.value = `Período: ${periodo?.nombre ?? ''}  |  Referencia: TC = 272–380 h  |  MT = 136–190 h  |  Total = h/sem × semanas por módulo`
  tot2.font  = { italic: true, size: 9 }
  tot2.alignment = { horizontal: 'center' }
  wsTot.getRow(2).height = 14

  const totHeader = wsTot.addRow([
    'Docente', 'Tipo', ...modNames, 'Total Horas', 'Mín', 'Máx', 'Estado',
  ])
  headerStyle(wsTot, totHeader)

  let grandTotal = 0

  docentes.forEach((d, idx) => {
    const horasPorMod = modulos.map(m => {
      const semanas = moduleWeeks(m.fechaInicio, m.fechaFin)
      return todasAsignaciones
        .filter(a => a.moduloId === m.id && a.docenteId === d.id)
        .reduce((sum, a) => sum + parseSlotHours(a.horario) * semanas * 5, 0)
      // × 5: 5 días hábiles por semana (cada slot se imparte lunes-viernes)
    })
    const total = horasPorMod.reduce((s, h) => s + h, 0)
    grandTotal += total

    let estado = ''
    if (d.tipo !== 'TP') {
      if (total === 0)              estado = 'Sin asignaciones'
      else if (total < d.horasMin)  estado = `BAJO MÍNIMO (mín: ${d.horasMin}h)`
      else if (total > d.horasMax)  estado = `SUPERA MÁXIMO (máx: ${d.horasMax}h)`
      else                          estado = `OK  (${d.horasMin}–${d.horasMax}h)`
    }

    const row = wsTot.addRow([
      d.nombre, d.tipo,
      ...horasPorMod.map(h => Math.round(h) || 0),
      Math.round(total),
      d.tipo !== 'TP' ? d.horasMin : '',
      d.tipo !== 'TP' ? d.horasMax : '',
      estado,
    ])
    row.eachCell(cell => dataStyle(cell, idx % 2 === 0))
    row.height = 18

    // Colorear celda Estado
    const colEstado = 3 + modulos.length + 3
    const estadoCell = row.getCell(colEstado)
    if (estado.includes('BAJO') || estado.includes('SUPERA')) {
      estadoCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFC0C0' } }
      estadoCell.font = { bold: true, color: { argb: 'FFCC0000' }, size: 10 }
    } else if (estado.startsWith('OK')) {
      estadoCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC6EFCE' } }
      estadoCell.font = { bold: true, color: { argb: 'FF006100' }, size: 10 }
    }

    // Colorear celda Total si fuera de rango
    if (d.tipo !== 'TP') {
      const colTotal = 3 + modulos.length
      const totalCell = row.getCell(colTotal)
      if (total < d.horasMin || total > d.horasMax) {
        totalCell.font = { bold: true, color: { argb: 'FFCC0000' } }
      } else if (total >= d.horasMin) {
        totalCell.font = { bold: true, color: { argb: 'FF006100' } }
      }
    }
  })

  // Fila de total general
  const totalRow = wsTot.addRow([
    'TOTAL GENERAL', '',
    ...modulos.map(() => ''),
    Math.round(grandTotal),
    '', '', '',
  ])
  totalRow.eachCell(cell => {
    cell.fill   = { type: 'pattern', pattern: 'solid', fgColor: { argb: GRIS2 } }
    cell.font   = { bold: true }
    cell.border = { top: { style: 'medium' } }
  })

  const buffer = await wb.xlsx.writeBuffer()
  return Buffer.from(buffer)
}

// ─── Reporte individual de docente (sin cambios) ──────────────────────────────
export async function generarExcelDocente(docenteId: number): Promise<Buffer> {
  const docente = await prisma.docente.findUnique({
    where:   { id: docenteId },
    include: {
      asignaciones: {
        include: {
          asignatura:    true,
          modulo:        true,
          nivelParalelo: { include: { carrera: true } },
        },
        orderBy: [{ modulo: { numero: 'asc' } }, { horario: 'asc' }],
      },
    },
  })
  if (!docente) throw new Error('Docente no encontrado')

  const wb = new ExcelJS.Workbook()
  const ws = wb.addWorksheet('Asignaciones')

  ws.columns = [
    { key: 'modulo',     width: 14 },
    { key: 'asignatura', width: 42 },
    { key: 'nivel',      width: 7  },
    { key: 'paralelo',   width: 10 },
    { key: 'jornada',    width: 12 },
    { key: 'horario',    width: 16 },
    { key: 'aula',       width: 14 },
  ]

  ws.mergeCells('A1:G1')
  const t1 = ws.getCell('A1')
  t1.value = `ASIGNACIONES — ${docente.nombre.toUpperCase()} [${docente.tipo}]`
  t1.font  = { bold: true, size: 12, color: { argb: BLANCO } }
  t1.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: ROJO } }
  t1.alignment = { horizontal: 'center', vertical: 'middle' }
  ws.getRow(1).height = 28

  const hRow = ws.addRow(['Módulo', 'Asignatura', 'Nivel', 'Paralelo', 'Jornada', 'Horario', 'Aula'])
  headerStyle(ws, hRow)

  docente.asignaciones.forEach((a, idx) => {
    const row = ws.addRow({
      modulo:     a.modulo.nombre,
      asignatura: a.asignatura.nombre,
      nivel:      a.nivelParalelo.nivel,
      paralelo:   a.nivelParalelo.paralelo,
      jornada:    a.nivelParalelo.jornada,
      horario:    a.horario,
      aula:       a.aula ?? '',
    })
    row.eachCell(cell => dataStyle(cell, idx % 2 === 0))
    row.height = 18
  })

  const buffer = await wb.xlsx.writeBuffer()
  return Buffer.from(buffer)
}
