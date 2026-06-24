import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useSetPageTitle } from '@/app/providers/PageTitleProvider'
import { Button } from '@/components/ui/button'

interface PurchasePageHeaderProps {
  title: string
  description?: string
  backTo?: string
  backLabel?: string
  action?: React.ReactNode
}

export function PurchasePageHeader({
  title,
  description,
  backTo,
  backLabel = 'Back',
  action,
}: PurchasePageHeaderProps) {
  useSetPageTitle(title)

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div className="space-y-3">
        {backTo ? (
          <Button variant="ghost" size="sm" asChild className="-ml-2 w-fit px-2">
            <Link to={backTo}>
              <ArrowLeft className="h-4 w-4" />
              {backLabel}
            </Link>
          </Button>
        ) : null}
        {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {action ? <div className="flex shrink-0 flex-wrap gap-2">{action}</div> : null}
    </div>
  )
}
