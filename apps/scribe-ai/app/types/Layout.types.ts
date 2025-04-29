type QuickAction = {
  label: string
  href: string
  icon?: unknown
}

export interface LayoutProps {
  children: React.ReactNode
  title?: string
  searchBar?: React.ReactNode
  tabs?: React.ReactNode
  quickActions?: Array<QuickAction>
}
