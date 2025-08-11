import type { ReactNode } from "react";
import Link from "next/link";
import { BarChart3, Bell, LayoutDashboard, Settings, Shield, Users2 } from "lucide-react";
import { InteractiveHoverButton } from "@/components/magicui/interactive-hover-button";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-[260px_1fr] bg-background text-foreground">
      <aside className="hidden lg:block border-r bg-sidebar">
        <div className="h-full flex flex-col">
          <div className="px-6 py-6 border-b">
            <div className="text-xl font-bold tracking-tight">TomTrade Admin</div>
            <div className="text-sm text-muted-foreground">Control Panel</div>
          </div>
          <nav className="flex-1 p-4 space-y-1">
            <SidebarLink href="/admin" label="Overview" icon={<LayoutDashboard className="size-4" />} />
            <SidebarLink href="/admin/users" label="Users" icon={<Users2 className="size-4" />} />
            <SidebarLink href="/admin/orders" label="Orders" icon={<BarChart3 className="size-4" />} />
            <SidebarLink href="/admin/risk" label="Risk" icon={<Shield className="size-4" />} />
            <SidebarLink href="/admin/settings" label="Settings" icon={<Settings className="size-4" />} />
          </nav>
          <div className="p-4 border-t">
            <InteractiveHoverButton className="w-full">Create Announcement</InteractiveHoverButton>
          </div>
        </div>
      </aside>

      <main className="flex flex-col min-w-0">
        <header className="sticky top-0 z-20 border-b bg-background/70 backdrop-blur supports-backdrop-blur:bg-background/60">
          <div className="flex items-center gap-3 px-4 lg:px-6 h-16">
            <button className="lg:hidden inline-flex items-center rounded-md border px-3 py-2 text-sm font-medium">
              Menu
            </button>
            <div className="font-semibold text-lg">Admin Dashboard</div>
            <div className="ml-auto flex items-center gap-3">
              <button aria-label="Notifications" className="relative rounded-full border p-2">
                <Bell className="size-4" />
                <span className="absolute -top-1 -right-1 inline-flex size-4 items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px]">4</span>
              </button>
              <Link href="/" className="rounded-md border px-3 py-2 text-sm font-medium">
                Home
              </Link>
            </div>
          </div>
        </header>
        <div className="flex-1 p-4 lg:p-6">{children}</div>
      </main>
    </div>
  );
}

function SidebarLink({ href, label, icon }: { href: string; label: string; icon: ReactNode }) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-sidebar-accent hover:text-sidebar-accent-foreground border border-transparent hover:border-sidebar-border"
    >
      <span className="text-muted-foreground group-hover:text-inherit">{icon}</span>
      <span>{label}</span>
    </Link>
  );
}


