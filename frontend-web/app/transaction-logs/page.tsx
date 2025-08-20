"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Search, Filter, TrendingUp, TrendingDown, Users, DollarSign } from "lucide-react";
import { useQuery, gql } from "@apollo/client";
import DateRangePicker from "@/components/DateRangePicker";
import IdCell from "@/components/IdCell";
import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";

const GET_TRANSACTION_STATS = gql`
  query GetTransactionStats {
    transactionStats {
      totalTransactions
      totalVolume
      totalBuyVolume
      totalSellVolume
      uniqueUsers
      uniqueStocks
      averagePrice
    }
  }
`;

const GET_ADMIN_TRANSACTIONS = gql`
  query GetAdminTransactions($input: TransactionPaginationInput!) {
    adminTransactions(input: $input) {
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

export default function TransactionLogsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    ticker: "",
    action: "ALL",
    userId: "",
    startDate: "",
    endDate: "",
  });
  const [limit] = useState(20);

  // Local date objects for range picking, synced to filters
  const [startDateObj, setStartDateObj] = useState<Date>(() => {
    return filters.startDate ? new Date(filters.startDate) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  });
  const [endDateObj, setEndDateObj] = useState<Date>(() => {
    return filters.endDate ? new Date(filters.endDate) : new Date();
  });

  const { data: statsData, loading: statsLoading } = useQuery(GET_TRANSACTION_STATS);
  const { data: transactionsData, loading: transactionsLoading, refetch } = useQuery(GET_ADMIN_TRANSACTIONS, {
    variables: {
      input: {
        page: currentPage,
        limit,
        ...filters,
        action: filters.action === "ALL" ? "" : filters.action,
      },
    },
  });

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
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

  const formatYmd = (date: Date | null) => {
    if (!date) return "";
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Keep filters.startDate/endDate in sync with date picker states
  useEffect(() => {
    const s = formatYmd(startDateObj);
    const e = formatYmd(endDateObj);
    setFilters(prev => {
      if (prev.startDate === s && prev.endDate === e) return prev;
      setCurrentPage(1);
      return { ...prev, startDate: s, endDate: e };
    });
  }, [startDateObj, endDateObj]);

  const stats = statsData?.transactionStats;
  const transactions = transactionsData?.adminTransactions?.transactions || [];
  const meta = transactionsData?.adminTransactions?.meta;

  type Tx = {
    id: string;
    ticker: string;
    action: string;
    shares: number;
    price: number;
    timestamp: string;
    totalAmount: number;
    user: { id: string; email: string; name?: string | null; role: string };
  };

  const columns: ColumnDef<Tx>[] = [
    {
      accessorKey: "timestamp",
      header: "Time",
      cell: ({ getValue }) => (
        <span className="font-mono text-sm">{formatDate(getValue() as string)}</span>
      ),
    },
    {
      id: "user",
      header: "User",
      cell: ({ row }) => {
        const u = (row.original as Tx).user;
        return (
          <HoverCard>
            <HoverCardTrigger asChild>
              <div className="cursor-help">
                <div className="font-medium truncate max-w-[220px]">{u.email}</div>
                <div className="text-sm text-muted-foreground truncate max-w-[220px]">{u.name || "No name"}</div>
              </div>
            </HoverCardTrigger>
            <HoverCardContent>
              <div className="space-y-1">
                <div className="font-medium break-all">{u.email}</div>
                <div className="text-sm text-muted-foreground">{u.name || "No name"} ({u.role})</div>
                <div className="pt-1">
                  <IdCell id={u.id} />
                </div>
              </div>
            </HoverCardContent>
          </HoverCard>
        );
      },
    },
    {
      accessorKey: "ticker",
      header: "Ticker",
      cell: ({ getValue }) => (
        <span className="font-mono font-bold">{getValue() as string}</span>
      ),
    },
    {
      accessorKey: "action",
      header: "Action",
      cell: ({ getValue }) => {
        const val = getValue() as string;
        return (
          <Badge variant={val === "BUY" ? "default" : "secondary"}>{val}</Badge>
        );
      },
    },
    {
      accessorKey: "shares",
      header: "Shares",
      cell: ({ getValue }) => (
        <span className="font-mono">{(getValue() as number).toLocaleString()}</span>
      ),
    },
    {
      accessorKey: "price",
      header: "Price",
      cell: ({ getValue }) => (
        <span className="font-mono">{formatCurrency(getValue() as number)}</span>
      ),
    },
    {
      accessorKey: "totalAmount",
      header: "Total",
      cell: ({ getValue }) => (
        <span className="font-mono font-bold">{formatCurrency(getValue() as number)}</span>
      ),
    },
  ];

  const table = useReactTable<Tx>({
    data: (transactions as Tx[]),
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className=" space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Transaction Logs</h1>
          <p className="text-muted-foreground">Monitor all trading activity across the platform</p>
        </div>
        <Button onClick={() => refetch()}>
          <Search className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      {!statsLoading && stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="gap-0 py-3 ">
            <CardHeader className="flex flex-row items-center px-3 py-0 justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="px-3">
              <div className="text-2xl font-bold">{stats.totalTransactions.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>

          <Card className="gap-0 py-3">
            <CardHeader className="flex flex-row items-center px-3 py-0 justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Volume</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="px-3">
              <div className="text-2xl font-bold flex-wrap bg-blue-300">
                {(() => {
                  const n = stats.totalVolume;
                  if (n >= 1e12) return '$' + (n / 1e12).toFixed(3).replace(/\.?0+$/, '') + 'T';
                  if (n >= 1e9) return '$' + (n / 1e9).toFixed(3).replace(/\.?0+$/, '') + 'B';
                  if (n >= 1e6) return '$' + (n / 1e6).toFixed(3).replace(/\.?0+$/, '') + 'M';
                  if (n >= 1e3) return '$' + (n / 1e3).toFixed(3).replace(/\.?0+$/, '') + 'K';
                  return formatCurrency(n);
                })()}
              </div>
              <p className="text-xs text-muted-foreground">Trading volume</p>
            </CardContent>
          </Card>

          <Card className="gap-0 py-3">
            <CardHeader className="flex flex-row items-center px-3 py-0 justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="px-3">
              <div className="text-2xl font-bold">{stats.uniqueUsers}</div>
              <p className="text-xs text-muted-foreground">Unique traders</p>
            </CardContent>
          </Card>

          <Card className="gap-0 py-3">
            <CardHeader className="flex flex-row items-center px-3 py-0 justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Price</CardTitle>
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="px-3">
              <div className="text-2xl font-bold">{formatCurrency(stats.averagePrice)}</div>
              <p className="text-xs text-muted-foreground">Per transaction</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card className="gap-0 py-3">
        <CardHeader className="px-3">
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="text-sm font-medium">Ticker</label>
              <Input
                placeholder="AAPL, MSFT..."
                value={filters.ticker}
                onChange={(e) => handleFilterChange("ticker", e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Action</label>
              <Select value={filters.action} onValueChange={(value) => handleFilterChange("action", value)}>
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
            <div>
              <label className="text-sm font-medium">User ID</label>
              <Input
                placeholder="User ID..."
                value={filters.userId}
                onChange={(e) => handleFilterChange("userId", e.target.value)}
              />
            </div>
            <div className="lg:col-span-2">
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
      <Card className="gap-0 ">
        <CardHeader className="px-3">
          <CardTitle>Transactions</CardTitle>
          <CardDescription className="mb-2">
            Showing {transactions.length} of {meta?.totalCount || 0} transactions
            {meta && (
              <span className="ml-4">
                Total: {formatCurrency(meta.totalAmount)} | 
                Buys: {meta.totalBuyCount} ({formatCurrency(meta.totalBuyAmount)}) | 
                Sells: {meta.totalSellCount} ({formatCurrency(meta.totalSellAmount)})
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="px-3">
          {transactionsLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-muted-foreground">Loading transactions...</div>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <TableHead key={header.id}>
                          {header.isPlaceholder ? null : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
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
                          onClick={() => handlePageChange(Math.max(1, meta.currentPage - 1))}
                          className={meta.currentPage <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                      {Array.from({ length: Math.min(5, meta.totalPages) }, (_, i) => {
                        const page = Math.max(1, Math.min(meta.totalPages - 4, meta.currentPage - 2)) + i;
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
                      })}
                      <PaginationItem>
                        <PaginationNext size="sm"
                          onClick={() => handlePageChange(Math.min(meta.totalPages, meta.currentPage + 1))}
                          className={meta.currentPage >= meta.totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
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
