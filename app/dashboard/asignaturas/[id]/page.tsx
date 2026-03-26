import { notFound, redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import { actualizarAsignatura, toggleActivoAsignatura } from '@/lib/actions/asignaturas'
import { AsignaturaForm } from '../asignatura-form'
import { ToggleActivoButton } from '@/app/dashboard/docentes/[id]/toggle-activo'
import { getCanEdit } from '@/lib/auth-utils'

interface Props {
  params: { id: string }
}

export default async function EditarAsignaturaPage({ params }: Props) {
  if (!(await getCanEdit())) redirect('/dashboard/asignaturas')
  const id = parseInt(params.id)
  if (isNaN(id)) notFound()

  const [asignatura, carreras] = await Promise.all([
    prisma.asignatura.findUnique({ where: { id } }),
    prisma.carrera.findMany({ where: { activo: true }, orderBy: { nombre: 'asc' } }),
  ])

  if (!asignatura) notFound()

  const action = actualizarAsignatura.bind(null, id)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 style={{ fontSize: '22px', fontWeight: 400, color: '#2D3B45' }}>Editar asignatura</h1>
        <ToggleActivoButton id={id} activo={asignatura.activo} toggle={toggleActivoAsignatura} />
      </div>
      <AsignaturaForm
        action={action}
        carreras={carreras}
        defaultValues={{
          carreraId: asignatura.carreraId,
          nombre: asignatura.nombre,
          codigo: asignatura.codigo ?? '',
          nivel: asignatura.nivel,
          horasMatutino: asignatura.horasMatutino,
          horasNocturno: asignatura.horasNocturno,
        }}
        isEdit
      />
    </div>
  )
}
