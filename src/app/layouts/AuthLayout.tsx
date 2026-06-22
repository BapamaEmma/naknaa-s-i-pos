import { Outlet } from 'react-router-dom'
import { APP_NAME } from '@/constants/app'
import naknaaLogo from '@/assets/naknaa-logo.png'

export function AuthLayout() {
  return (
    <div className="flex h-full flex-col items-center justify-center overflow-y-auto bg-muted/40 p-4">
      <div className="mb-8 flex flex-col items-center gap-3 text-center">
        <div className="rounded-2xl bg-black p-4 shadow-lg">
          <img
            src={naknaaLogo}
            alt={APP_NAME}
            className="h-auto w-full max-w-[280px] object-contain"
          />
        </div>
        <p className="text-sm text-muted-foreground">POS & Inventory Management System</p>
      </div>
      <div className="w-full max-w-md">
        <Outlet />
      </div>
    </div>
  )
}
