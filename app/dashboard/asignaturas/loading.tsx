import { SkeletonTable, SkeletonPageHeader, Skeleton } from '@/components/ui/skeleton'

export default function LoadingAsignaturas() {
  return (
    <div>
      <SkeletonPageHeader />
      {[1,2,3].map(i => (
        <div key={i} style={{ marginBottom: 24 }}>
          <Skeleton h={11} w={80} mb={12} />
          <SkeletonTable rows={3} />
        </div>
      ))}
    </div>
  )
}
