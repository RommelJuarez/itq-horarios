import { Skeleton } from '@/components/ui/skeleton'

export default function LoadingHorarioModulo() {
  return (
    <div>
      {/* Header skeleton */}
      <div style={{ marginBottom: 20, borderBottom: '1px solid #DDD', paddingBottom: 16 }}>
        <Skeleton h={20} w={320} mb={8} />
        <Skeleton h={12} w={240} mb={10} />
        <div style={{ display: 'flex', gap: 16 }}>
          <Skeleton h={12} w={80} />
          <Skeleton h={12} w={100} />
          <Skeleton h={12} w={90} />
        </div>
      </div>

      {/* Tabs skeleton */}
      <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid #C7CDD1', marginBottom: 20 }}>
        {['Horario','Carga semanal','Carga total'].map(t => (
          <div key={t} style={{ padding: '8px 16px' }}>
            <Skeleton h={12} w={t.length * 7} />
          </div>
        ))}
      </div>

      {/* Table + panel skeleton */}
      <div style={{ display: 'flex', gap: 16 }}>
        {/* Panel skeleton */}
        <div style={{ width: 240, flexShrink: 0, background: 'white', border: '1px solid #C7CDD1', borderRadius: 4, padding: 12 }}>
          <div style={{ display: 'flex', gap: 0, marginBottom: 12 }}>
            <Skeleton h={30} w="50%" />
            <Skeleton h={30} w="50%" />
          </div>
          {[1,2,3,4,5].map(i => <Skeleton key={i} h={32} mb={6} />)}
        </div>

        {/* Table skeleton */}
        <div style={{ flex: 1, background: 'white', border: '1px solid #C7CDD1', borderRadius: 4, overflow: 'hidden' }}>
          <div style={{ display: 'flex', background: '#F5F5F5', borderBottom: '1px solid #C7CDD1', padding: '10px 14px', gap: 8 }}>
            {[80,120,60,40,80,80,120].map((w,i) => <Skeleton key={i} h={11} w={w} />)}
          </div>
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} style={{ display: 'flex', borderBottom: '1px solid #EEF0F2', padding: '8px 14px', gap: 8, alignItems: 'center', height: 52 }}>
              {[80,120,60,40,80,80,120].map((w,j) => <Skeleton key={j} h={28} w={w} />)}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
