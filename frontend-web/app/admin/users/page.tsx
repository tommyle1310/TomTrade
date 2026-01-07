'use client';

import { useMemo, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTranslation } from '@/lib/translations';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import {
  ArrowUpDown,
  Ban,
  Check,
  Crown,
  Search,
  Shield,
  UserMinus,
  RefreshCw,
  AlertTriangle,
  FileText,
  Ellipsis,
} from 'lucide-react';
import { useAuthStore } from '@/lib/authStore';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ForbiddenPage } from '@/components/ui/forbidden-page';
import { adminApi, AdminUser } from '@/lib/adminQueries';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export default function AdminUsersPage() {
  const { t } = useTranslation();
  const { isAuthenticated, isAdmin, loading, initialized, user, token } =
    useAuthStore();
  const [query, setQuery] = useState('');
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
    const data = users.filter(
      (u) =>
        u.name?.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    );
    return data.sort((a, b) =>
      sortAsc
        ? (a.name || a.email).localeCompare(b.name || b.email)
        : (b.name || b.email).localeCompare(a.name || b.email)
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

  const handleAction = async (
    action: () => Promise<AdminUser>,
    userId: string
  ) => {
    try {
      setActionLoading(userId);
      const updatedUser = await action();
      setUsers((prev) => prev.map((u) => (u.id === userId ? updatedUser : u)));
    } catch (err: any) {
      console.error('Action failed:', err);
      setError(err.message || 'Action failed');
    } finally {
      setActionLoading(null);
    }
  };

  const toggleBan = async (userId: string) => {
    const user = users.find((u) => u.id === userId);
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
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('nav.manageUsers')}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Search, sort, and manage roles and bans.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`${t('common.search')}...`}
              className="pl-9 glass-subtle border-glass-border shadow-sm"
            />
          </div>
          <Button variant="outline" onClick={() => setSortAsc((s) => !s)} className="shadow-sm hover:shadow-md transition-shadow">
            <ArrowUpDown className="size-4 mr-2" /> Sort
          </Button>
          <Button
            variant="outline"
            onClick={fetchUsers}
            disabled={loadingUsers}
            className="shadow-sm hover:shadow-md transition-shadow"
          >
            <RefreshCw
              className={`size-4 mr-2 ${loadingUsers ? 'animate-spin' : ''}`}
            />
            Refresh
          </Button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl glass-strong border border-destructive/30 shadow-elevated">
          <AlertTriangle className="size-5 text-destructive" />
          <span className="text-destructive font-medium">{error}</span>
        </div>
      )}

      {loadingUsers ? (
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <div className="glass-strong border border-glass-border rounded-xl shadow-elevated overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-glass-border hover:bg-transparent">
                <TableHead className="font-semibold">{t('admin.users')}</TableHead>
                <TableHead className="font-semibold">{t('auth.email')}</TableHead>
                <TableHead className="font-semibold">{t('user.role')}</TableHead>
                <TableHead className="font-semibold">{t('history.status')}</TableHead>
                <TableHead className="font-semibold">Balance</TableHead>
                <TableHead className="font-semibold">Created</TableHead>
                <TableHead className="text-right font-semibold">{t('common.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((user) => (
                <TableRow key={user.id} className="border-glass-border hover:bg-primary/5 transition-colors cursor-pointer">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="size-9 border-2 border-primary/20">
                        <AvatarImage src={user.avatar || undefined} />
                        <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20 font-semibold">
                          {user.name?.charAt(0).toUpperCase() ||
                            user.email.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-semibold">
                          {user.name || 'No name'}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          ID: {user.id.substring(0, 8)}...
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{user.email}</TableCell>
                  <TableCell>
                    <Badge
                      variant={user.role === 'ADMIN' ? 'default' : 'secondary'}
                    >
                      {user.role === 'ADMIN' && <Crown className="size-3 mr-1" />}
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.isBanned ? 'destructive' : 'success'}>
                      {user.isBanned ? <Ban className="size-3 mr-1" /> : <Check className="size-3 mr-1" />}
                      {user.isBanned ? 'Banned' : 'Active'}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-semibold">{formatCurrency(user.balance)}</TableCell>
                  <TableCell>{formatDate(user.createdAt)}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" size="sm" className="shadow-sm hover:shadow-md transition-shadow">
                          <Ellipsis className="size-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80 flex-col flex glass-strong border-glass-border shadow-elevated-lg">
                        <Link href={`/admin/users/${user.id}/transactions`} className='w-full'>
                          <Button variant="outline" size="sm" className='w-full'>
                            <FileText className="size-4 mr-1" />
                            Transactions
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleBan(user.id)}
                          disabled={
                            actionLoading === user.id || user.role === 'ADMIN'
                          }
                        >
                          {actionLoading === user.id ? (
                            <RefreshCw className="size-4 mr-1 animate-spin" />
                          ) : user.isBanned ? (
                            <Check className="size-4 mr-1" />
                          ) : (
                            <Ban className="size-4 mr-1" />
                          )}
                          {user.isBanned ? 'Unban' : 'Ban'}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => promote(user.id)}
                          disabled={
                            actionLoading === user.id || user.role === 'ADMIN'
                          }
                        >
                          <Crown className="size-4 mr-1" /> Promote
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => demote(user.id)}
                          disabled={
                            actionLoading === user.id || user.role === 'USER'
                          }
                        >
                          <UserMinus className="size-4 mr-1" /> Demote
                        </Button>
                      </PopoverContent>
                    </Popover>

                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {!loadingUsers && filtered.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          {t('table.noResults')}
        </div>
      )}
    </div>
  );
}
