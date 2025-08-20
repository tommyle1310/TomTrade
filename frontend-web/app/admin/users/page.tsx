"use client";

import { useMemo, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { ArrowUpDown, Ban, Check, Crown, Search, Shield, UserMinus, RefreshCw, AlertTriangle, FileText } from "lucide-react";
import { useAuthStore } from "@/lib/authStore";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ForbiddenPage } from "@/components/ui/forbidden-page";
import { adminApi, AdminUser } from "@/lib/adminQueries";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";

export default function AdminUsersPage() {
  const { isAuthenticated, isAdmin, loading, initialized, user, token } = useAuthStore();
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortAsc, setSortAsc] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Fetch users on component mount
  useEffect(() => {
    if (isAuthenticated && token) {
      fetchUsers();
    }
  }, [isAuthenticated, token]);

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      setError(null);
      const fetchedUsers = await adminApi.getAllUsers(token!);
      setUsers(fetchedUsers);
    } catch (err: any) {
      console.error('Error fetching users:', err);
      setError(err.message || 'Failed to fetch users');
    } finally {
      setLoadingUsers(false);
    }
  };

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    const data = users.filter((u) => 
      (u.name?.toLowerCase().includes(q) || u.email.toLowerCase().includes(q))
    );
    return data.sort((a, b) => 
      sortAsc ? 
        (a.name || a.email).localeCompare(b.name || b.email) : 
        (b.name || b.email).localeCompare(a.name || b.email)
    );
  }, [query, users, sortAsc]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleAction = async (action: () => Promise<AdminUser>, userId: string) => {
    try {
      setActionLoading(userId);
      const updatedUser = await action();
      setUsers(prev => prev.map(u => u.id === userId ? updatedUser : u));
    } catch (err: any) {
      console.error('Action failed:', err);
      setError(err.message || 'Action failed');
    } finally {
      setActionLoading(null);
    }
  };

  const toggleBan = async (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user || !token) return;

    if (user.isBanned) {
      await handleAction(() => adminApi.unbanUser(userId, token), userId);
    } else {
      await handleAction(() => adminApi.banUser(userId, token), userId);
    }
  };

  const promote = async (userId: string) => {
    if (!token) return;
    await handleAction(() => adminApi.promoteToAdmin(userId, token), userId);
  };

  const demote = async (userId: string) => {
    if (!token) return;
    await handleAction(() => adminApi.demoteFromAdmin(userId, token), userId);
  };

  // Show loading spinner while initializing auth state
  if (!initialized || loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Check if user is authenticated and has ADMIN role
  if (!isAuthenticated || !user || user.role !== 'ADMIN') {
    return (
      <ForbiddenPage 
        title="Admin Access Required" 
        message="You need admin privileges to access this page. Please contact your administrator if you believe this is an error."
      />
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
            <Input 
              value={query} 
              onChange={(e) => setQuery(e.target.value)} 
              placeholder="Search users..." 
              className="pl-8" 
            />
          </div>
          <Button variant="outline" onClick={() => setSortAsc((s) => !s)}>
            <ArrowUpDown className="size-4 mr-2" /> Sort
          </Button>
          <Button variant="outline" onClick={fetchUsers} disabled={loadingUsers}>
            <RefreshCw className={`size-4 mr-2 ${loadingUsers ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200">
          <AlertTriangle className="size-4 text-red-500" />
          <span className="text-red-700">{error}</span>
        </div>
      )}

      {loadingUsers ? (
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Balance</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="size-8">
                        <AvatarImage src={user.avatar || undefined} />
                        <AvatarFallback>
                          {user.name?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{user.name || 'No name'}</div>
                        <div className="text-xs text-muted-foreground">ID: {user.id.substring(0, 8)}...</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={user.role === "ADMIN" ? "default" : "secondary"}>
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.isBanned ? "destructive" : "default"}>
                      {user.isBanned ? "Banned" : "Active"}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatCurrency(user.balance)}</TableCell>
                  <TableCell>{formatDate(user.createdAt)}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Link href={`/admin/users/${user.id}/transactions`}>
                      <Button variant="outline" size="sm">
                        <FileText className="size-4 mr-1" />
                        Transactions
                      </Button>
                    </Link>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => toggleBan(user.id)}
                      disabled={actionLoading === user.id || user.role === 'ADMIN'}
                    >
                      {actionLoading === user.id ? (
                        <RefreshCw className="size-4 mr-1 animate-spin" />
                      ) : user.isBanned ? (
                        <Check className="size-4 mr-1" />
                      ) : (
                        <Ban className="size-4 mr-1" />
                      )}
                      {user.isBanned ? "Unban" : "Ban"}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => promote(user.id)}
                      disabled={actionLoading === user.id || user.role === 'ADMIN'}
                    >
                      <Crown className="size-4 mr-1" /> Promote
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => demote(user.id)}
                      disabled={actionLoading === user.id || user.role === 'USER'}
                    >
                      <UserMinus className="size-4 mr-1" /> Demote
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {!loadingUsers && filtered.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          {query ? 'No users found matching your search.' : 'No users found.'}
        </div>
      )}
    </div>
  );
}
