import { Outlet } from 'react-router-dom'
import { APP_NAME } from '@/constants/app'
import naknaaLogo from '@/assets/naknaa-logo.png'

export function AuthLayout() {
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center overflow-y-auto bg-muted/40 p-4 pb-safe safe-top">
      <div className="mb-6 flex w-full max-w-md flex-col items-center gap-3 text-center sm:mb-8">
        <img
          src={naknaaLogo}
          alt={APP_NAME}
          className="h-auto w-full max-w-[220px] object-contain sm:max-w-[280px]"
        />
        <p className="text-base font-bold text-foreground sm:text-lg">
          POS & Inventory Management System
        </p>
      </div>
      <div className="w-full max-w-md">
        <Outlet />
      </div>
    </div>
  )
}
