"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  BarChart3, 
  TrendingUp, 
  Eye, 
  Settings, 
  Wallet,
  History,
  Target,
} from "lucide-react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/lib/authStore";
import { useTranslation } from "@/lib/translations";
import { cn } from "@/lib/utils";
import { navItemHover, staggerContainer, staggerItem } from "@/lib/motionVariants";

export default function UserSidebar() {
  const { getUserDisplayName } = useAuthStore();
  const { t } = useTranslation();
  const pathname = usePathname();

  const navItems = [
    { href: "/", icon: LayoutDashboard, label: t('nav.dashboard') },
    { href: "/portfolio", icon: BarChart3, label: t('nav.portfolio') },
    { href: "/charts", icon: TrendingUp, label: t('nav.charts') },
    { href: "/watchlist", icon: Eye, label: t('nav.watchlist') },
    { href: "/balance", icon: Wallet, label: t('dashboard.availableCash') },
    { href: "/history", icon: History, label: t('history.title') },
    { href: "/alerts", icon: Target, label: t('notifications.priceAlert') },
    { href: "/indicators", icon: BarChart3, label: 'Indicators' },
    { href: "/settings", icon: Settings, label: t('nav.settings') },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-56 border-r bg-sidebar/95 backdrop-blur-sm z-50 hidden lg:block shadow-sm">
      <div className="h-full flex flex-col">
        <div className="px-5 py-5 border-b bg-gradient-to-r from-primary/5 to-transparent">
          <div className="text-xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
            TomTrade
          </div>
          <div className="text-sm text-muted-foreground">Trading Platform</div>
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
        <div className="p-4 border-t bg-gradient-to-t from-sidebar to-transparent">
          <div className="text-sm text-muted-foreground mb-2 truncate">
            {t('dashboard.welcome')}, <span className="font-medium text-foreground">{getUserDisplayName()}</span>
          </div>
          <Button className="w-full shadow-sm">{t('trading.placeOrder')}</Button>
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
          "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
          "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
          "border border-transparent hover:border-sidebar-border/50",
          isActive && "bg-primary/10 text-primary border-primary/20 shadow-sm"
        )}
      >
        <motion.span 
          className={cn(
            "text-muted-foreground group-hover:text-inherit transition-colors",
            isActive && "text-primary"
          )}
          whileHover={navItemHover}
        >
          {icon}
        </motion.span>
        <span>{label}</span>
        {isActive && (
          <motion.div
            layoutId="userActiveNav"
            className="ml-auto w-1.5 h-1.5 rounded-full bg-primary"
            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
          />
        )}
      </Link>
    </motion.li>
  );
}
