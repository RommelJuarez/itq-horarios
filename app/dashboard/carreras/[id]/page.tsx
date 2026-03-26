import { notFound, redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import { actualizarCarrera } from '@/lib/actions/carreras'
import { CarreraForm } from '../carrera-form'
import { getCanEdit } from '@/lib/auth-utils'

interface Props {
  params: { id: string }
}

export default async function EditarCarreraPage({ params }: Props) {
  if (!(await getCanEdit())) redirect('/dashboard/carreras')
  const id = parseInt(params.id)
  if (isNaN(id)) notFound()

  const carrera = await prisma.carrera.findUnique({ where: { id } })
  if (!carrera) notFound()

  const action = actualizarCarrera.bind(null, id)

  return (
    <div>
      <h1 style={{ fontSize: '22px', fontWeight: 400, color: '#2D3B45', marginBottom: '24px' }}>Editar carrera</h1>
      <CarreraForm
        action={action}
        defaultValues={{ nombre: carrera.nombre, codigo: carrera.codigo, sede: carrera.sede }}
        isEdit
      />
    </div>
  )
}
