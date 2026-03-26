// ─── Entidades ───────────────────────────────────────────────────────────────

export interface NivelParalelo {
  id: number
  nivel: number
  paralelo: string
  jornada: 'MATUTINA' | 'NOCTURNA'
  sede: string
  activo: boolean
}

export interface AsignaturaHorario {
  id: number
  nombre: string
  nivel: number
  codigo?: string | null
}

export interface DocenteHorario {
  id: number
  nombre: string
  tipo: 'TC' | 'TP' | 'MT'
  asignacionesEnModulo: number
}

export interface AsignacionHorario {
  id: number
  nivelParaleloId: number
  horario: string
  estado: 'PENDIENTE' | 'ASIGNADO' | 'CONFIRMADO'
  asignatura: { id: number; nombre: string; nivel: number }
  docente?: { id: number; nombre: string; tipo: string } | null
  asignaturaId: number
  moduloId: number
}

export interface ModuloInfo {
  id: number
  nombre: string
  numero: number
  fechaInicio: Date
  fechaFin: Date
  horasMatutino: number
  horasNocturno: number
}

// ─── DnD ──────────────────────────────────────────────────────────────────────

export type DragItemData =
  | { type: 'asignatura'; id: number; nivel: number; nombre: string }
  | { type: 'docente';    id: number; nombre: string; tipo: string }

export interface DropCellData {
  cellType: 'asignatura' | 'docente'
  nivelParaleloId: number
  horario: string
  nivelCelda: number
  asignacion: AsignacionHorario | null
}

// ─── Constantes ──────────────────────────────────────────────────────────────

export const HORARIOS: Record<'MATUTINA' | 'NOCTURNA', string[]> = {
  MATUTINA: ['08:00-10:00', '10:00-12:00'],
  NOCTURNA: ['18:30-20:00', '20:00-21:30'],
}

export const NIVEL_COLORS: Record<number, { bg: string; text: string; border: string; solid: string }> = {
  1: { bg: '#FFF1F1', text: '#CC0000', border: '#FFCCCC', solid: '#CC0000' },
  2: { bg: '#EEF4FB', text: '#0374B5', border: '#BDD4EE', solid: '#0374B5' },
  3: { bg: '#F0FFF7', text: '#0B874B', border: '#BBDDCC', solid: '#0B874B' },
  4: { bg: '#FFF8E6', text: '#E8A000', border: '#F5D080', solid: '#FC5E13' },
  5: { bg: '#F5F0FF', text: '#7B3FC4', border: '#D0B8F0', solid: '#7B2D8B' },
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function buildAsigMap(asignaciones: AsignacionHorario[]): Record<string, AsignacionHorario> {
  const map: Record<string, AsignacionHorario> = {}
  for (const a of asignaciones) {
    map[`${a.nivelParaleloId}-${a.horario}`] = a
  }
  return map
}
