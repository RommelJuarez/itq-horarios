'use client'

import { useState, useCallback, useTransition, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import type { DragStartEvent, DragEndEvent } from '@dnd-kit/core'

import { crearAsignacion, actualizarAsignacion, eliminarAsignacion, quitarDocente } from '@/lib/actions/asignaciones'
import { toast } from '@/components/ui/toast'
import { TablaHorarioDnd } from './tabla-horario-dnd'
import { PanelIaDnd } from './panel-ia-dnd'
import { TabsCliente } from '@/app/dashboard/horarios/[moduloId]/tabs-cliente'
import { ResumenCarga } from './resumen-carga'

import type {
  AsignacionHorario,
  AsignaturaHorario,
  DocenteHorario,
  NivelParalelo,
  ModuloInfo,
  DragItemData,
  DropCellData,
} from './types'
import { NIVEL_COLORS } from './types'

// ─── DragOverlay chip ────────────────────────────────────────────────────────

function OverlayChip({ item }: { item: DragItemData }) {
  if (item.type === 'asignatura') {
    const c = NIVEL_COLORS[item.nivel] ?? NIVEL_COLORS[1]
    return (
      <div style={{
        padding: '6px 12px', borderRadius: 4, fontSize: 12, fontWeight: 600,
        backgroundColor: c.bg, color: c.text, border: `1px solid ${c.border}`,
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)', cursor: 'grabbing',
        whiteSpace: 'nowrap',
      }}>
        {item.nombre}
      </div>
    )
  }
  return (
    <div style={{
      padding: '6px 12px', borderRadius: 4, fontSize: 12,
      backgroundColor: '#2D3B45', color: 'white',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)', cursor: 'grabbing',
    }}>
      {item.nombre}
    </div>
  )
}

// ─── Props ───────────────────────────────────────────────────────────────────

interface Props {
  modulo: ModuloInfo
  jornada: 'MATUTINA' | 'NOCTURNA'
  nivelParalelos: NivelParalelo[]
  initialAsignaciones: AsignacionHorario[]
  asignaturas: AsignaturaHorario[]
  docentes: Omit<DocenteHorario, 'asignacionesEnModulo'>[]
  todosModulos: Parameters<typeof ResumenCarga>[0]['modulos']
  canEdit?: boolean
}

// ─── Wrapper ─────────────────────────────────────────────────────────────────

export function HorarioDndWrapper({
  modulo,
  jornada,
  nivelParalelos,
  initialAsignaciones,
  asignaturas,
  docentes,
  todosModulos,
  canEdit = true,
}: Props) {
  const router = useRouter()
  const [asignaciones, setAsignaciones] = useState<AsignacionHorario[]>(initialAsignaciones)
  const [activeDrag, setActiveDrag] = useState<DragItemData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: canEdit ? 5 : 99999 } })
  )

  // Carga dinámica de docentes (se recalcula al cambiar asignaciones)
  const docenteCounts = useMemo(() => {
    const counts: Record<number, number> = {}
    for (const a of asignaciones) {
      if (a.docente?.id) counts[a.docente.id] = (counts[a.docente.id] ?? 0) + 1
    }
    return counts
  }, [asignaciones])

  const docentesConCarga: DocenteHorario[] = useMemo(
    () => docentes.map(d => ({ ...d, asignacionesEnModulo: docenteCounts[d.id] ?? 0 })),
    [docentes, docenteCounts]
  )

  // ── Drag start: guardar qué estamos arrastrando ──
  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveDrag(event.active.data.current as DragItemData)
    setError(null)
  }, [])

  // ── Drag end: validar, actualizar optimistamente, persistir ──
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    setActiveDrag(null)
    const { active, over } = event
    if (!over) return

    const drag = active.data.current as DragItemData
    const drop = over.data.current as DropCellData
    if (!drag || !drop) return

    // ── Drop ASIGNATURA ──────────────────────────────────────────────────────
    if (drag.type === 'asignatura') {
      if (drop.cellType !== 'asignatura') return

      if (drag.nivel !== drop.nivelCelda) {
        setError(`Solo puedes colocar asignaturas de Nivel ${drop.nivelCelda} en esta celda.`)
        return
      }
      if (drop.asignacion) {
        setError('Esta celda ya tiene una asignatura. Elimínala primero.')
        return
      }

      // Optimistic: agregar asignación temporal
      const tempId = -Date.now()
      const asignatura = asignaturas.find(a => a.id === drag.id)!
      const optimista: AsignacionHorario = {
        id: tempId,
        nivelParaleloId: drop.nivelParaleloId,
        horario: drop.horario,
        estado: 'PENDIENTE',
        asignatura,
        docente: null,
        asignaturaId: drag.id,
        moduloId: modulo.id,
      }
      setAsignaciones(prev => [...prev, optimista])

      startTransition(async () => {
        const fd = new FormData()
        fd.set('moduloId', String(modulo.id))
        fd.set('asignaturaId', String(drag.id))
        fd.set('nivelParaleloId', String(drop.nivelParaleloId))
        fd.set('horario', drop.horario)

        const res = await crearAsignacion(undefined, fd)
        if (res?.error) {
          setError(res.error)
          setAsignaciones(prev => prev.filter(a => a.id !== tempId))
        } else {
          toast('Asignatura asignada')
        }
        router.refresh()
      })
    }

    // ── Drop DOCENTE ─────────────────────────────────────────────────────────
    if (drag.type === 'docente') {
      if (drop.cellType !== 'docente') return

      if (!drop.asignacion) {
        setError('Arrastra primero una asignatura a esta celda.')
        return
      }
      if (drop.asignacion.id < 0) {
        setError('Espera un momento: la asignatura aún se está guardando.')
        return
      }
      if (drop.asignacion.docente) {
        setError('Esta celda ya tiene docente. Elimina la asignación para cambiar.')
        return
      }

      const docente = docentes.find(d => d.id === drag.id)
      const asignId = drop.asignacion.id

      // Optimistic: agregar docente a la asignación
      setAsignaciones(prev => prev.map(a =>
        a.id === asignId
          ? { ...a, docente: docente ? { id: docente.id, nombre: docente.nombre, tipo: docente.tipo } : null }
          : a
      ))

      startTransition(async () => {
        const fd = new FormData()
        fd.set('moduloId', String(modulo.id))
        fd.set('asignaturaId', String(drop.asignacion!.asignaturaId))
        fd.set('nivelParaleloId', String(drop.nivelParaleloId))
        fd.set('horario', drop.horario)
        fd.set('docenteId', String(drag.id))

        const res = await actualizarAsignacion(asignId, undefined, fd)
        if (res?.error) {
          setError(res.error)
          setAsignaciones(prev => prev.map(a => a.id === asignId ? { ...a, docente: null } : a))
        } else {
          toast('Docente asignado')
        }
        router.refresh()
      })
    }
  }, [asignaciones, asignaturas, docentes, modulo.id, router])

  // ── Eliminar asignación completa ─────────────────────────────────────────
  const handleEliminar = useCallback((asig: AsignacionHorario) => {
    setError(null)
    setAsignaciones(prev => prev.filter(a => a.id !== asig.id))
    startTransition(async () => {
      const res = await eliminarAsignacion(asig.id, modulo.id)
      if (res?.error) {
        setError(res.error)
        setAsignaciones(prev => [...prev, asig])
      } else {
        toast('Asignación eliminada', 'error')
      }
      router.refresh()
    })
  }, [modulo.id, router])

  // ── Aplicar resultado de IA ───────────────────────────────────────────────
  const handleIAApply = useCallback((creadas: AsignacionHorario[]) => {
    setAsignaciones(prev => {
      const existentes = new Set(prev.map(a => `${a.nivelParaleloId}-${a.horario}`))
      const nuevas = creadas.filter(a => !existentes.has(`${a.nivelParaleloId}-${a.horario}`))
      return [...prev, ...nuevas]
    })
    toast(`IA asignó ${creadas.length} combinación${creadas.length !== 1 ? 'es' : ''}`)
    router.refresh()
  }, [router])

  // ── Quitar solo el docente ────────────────────────────────────────────────
  const handleEliminarDocente = useCallback((asig: AsignacionHorario) => {
    setError(null)
    setAsignaciones(prev => prev.map(a => a.id === asig.id ? { ...a, docente: null } : a))
    startTransition(async () => {
      const res = await quitarDocente(asig.id, modulo.id)
      if (res?.error) {
        setError(res.error)
        setAsignaciones(prev => prev.map(a => a.id === asig.id ? { ...a, docente: asig.docente } : a))
      } else {
        toast('Docente removido')
      }
      router.refresh()
    })
  }, [modulo.id, router])

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <DragOverlay dropAnimation={{ duration: 150, easing: 'ease' }}>
        {activeDrag ? <OverlayChip item={activeDrag} /> : null}
      </DragOverlay>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        {isPending && (
          <span style={{ fontSize: 11, color: '#8B969D' }}>Guardando...</span>
        )}
        {!canEdit && (
          <span style={{ fontSize: 11, color: '#E8A000', background: '#FFF8E6', border: '1px solid #F5D080', padding: '3px 10px', borderRadius: 4 }}>
            Solo lectura
          </span>
        )}
        <button
          onClick={() => router.refresh()}
          disabled={isPending}
          title="Refrescar tabla"
          style={{
            marginLeft: 'auto', fontSize: 12, padding: '5px 12px', borderRadius: 4,
            border: '1px solid #C7CDD1', background: 'white', color: isPending ? '#C7CDD1' : '#556572',
            cursor: isPending ? 'wait' : 'pointer',
          }}
        >
          ↻ Refrescar
        </button>
      </div>

      {error && (
        <div style={{
          background: '#FFF1F1', border: '1px solid #FFCCCC', color: '#CC0000',
          fontSize: 12, padding: '8px 14px', borderRadius: 4, marginBottom: 12,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          {error}
          <button onClick={() => setError(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#CC0000', fontSize: 16 }}>×</button>
        </div>
      )}

      <TabsCliente
        tablaContent={
          <div style={{ display: 'flex', gap: 16 }}>
            {/* Panel lateral — solo para editores */}
            {canEdit && (
              <div style={{
                width: 240, flexShrink: 0, background: 'white', border: '1px solid #C7CDD1',
                borderRadius: 4, display: 'flex', flexDirection: 'column',
                maxHeight: 'calc(100vh - 220px)', overflow: 'hidden',
              }}>
                <PanelIaDnd
                  asignaturas={asignaturas}
                  docentes={docentesConCarga}
                  moduloId={modulo.id}
                  asignaciones={asignaciones}
                  onIAApply={handleIAApply}
                />
              </div>
            )}
            {/* Tabla principal */}
            <div style={{ flex: 1, overflowX: 'auto' }}>
              <TablaHorarioDnd
                modulo={modulo}
                jornada={jornada}
                nivelParalelos={nivelParalelos}
                asignaciones={asignaciones}
                onEliminar={handleEliminar}
                onEliminarDocente={handleEliminarDocente}
                canEdit={canEdit}
              />
            </div>
          </div>
        }
        semanalContent={<ResumenCarga modulos={todosModulos} vista="semanal" />}
        totalContent={<ResumenCarga modulos={todosModulos} vista="total" />}
      />
    </DndContext>
  )
}
