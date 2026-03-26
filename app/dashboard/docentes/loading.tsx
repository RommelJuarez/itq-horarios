import { SkeletonTable, SkeletonPageHeader } from '@/components/ui/skeleton'

export default function LoadingDocentes() {
  return (
    <div>
      <SkeletonPageHeader />
      <SkeletonTable rows={8} />
    </div>
  )
}
