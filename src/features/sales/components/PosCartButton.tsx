import { ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface PosCartButtonProps {
  itemCount: number
  totalAmount: number
  onClick: () => void
  className?: string
}

export function PosCartButton({ itemCount, totalAmount, onClick, className }: PosCartButtonProps) {
  return (
    <Button
      type="button"
      size="icon"
      onClick={onClick}
      aria-label={`Open cart with ${itemCount} items`}
      className={cn(
        'relative h-14 w-14 rounded-full shadow-lg',
        itemCount > 0 ? 'bg-primary hover:opacity-90' : 'bg-muted text-muted-foreground hover:bg-muted',
        className,
      )}
    >
      <ShoppingCart className="h-6 w-6" />
      {itemCount > 0 ? (
        <span className="absolute -right-1 -top-1 flex h-6 min-w-6 items-center justify-center rounded-full border-2 border-background bg-destructive px-1 text-[11px] font-bold text-white">
          {itemCount > 99 ? '99+' : itemCount}
        </span>
      ) : null}
      {itemCount > 0 ? (
        <span className="sr-only">{totalAmount} total</span>
      ) : null}
    </Button>
  )
}
