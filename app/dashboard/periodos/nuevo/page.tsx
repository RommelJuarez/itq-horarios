import { redirect } from 'next/navigation'
import { crearPeriodo } from '@/lib/actions/periodos'
import { PeriodoForm } from '../periodo-form'
import { getCanEdit } from '@/lib/auth-utils'

export default async function NuevoPeriodoPage() {
  if (!(await getCanEdit())) redirect('/dashboard/periodos')
  return (
    <div>
      <h1 style={{ fontSize: '22px', fontWeight: 400, color: '#2D3B45', marginBottom: '24px' }}>
        Nuevo periodo académico
      </h1>
      <PeriodoForm action={crearPeriodo} />
    </div>
  )
}
