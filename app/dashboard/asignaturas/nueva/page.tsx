import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import { crearAsignatura } from '@/lib/actions/asignaturas'
import { AsignaturaForm } from '../asignatura-form'
import { getCanEdit } from '@/lib/auth-utils'

export default async function NuevaAsignaturaPage() {
  if (!(await getCanEdit())) redirect('/dashboard/asignaturas')
  const carreras = await prisma.carrera.findMany({ where: { activo: true }, orderBy: { nombre: 'asc' } })

  return (
    <div>
      <h1 style={{ fontSize: '22px', fontWeight: 400, color: '#2D3B45', marginBottom: '24px' }}>
        Nueva asignatura
      </h1>
      <AsignaturaForm action={crearAsignatura} carreras={carreras} />
    </div>
  )
}
