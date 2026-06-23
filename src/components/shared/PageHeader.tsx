import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface PageHeaderProps {
  title: string
  description?: string
  backTo?: string
  backLabel?: string
  action?: React.ReactNode
  className?: string
}

export function PageHeader({
  title,
  description,
  backTo,
  backLabel = 'Back',
  action,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between',
        className,
      )}
    >
      <div className="min-w-0 space-y-3">
        {backTo ? (
          <Button variant="ghost" size="sm" asChild className="-ml-2 w-fit px-2">
            <Link to={backTo}>
              <ArrowLeft className="h-4 w-4" />
              {backLabel}
            </Link>
          </Button>
        ) : null}
        <div className="min-w-0">
          <h1 className="text-balance text-xl font-semibold tracking-tight sm:text-2xl">{title}</h1>
          {description ? (
            <p className="mt-1 text-pretty text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
      </div>
      {action ? (
        <div className="flex w-full shrink-0 flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:justify-end [&_a]:w-full [&_button]:w-full sm:[&_a]:w-auto sm:[&_button]:w-auto">
          {action}
        </div>
      ) : null}
    </div>
  )
}
