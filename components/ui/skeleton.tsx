export function Skeleton({ h = 16, w = '100%', mb = 0 }: { h?: number; w?: string | number; mb?: number }) {
  return (
    <div
      className="skeleton"
      style={{ height: h, width: w, marginBottom: mb, borderRadius: 4, flexShrink: 0 }}
    />
  )
}

export function SkeletonCard({ lines = 2 }: { lines?: number }) {
  return (
    <div style={{ background: 'white', border: '1px solid #C7CDD1', borderRadius: 4, overflow: 'hidden', padding: '14px 16px' }}>
      <Skeleton h={14} w="60%" mb={8} />
      {Array.from({ length: lines - 1 }).map((_, i) => (
        <Skeleton key={i} h={11} w="80%" mb={i < lines - 2 ? 6 : 0} />
      ))}
    </div>
  )
}

export function SkeletonRow() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid #EEF0F2', gap: 12 }}>
      <Skeleton h={13} w="40%" />
      <Skeleton h={13} w="20%" />
      <Skeleton h={13} w="15%" />
    </div>
  )
}

export function SkeletonTable({ rows = 6 }: { rows?: number }) {
  return (
    <div style={{ background: 'white', border: '1px solid #C7CDD1', borderRadius: 4, overflow: 'hidden' }}>
      <div style={{ height: 38, background: '#F5F5F5', borderBottom: '1px solid #C7CDD1', padding: '0 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <Skeleton h={10} w={80} />
        <Skeleton h={10} w={60} />
        <Skeleton h={10} w={100} />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonRow key={i} />
      ))}
    </div>
  )
}

export function SkeletonPageHeader() {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
      <Skeleton h={22} w={180} />
      <Skeleton h={32} w={90} />
    </div>
  )
}
