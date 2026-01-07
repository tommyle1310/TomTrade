"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users2, Shield, Settings, Bell, FileText, TrendingUp } from "lucide-react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/translations";
import { cn } from "@/lib/utils";
import { navItemHover, staggerContainer, staggerItem } from "@/lib/motionVariants";

export default function Sidebar() {
  const { t } = useTranslation();
  const pathname = usePathname();

  const navItems = [
    { href: "/", icon: LayoutDashboard, label: t('nav.dashboard') },
    { href: "/admin/users", icon: Users2, label: t('nav.manageUsers') },
    { href: "/admin/transaction-logs", icon: FileText, label: t('nav.transactionLogs') },
    { href: "/admin/order-logs", icon: FileText, label: t('nav.orderLogs') },
    { href: "/charts", icon: TrendingUp, label: t('nav.charts') },
    { href: "/admin/stocks", icon: FileText, label: t('nav.stocks') },
    { href: "/risk", icon: Shield, label: t('nav.risk') },
    { href: "/settings", icon: Settings, label: t('nav.settings') },
    { href: "/notifications", icon: Bell, label: t('nav.notifications') },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-56 glass-strong border-r border-glass-border z-50 hidden lg:block shadow-elevated-lg">
      <div className="h-full flex flex-col">
        <div className="px-5 py-6 border-b border-glass-border bg-gradient-to-br from-primary/10 via-transparent to-accent/5">
          <div className="text-xl font-bold tracking-tight bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            TomTrade
          </div>
          <div className="text-xs text-muted-foreground mt-1 font-medium">{t('nav.controlPanel')}</div>
        </div>
        <motion.nav
          className="flex-1 p-3 overflow-y-auto"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          <ul className="space-y-1">
            {navItems.map((item) => (
              <NavItem
                key={item.href}
                href={item.href}
                icon={<item.icon className="size-4" />}
                label={item.label}
                isActive={pathname === item.href}
              />
            ))}
          </ul>
        </motion.nav>
        <div className="p-4 border-t border-glass-border bg-gradient-to-t from-accent/5 to-transparent">
          <Button className="w-full shadow-md hover:shadow-lg transition-shadow">{t('nav.newAnnouncement')}</Button>
        </div>
      </div>
    </aside>
  );
}

function NavItem({
  href,
  icon,
  label,
  isActive
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
}) {
  return (
    <motion.li variants={staggerItem}>
      <Link
        href={href}
        className={cn(
          "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 cursor-pointer",
          "hover:bg-primary/10 hover:text-foreground hover:shadow-sm",
          "border border-transparent hover:border-primary/20",
          isActive && "glass-subtle bg-gradient-to-r from-primary/15 to-accent/10 text-primary border-primary/30 shadow-md shadow-primary/10"
        )}
      >
        <motion.span
          className={cn(
            "text-muted-foreground group-hover:text-primary transition-colors",
            isActive && "text-primary"
          )}
          whileHover={navItemHover}
        >
          {icon}
        </motion.span>
        <span className={isActive ? "font-semibold" : ""}>{label}</span>
        {isActive && (
          <motion.div
            layoutId="activeNav"
            className="ml-auto w-2 h-2 rounded-full bg-primary shadow-glow"
            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
          />
        )}
      </Link>
    </motion.li>
  );
}


