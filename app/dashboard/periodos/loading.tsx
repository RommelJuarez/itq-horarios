import { Skeleton, SkeletonPageHeader } from '@/components/ui/skeleton'

export default function LoadingPeriodos() {
  return (
    <div>
      <SkeletonPageHeader />
      {[1,2].map(i => (
        <div key={i} style={{ background: 'white', border: '1px solid #C7CDD1', borderRadius: 4, overflow: 'hidden', marginBottom: 16 }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid #EEF0F2', display: 'flex', justifyContent: 'space-between' }}>
            <Skeleton h={14} w={200} />
            <Skeleton h={14} w={50} />
          </div>
          <div style={{ display: 'flex' }}>
            {[1,2,3].map(j => (
              <div key={j} style={{ flex: 1, padding: '12px 16px', borderRight: j < 3 ? '1px solid #EEF0F2' : 'none' }}>
                <Skeleton h={12} w="70%" mb={6} />
                <Skeleton h={10} w="90%" mb={4} />
                <Skeleton h={10} w="60%" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
