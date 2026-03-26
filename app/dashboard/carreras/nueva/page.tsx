import { redirect } from 'next/navigation'
import { crearCarrera } from '@/lib/actions/carreras'
import { CarreraForm } from '../carrera-form'
import { getCanEdit } from '@/lib/auth-utils'

export default async function NuevaCarreraPage() {
  if (!(await getCanEdit())) redirect('/dashboard/carreras')
  return (
    <div>
      <h1 style={{ fontSize: '22px', fontWeight: 400, color: '#2D3B45', marginBottom: '24px' }}>Nueva carrera</h1>
      <CarreraForm action={crearCarrera} />
    </div>
  )
}
