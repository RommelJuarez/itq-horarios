import { notFound, redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import { actualizarDocente, toggleActivoDocente } from '@/lib/actions/docentes'
import { DocenteForm } from '../docente-form'
import { ToggleActivoButton } from './toggle-activo'
import { getCanEdit } from '@/lib/auth-utils'

interface Props {
  params: { id: string }
}

export default async function EditarDocentePage({ params }: Props) {
  if (!(await getCanEdit())) redirect('/dashboard/docentes')
  const id = parseInt(params.id)
  if (isNaN(id)) notFound()

  const docente = await prisma.docente.findUnique({ where: { id } })
  if (!docente) notFound()

  const action = actualizarDocente.bind(null, id)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 style={{ fontSize: '22px', fontWeight: 400, color: '#2D3B45' }}>
          Editar docente
        </h1>
        <ToggleActivoButton id={id} activo={docente.activo} toggle={toggleActivoDocente} />
      </div>

      <DocenteForm
        action={action}
        defaultValues={{
          nombre: docente.nombre,
          tipo: docente.tipo,
          especialidad: docente.especialidad ?? '',
          activo: docente.activo,
        }}
        isEdit
      />
    </div>
  )
}
