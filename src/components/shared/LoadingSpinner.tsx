import { cn } from '@/lib/utils'
import { LoadingShimmer, type LoadingLayout } from '@/components/shared/LoadingShimmer'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  variant?: 'spinner' | 'shimmer'
  layout?: LoadingLayout
}

const sizeClasses = {
  sm: 'h-4 w-4 border-2',
  md: 'h-6 w-6 border-2',
  lg: 'h-10 w-10 border-[3px]',
}

export function LoadingSpinner({
  size = 'md',
  className,
  variant,
  layout = 'default',
}: LoadingSpinnerProps) {
  const useSpinner = variant === 'spinner' || size === 'sm'

  if (useSpinner) {
    return (
      <div
        className={cn(
          'animate-spin rounded-full border-primary border-t-transparent',
          sizeClasses[size],
          className,
        )}
        role="status"
        aria-label="Loading"
      />
    )
  }

  return <LoadingShimmer layout={layout} className={className} />
}
