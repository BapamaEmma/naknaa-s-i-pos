import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useLocation } from 'react-router-dom'
import { getPageTitleFromPath } from '@/constants/navigation'

interface PageTitleContextValue {
  title: string
  setTitle: (title: string) => void
}

const PageTitleContext = createContext<PageTitleContextValue | null>(null)

export function PageTitleProvider({ children }: { children: ReactNode }) {
  const location = useLocation()
  const [overrideTitle, setOverrideTitle] = useState('')

  useEffect(() => {
    setOverrideTitle('')
  }, [location.pathname])

  const title = overrideTitle || getPageTitleFromPath(location.pathname)

  const value = useMemo(
    () => ({
      title,
      setTitle: setOverrideTitle,
    }),
    [title],
  )

  return <PageTitleContext.Provider value={value}>{children}</PageTitleContext.Provider>
}

export function usePageTitle() {
  const context = useContext(PageTitleContext)
  if (!context) {
    throw new Error('usePageTitle must be used within PageTitleProvider')
  }
  return context.title
}

export function useSetPageTitle(title: string) {
  const context = useContext(PageTitleContext)
  if (!context) {
    throw new Error('useSetPageTitle must be used within PageTitleProvider')
  }

  useEffect(() => {
    context.setTitle(title)
    return () => context.setTitle('')
  }, [context, title])
}
