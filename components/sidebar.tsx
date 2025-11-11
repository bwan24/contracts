"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { FileText, AlertTriangle, Settings, LayoutDashboard } from "lucide-react"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "工作台", href: "/", icon: LayoutDashboard },
  { name: "合同处理", href: "/contracts", icon: FileText },
  { name: "风险审核", href: "/risk-analysis", icon: AlertTriangle },
  { name: "规则管理", href: "/rules", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-screen w-64 flex-col border-r bg-background">
      <div className="flex h-16 items-center border-b px-6">
        <h1 className="text-lg font-semibold text-foreground">远景能源合同智审</h1>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>
      <div className="border-t p-4">
        <div className="text-xs text-muted-foreground">
          <p className="font-medium">系统版本 v1.0.0</p>
          <p className="mt-1">© 2025 远景能源</p>
        </div>
      </div>
    </div>
  )
}
