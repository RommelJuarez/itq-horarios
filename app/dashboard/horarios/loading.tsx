import { Skeleton } from '@/components/ui/skeleton'

export default function LoadingHorariosSelector() {
  return (
    <div style={{ maxWidth: 700 }}>
      <Skeleton h={22} w={120} mb={24} />
      <Skeleton h={11} w={200} mb={12} />
      <div style={{ display: 'flex', gap: 8, marginBottom: 28 }}>
        {[1,2,3].map(i => (
          <div key={i} style={{ flex: 1, background: 'white', border: '1px solid #C7CDD1', borderRadius: 4, padding: '12px 14px' }}>
            <Skeleton h={8} w={8} mb={8} />
            <Skeleton h={12} w="60%" mb={4} />
            <Skeleton h={10} w="80%" />
          </div>
        ))}
      </div>
    </div>
  )
}
