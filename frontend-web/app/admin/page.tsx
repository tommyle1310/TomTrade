import Image from "next/image";
import { DollarSign, TrendingUp, Users, Activity, ArrowUpRight, ArrowDownRight, Home, User, Settings as Cog, Bell } from "lucide-react";
import { InteractiveHoverButton } from "@/components/magicui/interactive-hover-button";
import { Button } from "@/components/ui/button";
import { Marquee } from "@/components/magicui/marquee";
import { AnimatedList } from "@/components/magicui/animated-list";
import { Dock } from "@/components/magicui/dock";
import { TweetCard } from "@/components/magicui/tweet-card";

type Kpi = {
  id: string;
  label: string;
  value: string;
  delta: string;
  trend: "up" | "down" | "flat";
  icon: React.ReactNode;
};

const kpis: Kpi[] = [
  {
    id: "revenue",
    label: "Total Revenue",
    value: "$120,567.90",
    delta: "+8.0%",
    trend: "up",
    icon: <DollarSign className="size-5" />,
  },
  {
    id: "equity",
    label: "Equity",
    value: "$240,952.00",
    delta: "+1.6%",
    trend: "up",
    icon: <TrendingUp className="size-5" />,
  },
  {
    id: "users",
    label: "Active Users",
    value: "8,908",
    delta: "+3.2%",
    trend: "up",
    icon: <Users className="size-5" />,
  },
  {
    id: "uptime",
    label: "Service Uptime",
    value: "99.98%",
    delta: "+0.01%",
    trend: "up",
    icon: <Activity className="size-5" />,
  },
];

export default function AdminOverviewPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Welcome back, Admin</h1>
          <p className="text-muted-foreground">Overview of platform performance and operations.</p>
        </div>
        <div className="flex gap-2">
          <InteractiveHoverButton>Invite User</InteractiveHoverButton>
          <Button>Generate Report</Button>
        </div>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <div key={kpi.id} className="rounded-xl border bg-card text-card-foreground p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">{kpi.label}</div>
              <div className="text-muted-foreground">{kpi.icon}</div>
            </div>
            <div className="mt-2 flex items-end justify-between">
              <div className="text-2xl font-semibold">{kpi.value}</div>
              <div
                className={
                  kpi.trend === "up"
                    ? "inline-flex items-center gap-1 rounded-full bg-green-50 text-green-700 px-2 py-0.5 text-xs"
                    : kpi.trend === "down"
                    ? "inline-flex items-center gap-1 rounded-full bg-red-50 text-red-700 px-2 py-0.5 text-xs"
                    : "inline-flex items-center gap-1 rounded-full bg-neutral-100 text-neutral-600 px-2 py-0.5 text-xs"
                }
              >
                {kpi.trend === "up" ? <ArrowUpRight className="size-3" /> : kpi.trend === "down" ? <ArrowDownRight className="size-3" /> : null}
                {kpi.delta}
              </div>
            </div>
          </div>
        ))}
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 rounded-xl border bg-card p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="font-semibold">Total Balance</h2>
              <p className="text-sm text-muted-foreground">Equity vs Balance (last 30 days)</p>
            </div>
            <div className="text-sm text-muted-foreground">Updated 2 mins ago</div>
          </div>
          {/* Simple area chart placeholder */}
          <div className="h-64 rounded-lg border bg-gradient-to-b from-neutral-50 to-white flex items-center justify-center">
            <svg viewBox="0 0 600 180" className="w-[95%] h-[85%]">
              <defs>
                <linearGradient id="g1" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="currentColor" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
                </linearGradient>
              </defs>
              <g className="text-blue-600">
                <path d="M0 120 C 100 80, 200 140, 300 100 C 400 60, 500 120, 600 90 L600 180 L0 180 Z" fill="url(#g1)" />
                <path d="M0 120 C 100 80, 200 140, 300 100 C 400 60, 500 120, 600 90" fill="none" stroke="currentColor" strokeWidth="3" />
              </g>
              <g className="text-orange-500">
                <path d="M0 100 C 100 120, 200 90, 300 110 C 400 130, 500 100, 600 115" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" />
              </g>
            </svg>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold">Most Traded</h2>
              <p className="text-sm text-muted-foreground">By volume</p>
            </div>
            <div className="text-sm text-muted-foreground">Total 16</div>
          </div>
          <div className="mt-6 grid grid-cols-[120px_1fr] gap-4 items-center">
            {/* Donut */}
            <div className="relative mx-auto">
              <div
                className="size-28 rounded-full"
                style={{
                  background: "conic-gradient(#2563eb 0 40%, #ef4444 40% 70%, #f59e0b 70% 85%, #10b981 85% 100%)",
                }}
              />
              <div className="absolute inset-0 m-auto size-16 rounded-full bg-background border" />
            </div>
            {/* Legend */}
            <ul className="space-y-2 text-sm">
              <LegendItem color="#2563eb" label="NZDUSD" value="40%" />
              <LegendItem color="#ef4444" label="GBPUSD" value="30%" />
              <LegendItem color="#f59e0b" label="XAUUSD" value="15%" />
              <LegendItem color="#10b981" label="AUDNZD" value="15%" />
            </ul>
          </div>
          {/* Magic UI: Tweet Card sample */}
          <div className="mt-6">
            <TweetCard id="1441032681968212480" />
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 rounded-xl border bg-card p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="font-semibold">Recent Accounts</div>
            <button className="rounded-md border px-3 py-1.5 text-sm">View all</button>
          </div>
          <div className="overflow-hidden rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-secondary text-secondary-foreground">
                <tr className="text-left">
                  <th className="px-3 py-2 font-medium">User</th>
                  <th className="px-3 py-2 font-medium">Type</th>
                  <th className="px-3 py-2 font-medium">Status</th>
                  <th className="px-3 py-2 font-medium">Balance</th>
                  <th className="px-3 py-2 font-medium">Gain</th>
                </tr>
              </thead>
              <tbody>
                {sampleRows.map((row) => (
                  <tr key={row.id} className="border-t">
                    <td className="px-3 py-2 flex items-center gap-2">
                      <Image src="/next.svg" alt="avatar" width={18} height={18} className="rounded-full" />
                      <span className="font-medium">{row.user}</span>
                    </td>
                    <td className="px-3 py-2">{row.type}</td>
                    <td className="px-3 py-2">
                      <span className={`rounded-full px-2 py-0.5 text-xs border ${row.status === "Active" ? "bg-green-50 text-green-700" : "bg-neutral-100 text-neutral-600"}`}>{row.status}</span>
                    </td>
                    <td className="px-3 py-2">{row.balance}</td>
                    <td className={`px-3 py-2 ${row.gain.startsWith("-") ? "text-red-600" : "text-green-700"}`}>{row.gain}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-5">
          <div className="font-semibold mb-3">Notifications</div>
          <AnimatedList>
            {notifications.map((n, idx) => (
              <div key={idx} className="flex items-start gap-3 rounded-lg border p-3">
                <span className="mt-1 size-2.5 rounded-full" style={{ backgroundColor: n.color }} />
                <div>
                  <div className="font-medium">{n.title}</div>
                  <div className="text-muted-foreground">{n.description}</div>
                </div>
                <span className="ml-auto text-xs text-muted-foreground">{n.time}</span>
              </div>
            ))}
          </AnimatedList>
        </div>
      </section>

      {/* Magic UI: Marquee + Dock */}
      <section className="grid grid-cols-1 gap-4">
        <div className="rounded-xl border bg-card p-0">
          <Marquee className="p-3 text-sm text-muted-foreground">
            <span>System status: All services operational</span>
            <span>Next maintenance window: Friday 02:00 UTC</span>
            <span>New feature: Risk controls dashboard</span>
            <span>Reminder: Enable 2FA for admin accounts</span>
          </Marquee>
        </div>
        <div className="flex justify-center">
          <Dock className="mt-2">
            <div className="grid place-items-center rounded-xl border bg-background size-10"><Home className="size-5" /></div>
            <div className="grid place-items-center rounded-xl border bg-background size-10"><User className="size-5" /></div>
            <div className="grid place-items-center rounded-xl border bg-background size-10"><Bell className="size-5" /></div>
            <div className="grid place-items-center rounded-xl border bg-background size-10"><Cog className="size-5" /></div>
          </Dock>
        </div>
      </section>
    </div>
  );
}

function LegendItem({ color, label, value }: { color: string; label: string; value: string }) {
  return (
    <li className="flex items-center gap-2">
      <span className="size-2.5 rounded-full" style={{ backgroundColor: color }} />
      <span className="text-foreground/80">{label}</span>
      <span className="ml-auto text-muted-foreground">{value}</span>
    </li>
  );
}

const sampleRows = [
  { id: 1, user: "Alex Morgan", type: "Funded", status: "Active", balance: "$12,908.99", gain: "+0.21%" },
  { id: 2, user: "Jamie Fox", type: "Trial", status: "Suspended", balance: "$1,205.00", gain: "-0.08%" },
  { id: 3, user: "Chris Lee", type: "Funded", status: "Active", balance: "$8,908.99", gain: "+0.41%" },
  { id: 4, user: "Taylor Kim", type: "Trial", status: "Active", balance: "$560.30", gain: "-0.11%" },
];

const notifications = [
  { title: "New payout request", description: "User Alex requested a payout.", time: "12m", color: "#2563eb" },
  { title: "Risk breach", description: "Order without stop-loss detected.", time: "2h", color: "#ef4444" },
  { title: "System", description: "Daily batch completed successfully.", time: "1d", color: "#10b981" },
];


