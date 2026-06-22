import { cn } from '@/lib/utils'

export const inputClassName =
  'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring'

export const selectClassName = cn(inputClassName, 'cursor-pointer')

export const textareaClassName = cn(inputClassName, 'min-h-24 py-2')

export const labelClassName = 'text-sm font-medium'

export const buttonPrimaryClassName =
  'inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50'

export const buttonSecondaryClassName =
  'inline-flex h-10 items-center justify-center rounded-md border bg-background px-4 text-sm font-medium transition-colors hover:bg-muted disabled:opacity-50'

export const buttonDestructiveClassName =
  'inline-flex h-10 items-center justify-center rounded-md bg-destructive px-4 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50'
