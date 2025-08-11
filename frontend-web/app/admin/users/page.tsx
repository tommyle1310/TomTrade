"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { ArrowUpDown, Ban, Check, Crown, Search, Shield, UserMinus } from "lucide-react";

type Role = "user" | "moderator" | "admin";
type Status = "active" | "banned";

type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: Status;
  balance: string;
};

const INITIAL_USERS: AdminUser[] = [
  { id: "1", name: "Alex Morgan", email: "alex@example.com", role: "admin", status: "active", balance: "$12,908.99" },
  { id: "2", name: "Jamie Fox", email: "jamie@example.com", role: "user", status: "banned", balance: "$1,205.00" },
  { id: "3", name: "Chris Lee", email: "chris@example.com", role: "moderator", status: "active", balance: "$8,908.99" },
  { id: "4", name: "Taylor Kim", email: "taylor@example.com", role: "user", status: "active", balance: "$560.30" },
];

export default function AdminUsersPage() {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<AdminUser[]>(INITIAL_USERS);
  const [sortAsc, setSortAsc] = useState(true);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    const data = users.filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
    return data.sort((a, b) => (sortAsc ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)));
  }, [query, users, sortAsc]);

  function toggleBan(id: string) {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, status: u.status === "banned" ? "active" : "banned" } : u)));
  }

  function promote(id: string) {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === id
          ? { ...u, role: u.role === "user" ? "moderator" : u.role === "moderator" ? "admin" : "admin" }
          : u,
      ),
    );
  }

  function demote(id: string) {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, role: u.role === "admin" ? "moderator" : "user" } : u)),
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Manage Users</h1>
          <p className="text-muted-foreground">Search, sort, and manage roles and bans.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative w-64">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search users..." className="pl-8" />
          </div>
          <Button variant="outline" onClick={() => setSortAsc((s) => !s)}>
            <ArrowUpDown className="size-4 mr-2" /> Sort
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Balance</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((u) => (
              <TableRow key={u.id}>
                <TableCell className="font-medium">{u.name}</TableCell>
                <TableCell>{u.email}</TableCell>
                <TableCell>
                  <Badge variant={u.role === "admin" ? "default" : u.role === "moderator" ? "secondary" : "outline"}>
                    {u.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={u.status === "active" ? "success" : "destructive"}>{u.status}</Badge>
                </TableCell>
                <TableCell>{u.balance}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="outline" size="sm" onClick={() => toggleBan(u.id)}>
                    {u.status === "banned" ? <Check className="size-4 mr-1" /> : <Ban className="size-4 mr-1" />} {u.status === "banned" ? "Unban" : "Ban"}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => promote(u.id)}>
                    <Crown className="size-4 mr-1" /> Promote
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => demote(u.id)}>
                    <UserMinus className="size-4 mr-1" /> Demote
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}


