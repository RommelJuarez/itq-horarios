import { Skeleton, SkeletonCard, SkeletonPageHeader } from '@/components/ui/skeleton'

export default function LoadingDashboard() {
  return (
    <div>
      <div style={{ height: 22, marginBottom: 24 }}><Skeleton h={22} w={200} /></div>
      <div style={{ display: 'flex', gap: 12, marginBottom: 28 }}>
        {[1,2,3,4,5].map(i => (
          <div key={i} style={{ flex: 1, background: 'white', border: '1px solid #C7CDD1', borderRadius: 4, padding: '14px 18px' }}>
            <Skeleton h={28} w={40} mb={6} />
            <Skeleton h={11} w="80%" />
          </div>
        ))}
      </div>
      <Skeleton h={11} w={180} mb={12} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 28 }}>
        {[1,2,3].map(i => <SkeletonCard key={i} lines={3} />)}
      </div>
    </div>
  )
}
