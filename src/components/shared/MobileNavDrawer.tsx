import { useEffect } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SidebarNav } from '@/components/shared/SidebarNav'
import { cn } from '@/lib/utils'

interface MobileNavDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function MobileNavDrawer({ open, onOpenChange }: MobileNavDrawerProps) {
  useEffect(() => {
    if (!open) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onOpenChange(false)
      }
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [open, onOpenChange])

  return (
    <>
      <button
        type="button"
        aria-label="Close menu"
        aria-hidden={!open}
        tabIndex={open ? 0 : -1}
        onClick={() => onOpenChange(false)}
        className={cn(
          'fixed inset-0 z-50 bg-black/50 transition-opacity duration-300 md:hidden',
          open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0',
        )}
      />

      <aside
        aria-hidden={!open}
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-[min(100vw-3rem,20rem)] flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground shadow-2xl transition-transform duration-300 ease-out md:hidden safe-top safe-bottom',
          open ? 'translate-x-0' : '-translate-x-full pointer-events-none',
        )}
      >
        <div className="flex items-center justify-end border-b px-2 py-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Close menu"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <SidebarNav
          showBrand={false}
          showUser
          onNavigate={() => onOpenChange(false)}
          className="min-h-0 flex-1"
        />
      </aside>
    </>
  )
}
