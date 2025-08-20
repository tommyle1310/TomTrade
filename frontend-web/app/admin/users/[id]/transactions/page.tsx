'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  ArrowLeft,
  Search,
  Filter,
  TrendingUp,
  TrendingDown,
  Calendar,
  DollarSign,
  RefreshCw,
} from 'lucide-react';
import { useQuery, gql } from '@apollo/client';
import Link from 'next/link';
import DateRangePicker from '@/components/DateRangePicker';

const GET_USER_TRANSACTIONS = gql`
  query GetUserTransactions($input: UserTransactionPaginationInput!) {
    adminUserTransactions(input: $input) {
      transactions {
        id
        ticker
        action
        shares
        price
        timestamp
        totalAmount
        user {
          id
          email
          name
          role
        }
      }
      meta {
        totalCount
        totalPages
        currentPage
        limit
        totalAmount
        totalBuyAmount
        totalSellAmount
        totalBuyCount
        totalSellCount
      }
    }
  }
`;

export default function UserTransactionsPage() {
  const params = useParams();
  const userId = params.id as string;

  // Local date objects for range picking, synced to filters
  const [startDateObj, setStartDateObj] = useState<Date>(() => {
    return new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  });
  const [endDateObj, setEndDateObj] = useState<Date>(() => {
    return new Date();
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    ticker: '',
    action: 'ALL',
    startDate: '',
    endDate: '',
  });
  const [limit, setLimit] = useState(20);

  const {
    data: transactionsData,
    loading: transactionsLoading,
    refetch,
  } = useQuery(GET_USER_TRANSACTIONS, {
    variables: {
      input: {
        userId,
        page: currentPage,
        limit,
        ticker: filters.ticker,
        startDate: startDateObj.toISOString(),
        endDate: endDateObj.toISOString(),
        action: filters.action === 'ALL' ? '' : filters.action,
      },
    },
  });

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const transactions =
    transactionsData?.adminUserTransactions?.transactions || [];
  const meta = transactionsData?.adminUserTransactions?.meta;
  const user = transactions[0]?.user;

  type Tx = {
    id: string;
    ticker: string;
    action: 'BUY' | 'SELL';
    shares: number;
    price: number;
    timestamp: string;
    totalAmount: number;
    user: { id: string; email: string; name?: string | null; role: string };
  };

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
            <h1 className="text-3xl font-bold">User Transactions</h1>
            <p className="text-muted-foreground">
              {user
                ? `${user.email} (${user.name || 'No name'})`
                : 'Loading user...'}
            </p>
          </div>
        </div>
        <Button onClick={() => refetch()}>
        <RefreshCw className="size-5" />
          Refresh
        </Button>
      </div>

      {/* User Stats */}
      {meta && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="gap-0 py-3">
            <CardHeader className="flex flex-row items-center px-3 justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Transactions
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="px-3">
              <div className="text-2xl font-bold">
                {meta.totalCount.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>

          <Card className="gap-0 py-3">
            <CardHeader className="flex flex-row items-center px-3 justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Volume
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="px-3">
              <div className="text-2xl font-bold">
                {(() => {
                  const n = meta.totalAmount;
                  if (n >= 1e12)
                    return (
                      '$' + (n / 1e12).toFixed(3).replace(/\.?0+$/, '') + 'T'
                    );
                  if (n >= 1e9)
                    return (
                      '$' + (n / 1e9).toFixed(3).replace(/\.?0+$/, '') + 'B'
                    );
                  if (n >= 1e6)
                    return (
                      '$' + (n / 1e6).toFixed(3).replace(/\.?0+$/, '') + 'M'
                    );
                  if (n >= 1e3)
                    return (
                      '$' + (n / 1e3).toFixed(3).replace(/\.?0+$/, '') + 'K'
                    );
                  return formatCurrency(n);
                })()}
              </div>
              <p className="text-xs text-muted-foreground">Trading volume</p>
            </CardContent>
          </Card>

          <Card className="gap-0 py-3">
            <CardHeader className="flex flex-row items-center px-3 justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Buy Transactions
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="px-3">
              <div className="text-2xl font-bold">{meta.totalBuyCount}</div>
              <p className="text-xs text-muted-foreground">
                {formatCurrency(meta.totalBuyAmount)}
              </p>
            </CardContent>
          </Card>

          <Card className="gap-0 py-3">
            <CardHeader className="flex flex-row items-center px-3 justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Sell Transactions
              </CardTitle>
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="px-3">
              <div className="text-2xl font-bold">{meta.totalSellCount}</div>
              <p className="text-xs text-muted-foreground">
                {formatCurrency(meta.totalSellAmount)}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
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
              <Input
                placeholder="AAPL, MSFT..."
                value={filters.ticker}
                onChange={(e) => handleFilterChange('ticker', e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Action</label>
              <Select
                value={filters.action}
                onValueChange={(value) => handleFilterChange('action', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All actions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All actions</SelectItem>
                  <SelectItem value="BUY">Buy</SelectItem>
                  <SelectItem value="SELL">Sell</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2 flex flex-col gap-2">
              <label className="text-sm font-medium">Date Range</label>
              <div>
                <DateRangePicker
                  date1={startDateObj}
                  setDate1={setStartDateObj}
                  date2={endDateObj}
                  setDate2={setEndDateObj}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card className="gap-0 py-3">
        <CardHeader className='px-3'>
          <CardTitle>Transactions</CardTitle>
          <CardDescription className='mb-2'>
            Showing {transactions.length} of {meta?.totalCount || 0}{' '}
            transactions
            {meta && (
              <span className="ml-4">
                Total: {formatCurrency(meta.totalAmount)} | Buys:{' '}
                {meta.totalBuyCount} ({formatCurrency(meta.totalBuyAmount)}) |
                Sells: {meta.totalSellCount} (
                {formatCurrency(meta.totalSellAmount)})
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="px-3">
          {transactionsLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-muted-foreground">
                Loading transactions...
              </div>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>Ticker</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Shares</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(transactions as Tx[]).map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-mono text-sm">
                        {formatDate(transaction.timestamp)}
                      </TableCell>
                      <TableCell className="font-mono font-bold">
                        {transaction.ticker}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            transaction.action === 'BUY'
                              ? 'default'
                              : 'secondary'
                          }
                        >
                          {transaction.action}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono">
                        {transaction.shares.toLocaleString()}
                      </TableCell>
                      <TableCell className="font-mono">
                        {formatCurrency(transaction.price)}
                      </TableCell>
                      <TableCell className="font-mono font-bold">
                        {formatCurrency(transaction.totalAmount)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {meta && meta.totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    Page {meta.currentPage} of {meta.totalPages}
                  </div>
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious size="sm"
                          onClick={() =>
                            handlePageChange(Math.max(1, meta.currentPage - 1))
                          }
                          className={
                            meta.currentPage <= 1
                              ? 'pointer-events-none opacity-50'
                              : 'cursor-pointer'
                          }
                        />
                      </PaginationItem>
                      {Array.from(
                        { length: Math.min(5, meta.totalPages) },
                        (_, i) => {
                          const page =
                            Math.max(
                              1,
                              Math.min(
                                meta.totalPages - 4,
                                meta.currentPage - 2
                              )
                            ) + i;
                          return (
                            <PaginationItem key={page}>
                              <PaginationLink size="sm"
                                onClick={() => handlePageChange(page)}
                                isActive={page === meta.currentPage}
                                className="cursor-pointer"
                              >
                                {page}
                              </PaginationLink>
                            </PaginationItem>
                          );
                        }
                      )}
                      <PaginationItem>
                        <PaginationNext size="sm"
                          onClick={() =>
                            handlePageChange(
                              Math.min(meta.totalPages, meta.currentPage + 1)
                            )
                          }
                          className={
                            meta.currentPage >= meta.totalPages
                              ? 'pointer-events-none opacity-50'
                              : 'cursor-pointer'
                          }
                        />
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
