import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'

export type LoadingLayout =
  | 'default'
  | 'table'
  | 'cards'
  | 'page'
  | 'form'
  | 'chart'
  | 'grid'
  | 'inline'

interface LoadingShimmerProps {
  layout?: LoadingLayout
  className?: string
  rows?: number
  columns?: number
  cards?: number
}

export function LoadingShimmer({
  layout = 'default',
  className,
  rows = 6,
  columns = 5,
  cards = 4,
}: LoadingShimmerProps) {
  switch (layout) {
    case 'table':
      return <TableShimmer rows={rows} columns={columns} className={className} />
    case 'cards':
      return <CardsShimmer count={cards} className={className} />
    case 'page':
      return <PageShimmer className={className} />
    case 'form':
      return <FormShimmer className={className} />
    case 'chart':
      return <ChartShimmer className={className} />
    case 'grid':
      return <GridShimmer className={className} />
    case 'inline':
      return <InlineShimmer className={className} />
    default:
      return <BlockShimmer className={className} />
  }
}

function TableShimmer({
  rows,
  columns,
  className,
}: {
  rows: number
  columns: number
  className?: string
}) {
  return (
    <div className={cn('w-full space-y-3', className)} role="status" aria-label="Loading">
      <div className="flex gap-3 border-b pb-3">
        {Array.from({ length: columns }).map((_, index) => (
          <Skeleton key={`head-${index}`} className="h-4 flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={`row-${rowIndex}`} className="flex gap-3 py-1">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton
              key={`cell-${rowIndex}-${colIndex}`}
              className={cn('h-10 flex-1', colIndex === 0 && 'max-w-[3rem]')}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

function CardsShimmer({ count, className }: { count: number; className?: string }) {
  return (
    <div
      className={cn('grid w-full gap-4 sm:grid-cols-2 xl:grid-cols-4', className)}
      role="status"
      aria-label="Loading"
    >
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="rounded-xl border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
          <Skeleton className="mt-4 h-8 w-16" />
        </div>
      ))}
    </div>
  )
}

function PageShimmer({ className }: { className?: string }) {
  return (
    <div className={cn('w-full space-y-6 p-4 md:p-6 lg:p-8', className)} role="status" aria-label="Loading">
      <div className="rounded-xl border bg-card p-6">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="mt-3 h-10 w-full max-w-xl" />
        <Skeleton className="mt-3 h-4 w-56" />
      </div>
      <CardsShimmer count={4} />
      <div className="grid gap-6 xl:grid-cols-3">
        <Skeleton className="h-72 rounded-xl xl:col-span-2" />
        <Skeleton className="h-72 rounded-xl" />
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    </div>
  )
}

function FormShimmer({ className }: { className?: string }) {
  return (
    <div className={cn('w-full space-y-6', className)} role="status" aria-label="Loading">
      <div className="grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-24 w-full" />
      </div>
      <Skeleton className="h-10 w-32" />
    </div>
  )
}

function ChartShimmer({ className }: { className?: string }) {
  return (
    <div
      className={cn('flex h-48 w-full flex-col justify-end gap-2 rounded-xl border bg-card p-4', className)}
      role="status"
      aria-label="Loading"
    >
      <div className="flex h-full items-end gap-2">
        {[40, 65, 45, 80, 55, 70, 50].map((height, index) => (
          <Skeleton key={index} className="flex-1 rounded-t-md" style={{ height: `${height}%` }} />
        ))}
      </div>
      <Skeleton className="h-3 w-full" />
    </div>
  )
}

function GridShimmer({ className }: { className?: string }) {
  return (
    <div
      className={cn('grid w-full grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4', className)}
      role="status"
      aria-label="Loading"
    >
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={index} className="overflow-hidden rounded-xl border bg-card">
          <Skeleton className="aspect-square w-full rounded-none" />
          <div className="space-y-2 p-3">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-8 w-full rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  )
}

function InlineShimmer({ className }: { className?: string }) {
  return (
    <div className={cn('w-full space-y-2', className)} role="status" aria-label="Loading">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  )
}

function BlockShimmer({ className }: { className?: string }) {
  return (
    <div className={cn('w-full space-y-3', className)} role="status" aria-label="Loading">
      <Skeleton className="h-5 w-1/3" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="mt-2 h-32 w-full rounded-xl" />
    </div>
  )
}
