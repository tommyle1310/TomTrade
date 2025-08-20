"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Plus, Filter, RefreshCw, CheckCircle2, XCircle } from "lucide-react";
import { Toggle } from "@/components/ui/toggle";
import { useMutation, useQuery, gql } from "@apollo/client";

const GET_ADMIN_STOCKS = gql`
  query AdminStocks($input: StockPaginationInput!) {
    adminStocks(input: $input) {
      stocks {
        ticker
        companyName
        exchange
        sector
        industry
        ipoDate
        country
        currency
        status
        isTradable
        suspendReason
      }
      meta { totalCount totalPages currentPage limit }
    }
  }
`;

const ADMIN_CREATE_STOCK = gql`
  mutation AdminCreateStock($input: CreateStockInput!) {
    adminCreateStock(input: $input) { ticker }
  }
`;

const ADMIN_UPDATE_STOCK = gql`
  mutation AdminUpdateStock($input: UpdateStockInput!) {
    adminUpdateStock(input: $input) { ticker isTradable suspendReason companyName exchange sector industry status }
  }
`;

export default function StocksAdminPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({ ticker: "", companyName: "", exchange: "", status: "", isTradable: "ALL" });
  const [limit] = useState(20);
  const [newStock, setNewStock] = useState({ ticker: "", companyName: "", exchange: "", sector: "", industry: "", country: "", currency: "", ipoDate: "", isTradable: true });

  const { data, loading, refetch } = useQuery(GET_ADMIN_STOCKS, {
    variables: {
      input: {
        page: currentPage,
        limit,
        ticker: filters.ticker,
        companyName: filters.companyName,
        exchange: filters.exchange,
        status: filters.status || undefined,
        isTradable: filters.isTradable === "ALL" ? null : filters.isTradable === "TRUE",
      },
    },
  });

  const [createStock] = useMutation(ADMIN_CREATE_STOCK, { onCompleted: () => refetch() });
  const [updateStock] = useMutation(ADMIN_UPDATE_STOCK, { onCompleted: () => refetch() });

  const meta = data?.adminStocks?.meta;
  const stocks = data?.adminStocks?.stocks || [];

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  return (
    <div className=" space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Stocks Management</h1>
          <p className="text-muted-foreground">Create, update, and manage stock metadata</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => refetch()}>
            <RefreshCw className="size-5" />
            Refresh
          </Button>
        </div>
      </div>

      <Card className="gap-0 py-3">
        <CardHeader className="px-3">
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <div>
              <label className="text-sm font-medium">Ticker</label>
              <Input placeholder="AAPL, MSFT..." value={filters.ticker} onChange={(e) => handleFilterChange("ticker", e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium">Company</label>
              <Input placeholder="Apple, Microsoft..." value={filters.companyName} onChange={(e) => handleFilterChange("companyName", e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium">Exchange</label>
              <Input placeholder="NASDAQ, NYSE..." value={filters.exchange} onChange={(e) => handleFilterChange("exchange", e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium">Status</label>
              <Input placeholder="active, delisted..." value={filters.status} onChange={(e) => handleFilterChange("status", e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium">Tradable</label>
              <Select value={filters.isTradable} onValueChange={(v) => handleFilterChange("isTradable", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All</SelectItem>
                  <SelectItem value="TRUE">Tradable</SelectItem>
                  <SelectItem value="FALSE">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="gap-0 py-3">
        <CardHeader className="px-3">
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Create Stock
          </CardTitle>
          <CardDescription>Quickly seed a stock if your table is empty</CardDescription>
        </CardHeader>
        <CardContent className="px-3 ">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Input placeholder="Ticker (e.g. AAPL)" value={newStock.ticker} onChange={(e) => setNewStock({ ...newStock, ticker: e.target.value.toUpperCase() })} />
            <Input placeholder="Company Name" value={newStock.companyName} onChange={(e) => setNewStock({ ...newStock, companyName: e.target.value })} />
            <Input placeholder="Exchange (e.g. NASDAQ)" value={newStock.exchange} onChange={(e) => setNewStock({ ...newStock, exchange: e.target.value })} />
            <Input placeholder="Sector" value={newStock.sector} onChange={(e) => setNewStock({ ...newStock, sector: e.target.value })} />
            <Input placeholder="Industry" value={newStock.industry} onChange={(e) => setNewStock({ ...newStock, industry: e.target.value })} />
            <Input placeholder="Country" value={newStock.country} onChange={(e) => setNewStock({ ...newStock, country: e.target.value })} />
            <Input placeholder="Currency" value={newStock.currency} onChange={(e) => setNewStock({ ...newStock, currency: e.target.value })} />
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Tradable</label>
              <Toggle
                pressed={newStock.isTradable}
                onPressedChange={(v) => setNewStock({ ...newStock, isTradable: !!v })}
                aria-label="Toggle tradable"
              >
                {newStock.isTradable ? 'Yes' : 'No'}
              </Toggle>
            </div>
            <Input placeholder="IPO Date (YYYY-MM-DD)" value={newStock.ipoDate} onChange={(e) => setNewStock({ ...newStock, ipoDate: e.target.value })} />
          </div>
          <div className="mt-3">
            <Button
              onClick={() =>
                createStock({ variables: { input: { ticker: newStock.ticker, companyName: newStock.companyName, exchange: newStock.exchange, sector: newStock.sector || undefined, industry: newStock.industry || undefined, country: newStock.country || undefined, currency: newStock.currency || undefined, ipoDate: newStock.ipoDate || undefined, isTradable: newStock.isTradable } } })
                  .then(() => setNewStock({ ticker: "", companyName: "", exchange: "", sector: "", industry: "", country: "", currency: "", ipoDate: "", isTradable: true }))
              }
              disabled={!newStock.ticker || !newStock.companyName || !newStock.exchange}
            >
              Create
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="gap-0 ">
        <CardHeader className="px-3">
          <CardTitle>Stocks</CardTitle>
          <CardDescription className="mb-2">Showing {stocks.length} of {meta?.totalCount || 0} stocks</CardDescription>
        </CardHeader>
        <CardContent className="px-3 overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center h-32"><div className="text-muted-foreground">Loading...</div></div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ticker</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Exchange</TableHead>
                    <TableHead>Country</TableHead>
                    <TableHead>Sector</TableHead>
                    <TableHead>Industry</TableHead>
                    <TableHead>Tradable</TableHead>
                    <TableHead>Suspend Reason</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(stocks as Array<{ ticker: string; companyName: string; exchange: string; sector?: string | null; industry?: string | null; country?: string | null; currency?: string | null; status?: string | null; isTradable: boolean; suspendReason?: string | null; ipoDate?: string | null; }>).map((s) => (
                    <TableRow key={s.ticker}>
                      <TableCell className="font-mono font-bold">{s.ticker}</TableCell>
                      <TableCell>{s.companyName}</TableCell>
                      <TableCell>{s.exchange}</TableCell>
                      <TableCell>{s.country || '-'}</TableCell>
                      <TableCell>{s.sector || '-'}</TableCell>
                      <TableCell>{s.industry || '-'}</TableCell>
                      <TableCell>
                        {s.isTradable ? (
                          <span className="inline-flex items-center gap-1 text-green-600"><CheckCircle2 className="w-4 h-4" /> Tradable</span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-red-600"><XCircle className="w-4 h-4" /> Suspended</span>
                        )}
                      </TableCell>
                      <TableCell className="max-w-[240px] truncate">{s.suspendReason || '-'}</TableCell>
                      <TableCell>
                        {s.isTradable ? (
                          <Button size="sm" variant="destructive" onClick={() => updateStock({ variables: { input: { ticker: s.ticker, isTradable: false, suspendReason: 'Admin suspension' } } })}>Suspend</Button>
                        ) : (
                          <Button size="sm" onClick={() => updateStock({ variables: { input: { ticker: s.ticker, isTradable: true, suspendReason: null } } })}>Unsuspend</Button>
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
                        <PaginationPrevious size="sm" onClick={() => setCurrentPage(Math.max(1, meta.currentPage - 1))} className={meta.currentPage <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'} />
                      </PaginationItem>
                      {Array.from({ length: Math.min(5, meta.totalPages) }, (_, i) => {
                        const page = Math.max(1, Math.min(meta.totalPages - 4, meta.currentPage - 2)) + i;
                        return (
                          <PaginationItem key={page}>
                            <PaginationLink size="sm" onClick={() => setCurrentPage(page)} isActive={page === meta.currentPage} className="cursor-pointer">{page}</PaginationLink>
                          </PaginationItem>
                        );
                      })}
                      <PaginationItem>
                        <PaginationNext size="sm" onClick={() => setCurrentPage(Math.min(meta.totalPages, meta.currentPage + 1))} className={meta.currentPage >= meta.totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'} />
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


