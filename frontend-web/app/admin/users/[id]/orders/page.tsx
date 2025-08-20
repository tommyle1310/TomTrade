'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { ArrowLeft, Filter, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { useQuery, useMutation, gql } from '@apollo/client';
import DateRangePicker from '@/components/DateRangePicker';
import IdCell from '@/components/IdCell';

const GET_ADMIN_USER_ORDERS = gql`
  query GetAdminUserOrders($input: UserOrderPaginationInput!) {
    adminUserOrders(input: $input) {
      orders {
        id
        ticker
        side
        type
        quantity
        price
        status
        createdAt
        user { id email name role }
      }
      meta { totalCount totalPages currentPage limit }
    }
  }
`;

const ADMIN_FORCE_CANCEL = gql`
  mutation AdminForceCancelOrder($orderId: String!) {
    adminForceCancelOrder(orderId: $orderId) { id status }
  }
`;

export default function UserOrdersPage() {
  const params = useParams();
  const userId = params.id as string;

  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({ ticker: '', side: 'ALL', status: 'ALL', startDate: '', endDate: '' });
  const [startDateObj, setStartDateObj] = useState<Date>(() => new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
  const [endDateObj, setEndDateObj] = useState<Date>(() => new Date());

  const formatYmd = (date: Date | null) => {
    if (!date) return '';
    const d = new Date(date);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const da = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${da}`;
  };

  const [forceCancel] = useMutation(ADMIN_FORCE_CANCEL);

  const { data, loading, refetch } = useQuery(GET_ADMIN_USER_ORDERS, {
    variables: {
      input: {
        userId,
        page: currentPage,
        limit: 20,
        ticker: filters.ticker,
        side: filters.side === 'ALL' ? '' : filters.side,
        status: filters.status === 'ALL' ? '' : filters.status,
        startDate: formatYmd(startDateObj),
        endDate: formatYmd(endDateObj),
      },
    },
  });

  const orders = data?.adminUserOrders?.orders || [];
  const meta = data?.adminUserOrders?.meta;
  const user = orders[0]?.user;

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => setCurrentPage(page);

  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  const formatDate = (dateString: string) => new Date(dateString).toLocaleString();

  return (
    <div className=" space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/users">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Users
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">User Orders</h1>
            <p className="text-muted-foreground">{user ? `${user.email} (${user.name || 'No name'})` : 'Loading user...'}</p>
          </div>
        </div>
        <Button onClick={() => refetch()}>
          <RefreshCw className="size-5" />
          Refresh
        </Button>
      </div>

      <Card className="gap-0 py-3">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium">Ticker</label>
              <Input placeholder="AAPL, MSFT..." value={filters.ticker} onChange={(e) => handleFilterChange('ticker', e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium">Side</label>
              <Select value={filters.side} onValueChange={(v) => handleFilterChange('side', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="All sides" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All</SelectItem>
                  <SelectItem value="BUY">Buy</SelectItem>
                  <SelectItem value="SELL">Sell</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Status</label>
              <Select value={filters.status} onValueChange={(v) => handleFilterChange('status', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All</SelectItem>
                  <SelectItem value="OPEN">Open</SelectItem>
                  <SelectItem value="PARTIAL">Partial</SelectItem>
                  <SelectItem value="FILLED">Filled</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2 flex flex-col gap-2">
              <label className="text-sm font-medium">Date Range</label>
              <DateRangePicker date1={startDateObj} setDate1={setStartDateObj} date2={endDateObj} setDate2={setEndDateObj} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="gap-0 py-3">
        <CardHeader className='px-3'>
          <CardTitle>Orders</CardTitle>
          <CardDescription className='mb-2'>
            Showing {orders.length} of {meta?.totalCount || 0} orders
          </CardDescription>
        </CardHeader>
        <CardContent className="px-3">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-muted-foreground">Loading orders...</div>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>Ticker</TableHead>
                    <TableHead>Side</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((o: any) => (
                    <TableRow key={o.id}>
                      <TableCell className="font-mono text-sm">{formatDate(o.createdAt)}</TableCell>
                      <TableCell className="font-mono font-bold">{o.ticker}</TableCell>
                      <TableCell>
                        <Badge variant={o.side === 'BUY' ? 'default' : 'secondary'}>{o.side}</Badge>
                      </TableCell>
                      <TableCell className="font-mono">{o.type}</TableCell>
                      <TableCell className="font-mono">{Number(o.quantity).toLocaleString()}</TableCell>
                      <TableCell className="font-mono">{formatCurrency(o.price)}</TableCell>
                      <TableCell>{o.status}</TableCell>
                      <TableCell>
                        {(o.status === 'OPEN' || o.status === 'PARTIAL') && (
                          <Button size="sm" variant="destructive" onClick={() => forceCancel({ variables: { orderId: o.id } }).then(() => refetch())}>Cancel</Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {meta && meta.totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">Page {meta.currentPage} of {meta.totalPages}</div>
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious size="sm" onClick={() => handlePageChange(Math.max(1, meta.currentPage - 1))} className={meta.currentPage <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'} />
                      </PaginationItem>
                      {Array.from({ length: Math.min(5, meta.totalPages) }, (_, i) => {
                        const page = Math.max(1, Math.min(meta.totalPages - 4, meta.currentPage - 2)) + i;
                        return (
                          <PaginationItem key={page}>
                            <PaginationLink size="sm" onClick={() => handlePageChange(page)} isActive={page === meta.currentPage} className="cursor-pointer">{page}</PaginationLink>
                          </PaginationItem>
                        );
                      })}
                      <PaginationItem>
                        <PaginationNext size="sm" onClick={() => handlePageChange(Math.min(meta.totalPages, meta.currentPage + 1))} className={meta.currentPage >= meta.totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'} />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


