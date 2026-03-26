import { GoogleGenerativeAI } from '@google/generative-ai'
import { prisma } from '@/lib/db'

const genAI = new GoogleGenerativeAI(process.env.GEMENI_API_KEY ?? '')

export interface SugerenciaIA {
  moduloId:        number
  docenteId:       number | null
  asignaturaId:    number
  nivelParaleloId: number
  horario:         string
  jornada:         string
  estado:          'PENDIENTE'
}

export interface ResultadoIA {
  asignaciones: SugerenciaIA[]
  advertencias: string[]
}

export interface AsignacionActual {
  nivelParaleloId: number
  horario:         string
  docenteId:       number | null
  asignaturaId:    number
}

export async function generarHorariosConIA(
  moduloId: number,
  asignacionesActuales: AsignacionActual[] = [],
): Promise<ResultadoIA> {
  // 1. Cargar el módulo con su periodo
  const modulo = await prisma.modulo.findUnique({
    where:   { id: moduloId },
    include: { periodo: true },
  })
  if (!modulo) throw new Error('Modulo no encontrado')

  const periodoId = modulo.periodoId

  // 2. Recopilar contexto
  const [docentes, asignaturas, nivelesParalelos, disponibilidades] =
    await prisma.$transaction([
      prisma.docente.findMany({ where: { activo: true }, orderBy: { nombre: 'asc' } }),
      prisma.asignatura.findMany({
        where:   { activo: true },
        include: { carrera: true },
        orderBy: [{ nivel: 'asc' }, { nombre: 'asc' }],
      }),
      prisma.nivelParalelo.findMany({
        where:   { periodoId, activo: true },
        include: { carrera: true },
        orderBy: [{ jornada: 'asc' }, { nivel: 'asc' }],
      }),
      prisma.disponibilidadDocente.findMany({
        where:   { moduloId },
        include: { docente: true },
      }),
    ])

  // Slots ya ocupados (desde el frontend — refleja el estado actual en pantalla)
  const slotsOcupados = asignacionesActuales.map(a => ({
    nivelParaleloId: a.nivelParaleloId,
    horario:         a.horario,
  }))

  // Carga por docente ya asignada en este módulo
  const cargaDocente: Record<number, number> = {}
  for (const a of asignacionesActuales) {
    if (a.docenteId) cargaDocente[a.docenteId] = (cargaDocente[a.docenteId] ?? 0) + 1
  }

  const HORARIOS = {
    MATUTINA: ['08:00-10:00', '10:00-12:00'],
    NOCTURNA: ['18:30-20:00', '20:00-21:30'],
  }

  const slotsLibres = nivelesParalelos.flatMap(np => {
    const horarios = HORARIOS[np.jornada as 'MATUTINA' | 'NOCTURNA']
    return horarios
      .filter(h => !slotsOcupados.some(s => s.nivelParaleloId === np.id && s.horario === h))
      .map(h => ({
        nivelParaleloId: np.id,
        nivel:           np.nivel,
        paralelo:        np.paralelo,
        jornada:         np.jornada,
        carrera:         np.carrera.nombre,
        horario:         h,
      }))
  })

  if (slotsLibres.length === 0) {
    return { asignaciones: [], advertencias: ['No hay slots libres en este modulo.'] }
  }

  const prompt = `Eres un experto en planificacion academica del Instituto Superior Tecnologico Quito.

MODULO A PLANIFICAR:
${JSON.stringify({
  id:            modulo.id,
  nombre:        modulo.nombre,
  horasMatutino: modulo.horasMatutino,
  horasNocturno: modulo.horasNocturno,
  fechaInicio:   modulo.fechaInicio,
  fechaFin:      modulo.fechaFin,
}, null, 2)}

DOCENTES DISPONIBLES (${docentes.length}):
${JSON.stringify(docentes.map(d => ({ id: d.id, nombre: d.nombre, tipo: d.tipo, horasMin: d.horasMin, horasMax: d.horasMax })), null, 2)}

ASIGNATURAS (${asignaturas.length}):
${JSON.stringify(asignaturas.map(a => ({ id: a.id, nombre: a.nombre, nivel: a.nivel, carrera: a.carrera.nombre })), null, 2)}

SLOTS LIBRES A CUBRIR (${slotsLibres.length}):
${JSON.stringify(slotsLibres, null, 2)}

DISPONIBILIDAD REGISTRADA:
${JSON.stringify(disponibilidades.map(d => ({ docenteId: d.docenteId, nombre: d.docente.nombre, jornada: d.jornada, horario: d.horario })), null, 2)}

ASIGNACIONES YA EXISTENTES EN LA TABLA (NO repetir estos slots):
${JSON.stringify(asignacionesActuales, null, 2)}

CARGA ACTUAL POR DOCENTE EN ESTE MODULO (max 3):
${JSON.stringify(
  docentes
    .filter(d => cargaDocente[d.id] !== undefined)
    .map(d => ({ docenteId: d.id, nombre: d.nombre, asignacionesActuales: cargaDocente[d.id] ?? 0, restantes: 3 - (cargaDocente[d.id] ?? 0) })),
  null, 2
)}

REGLAS ESTRICTAS:
1. Un docente puede tener MAXIMO 3 asignaturas en este modulo
2. Un docente NO puede estar en dos slots al mismo tiempo (mismo horario)
3. Asigna asignatura del nivel correcto al slot (slot nivel 2 = asignatura nivel 2)
4. Prioriza docentes con disponibilidad registrada para ese horario/jornada
5. Si no hay docente disponible para un slot, usa null en docenteId

Responde UNICAMENTE con JSON valido, sin texto adicional:
{
  "asignaciones": [
    {
      "moduloId": ${moduloId},
      "docenteId": <number o null>,
      "asignaturaId": <number>,
      "nivelParaleloId": <number>,
      "horario": "<HH:MM-HH:MM>",
      "jornada": "<MATUTINA o NOCTURNA>",
      "estado": "PENDIENTE"
    }
  ],
  "advertencias": ["<string>"]
}`

  const model    = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
  const result   = await model.generateContent(prompt)
  const texto    = result.response.text()

  // Extraer JSON aunque venga con markdown code block
  const match = texto.match(/\{[\s\S]*\}/)
  if (!match) throw new Error('Gemini no devolvio un JSON valido')

  try {
    const resultado: ResultadoIA = JSON.parse(match[0])
    return resultado
  } catch {
    throw new Error('Error al parsear la respuesta de Gemini')
  }
}
