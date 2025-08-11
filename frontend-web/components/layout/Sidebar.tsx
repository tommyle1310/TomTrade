"use client";

import Link from "next/link";
import { LayoutDashboard, Users2, Shield, Settings, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Sidebar() {
  return (
    <aside className="h-full border-r bg-sidebar">
      <div className="h-full flex flex-col">
        <div className="px-6 py-6 border-b">
          <div className="text-xl font-bold tracking-tight">TomTrade Admin</div>
          <div className="text-sm text-muted-foreground">Control Panel</div>
        </div>
        <nav className="flex-1 p-3">
          <ul className="space-y-1">
            <NavItem href="/" icon={<LayoutDashboard className="size-4" />} label="Dashboard" />
            <NavItem href="/admin/users" icon={<Users2 className="size-4" />} label="Manage Users" />
            <NavItem href="/risk" icon={<Shield className="size-4" />} label="Risk" />
            <NavItem href="/settings" icon={<Settings className="size-4" />} label="Settings" />
            <NavItem href="/notifications" icon={<Bell className="size-4" />} label="Notifications" />
          </ul>
        </nav>
        <div className="p-4 border-t">
          <Button className="w-full">New Announcement</Button>
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


