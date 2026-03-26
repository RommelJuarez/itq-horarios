import { notFound, redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import { toggleActivoPeriodo } from '@/lib/actions/periodos'
import { ToggleActivoButton } from '@/app/dashboard/docentes/[id]/toggle-activo'
import { ModuloEditForm } from './modulo-edit-form'
import { getCanEdit } from '@/lib/auth-utils'

interface Props {
  params: { id: string }
}

const MOD_COLORS = ['#CC0000', '#0374B5', '#0B874B']

function fmt(d: Date) {
  return d.toISOString().split('T')[0]
}

export default async function EditarPeriodoPage({ params }: Props) {
  if (!(await getCanEdit())) redirect('/dashboard/periodos')
  const id = parseInt(params.id)
  if (isNaN(id)) notFound()

  const periodo = await prisma.periodoAcademico.findUnique({
    where: { id },
    include: { modulos: { orderBy: { numero: 'asc' } } },
  })
  if (!periodo) notFound()

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 400, color: '#2D3B45' }}>{periodo.nombre}</h1>
          <p style={{ fontSize: '12px', color: '#8B969D', marginTop: '2px' }}>
            {periodo.anio} · Periodo {periodo.numero}
          </p>
        </div>
        <ToggleActivoButton id={id} activo={periodo.activo} toggle={toggleActivoPeriodo} />
      </div>

      <div className="flex flex-col gap-4" style={{ maxWidth: '600px' }}>
        {periodo.modulos.map((m, i) => (
          <ModuloEditForm
            key={m.id}
            modulo={m}
            periodoId={id}
            color={MOD_COLORS[i]}
            defaultFechaInicio={fmt(m.fechaInicio)}
            defaultFechaFin={fmt(m.fechaFin)}
          />
        ))}
      </div>
    </div>
  )
}
