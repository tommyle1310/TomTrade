"use client";

import Link from "next/link";
import { 
  LayoutDashboard, 
  BarChart3, 
  TrendingUp, 
  Eye, 
  Settings, 
  Bell,
  Wallet,
  History,
  Target,
  BookOpen
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/lib/authStore";

export default function UserSidebar() {
  const { getUserDisplayName } = useAuthStore();

  return (
    <aside className="fixed left-0 top-0 h-screen w-54 border-r bg-sidebar z-50">
      <div className="h-full flex flex-col">
        <div className="px-6 py-6 border-b">
          <div className="text-xl font-bold tracking-tight">TomTrade</div>
          <div className="text-sm text-muted-foreground">Trading Platform</div>
        </div>
        <nav className="flex-1 p-3">
          <ul className="space-y-1">
            <NavItem href="/" icon={<LayoutDashboard className="size-4" />} label="Dashboard" />
            <NavItem href="/portfolio" icon={<BarChart3 className="size-4" />} label="Portfolio" />
            <NavItem href="/trading" icon={<TrendingUp className="size-4" />} label="Trading" />
            <NavItem href="/watchlist" icon={<Eye className="size-4" />} label="Watchlist" />
            <NavItem href="/balance" icon={<Wallet className="size-4" />} label="Balance" />
            <NavItem href="/history" icon={<History className="size-4" />} label="History" />
            <NavItem href="/alerts" icon={<Target className="size-4" />} label="Alerts" />
            <NavItem href="/education" icon={<BookOpen className="size-4" />} label="Education" />
            <NavItem href="/settings" icon={<Settings className="size-4" />} label="Settings" />
            <NavItem href="/notifications" icon={<Bell className="size-4" />} label="Notifications" />
          </ul>
        </nav>
        <div className="p-4 border-t">
          <div className="text-sm text-muted-foreground mb-2">
            Welcome, {getUserDisplayName()}
          </div>
          <Button className="w-full">New Trade</Button>
        </div>
      </div>
    </aside>
  );
}

function NavItem({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <li>
      <Link
        href={href}
        className="group flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-sidebar-accent hover:text-sidebar-accent-foreground border border-transparent hover:border-sidebar-border"
      >
        <span className="text-muted-foreground group-hover:text-inherit">{icon}</span>
        <span>{label}</span>
      </Link>
    </li>
  );
}
