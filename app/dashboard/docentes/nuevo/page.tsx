import { redirect } from 'next/navigation'
import { crearDocente } from '@/lib/actions/docentes'
import { DocenteForm } from '../docente-form'
import { getCanEdit } from '@/lib/auth-utils'

export default async function NuevoDocentePage() {
  if (!(await getCanEdit())) redirect('/dashboard/docentes')
  return (
    <div>
      <h1 style={{ fontSize: '22px', fontWeight: 400, color: '#2D3B45', marginBottom: '24px' }}>
        Nuevo docente
      </h1>
      <DocenteForm action={crearDocente} />
    </div>
  )
}
