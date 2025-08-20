"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { ChevronLeft, ChevronRight, Search, Filter, TrendingUp, TrendingDown, Users, DollarSign } from "lucide-react";
import { useQuery, gql } from "@apollo/client";

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
  const [limit, setLimit] = useState(20);

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

  const stats = statsData?.transactionStats;
  const transactions = transactionsData?.adminTransactions?.transactions || [];
  const meta = transactionsData?.adminTransactions?.meta;

  return (
    <div className="p-6 space-y-6">
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
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTransactions.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Volume</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.totalVolume)}</div>
              <p className="text-xs text-muted-foreground">Trading volume</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.uniqueUsers}</div>
              <p className="text-xs text-muted-foreground">Unique traders</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Price</CardTitle>
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.averagePrice)}</div>
              <p className="text-xs text-muted-foreground">Per transaction</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
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
            <div>
              <label className="text-sm font-medium">Start Date</label>
              <Input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange("startDate", e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium">End Date</label>
              <Input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange("endDate", e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Transactions</CardTitle>
          <CardDescription>
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
        <CardContent>
          {transactionsLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-muted-foreground">Loading transactions...</div>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Ticker</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Shares</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction: any) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-mono text-sm">
                        {formatDate(transaction.timestamp)}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{transaction.user.email}</div>
                          <div className="text-sm text-muted-foreground">
                            {transaction.user.name || "No name"} ({transaction.user.role})
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono font-bold">
                        {transaction.ticker}
                      </TableCell>
                      <TableCell>
                        <Badge variant={transaction.action === "BUY" ? "default" : "secondary"}>
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
                        <PaginationPrevious
                          onClick={() => handlePageChange(Math.max(1, meta.currentPage - 1))}
                          className={meta.currentPage <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                      {Array.from({ length: Math.min(5, meta.totalPages) }, (_, i) => {
                        const page = Math.max(1, Math.min(meta.totalPages - 4, meta.currentPage - 2)) + i;
                        return (
                          <PaginationItem key={page}>
                            <PaginationLink
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
                        <PaginationNext
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
