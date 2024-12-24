
interface QuickAction{
    label?: string,
    href?: string,
    icon?: React.ReactNode
    variant?: "classic" | "solid" | "soft" | "surface"| "outline"| "ghost"
    component?: JSX.Element
}
export interface HeaderProps{
    title: string,
    quickActions?: Array<QuickAction>
    edited?: number
}