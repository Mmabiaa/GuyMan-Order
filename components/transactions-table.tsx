"use client"

import { useState, useMemo } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Search, Calendar, Filter, ArrowUpDown } from "lucide-react"
import type { Order } from "@/lib/store"
import { cn } from "@/lib/utils"

interface TransactionsTableProps {
  transactions: Order[]
  onUpdatePaymentStatus: (id: string, status: string) => void
}

type FilterStatus = "ALL" | "PAID" | "UNPAID" | "PENDING"
type SortOrder = "recent" | "oldest"

export function TransactionsTable({ transactions, onUpdatePaymentStatus }: TransactionsTableProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState<"daily" | "history">("daily")
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("ALL")
  const [sortOrder, setSortOrder] = useState<SortOrder>("recent")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  const today = new Date().toDateString()
  const twentyFourHoursAgo = Date.now() - 24 * 60 * 60 * 1000

  // Filter and sort transactions
  const filteredTransactions = useMemo(() => {
    let filtered = [...transactions]

    // Tab filtering (Daily vs History)
    if (activeTab === "daily") {
      filtered = filtered.filter(t => new Date(t.createdAt).toDateString() === today)
    } else {
      // History: Join total only after 24 hours
      filtered = filtered.filter(t => new Date(t.createdAt).getTime() < twentyFourHoursAgo)
    }

    // Status filtering
    if (statusFilter !== "ALL") {
      filtered = filtered.filter(t => t.paymentStatus === statusFilter)
    }

    // Date range filtering - Only for History
    if (activeTab === "history") {
      if (startDate) {
        filtered = filtered.filter(t => new Date(t.createdAt) >= new Date(startDate))
      }
      if (endDate) {
        const end = new Date(endDate)
        end.setHours(23, 59, 59, 999)
        filtered = filtered.filter(t => new Date(t.createdAt) <= end)
      }
    }

    // Search query filtering
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (t) =>
          t.customerName.toLowerCase().includes(query) ||
          t.phoneNumber.toLowerCase().includes(query) ||
          (t.foodItem && t.foodItem.toLowerCase().includes(query))
      )
    }

    // Sorting
    return filtered.sort((a, b) => {
      const timeA = new Date(a.createdAt).getTime()
      const timeB = new Date(b.createdAt).getTime()
      return sortOrder === "recent" ? timeB - timeA : timeA - timeB
    })
  }, [transactions, searchQuery, activeTab, statusFilter, sortOrder, startDate, endDate, today, twentyFourHoursAgo])

  const formatCurrency = (amount: number) => {
    return `${amount} GHS`
  }

  const formatDateTime = (dateString: string) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(new Date(dateString))
  }

  // Only PAID transactions count towards revenue
  const totalRevenue = useMemo(() => {
    const pool = activeTab === "daily"
      ? transactions.filter(t => new Date(t.createdAt).toDateString() === today)
      : transactions.filter(t => new Date(t.createdAt).getTime() < twentyFourHoursAgo)

    return pool
      .filter(t => t.paymentStatus === "PAID")
      .reduce((sum, t) => sum + t.amount, 0)
  }, [transactions, activeTab, today, twentyFourHoursAgo])

  return (
    <div className="space-y-6">
      {/* Revenue Header Card */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col justify-center rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Calendar className="h-4 w-4" />
            <span className="text-sm font-medium uppercase tracking-wider">
              {activeTab === "daily" ? "Today's Revenue" : "Total Revenue (Historical)"}
            </span>
          </div>
          <p className="text-3xl font-black text-foreground">
            {formatCurrency(totalRevenue)}
          </p>
          <p className="text-[10px] text-muted-foreground mt-2 italic leading-tight">
            * Only includes confirmed <strong>PAID</strong> transactions.
            {activeTab === "history" && " History excludes last 24h."}
          </p>
        </div>

        <div className="flex flex-col gap-2">
          {/* Custom Tabs */}
          <div className="flex rounded-lg bg-muted p-1">
            <button
              onClick={() => setActiveTab("daily")}
              className={cn(
                "flex-1 rounded-md px-3 py-2 text-sm font-medium transition-all",
                activeTab === "daily" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              Daily
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={cn(
                "flex-1 rounded-md px-3 py-2 text-sm font-medium transition-all",
                activeTab === "history" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              All History (24h+)
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by customer, phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-11 bg-input pl-10"
            />
          </div>
        </div>
      </div>

      {/* Advanced Filters */}
      <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-bold text-foreground">Filters</span>
          </div>

          <div className="flex gap-1">
            {(["ALL", "PAID", "UNPAID", "PENDING"] as FilterStatus[]).map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={cn(
                  "rounded-full px-3 py-1 text-[11px] font-bold border transition-all",
                  statusFilter === status
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background text-muted-foreground border-border hover:border-primary/50"
                )}
              >
                {status}
              </button>
            ))}
          </div>

          <div className="ml-auto flex items-center gap-2">
            <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as SortOrder)}
              className="bg-transparent text-sm font-bold focus:outline-none"
            >
              <option value="recent">Recent First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>

        {activeTab === "history" && (
          <div className="flex flex-wrap gap-3 pt-2 border-t border-border/50">
            <div className="flex flex-1 min-w-[140px] flex-col gap-1">
              <label className="text-[10px] font-bold uppercase text-muted-foreground">Start Date</label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="h-9 text-xs"
              />
            </div>
            <div className="flex flex-1 min-w-[140px] flex-col gap-1">
              <label className="text-[10px] font-bold uppercase text-muted-foreground">End Date</label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="h-9 text-xs"
              />
            </div>
            <button
              onClick={() => { setStartDate(""); setEndDate(""); setStatusFilter("ALL"); setSearchQuery("") }}
              className="self-end px-3 py-2 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
            >
              Clear All
            </button>
          </div>
        )}
      </div>

      {filteredTransactions.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-muted/10 p-12 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <Search className="h-6 w-6 text-muted-foreground/30" />
          </div>
          <h3 className="text-lg font-bold text-foreground">No matching records</h3>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto">
            Try adjusting your filters or switching tabs.
          </p>
        </div>
      ) : (
        <div className="min-w-0 overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border bg-muted/50 hover:bg-muted/50">
                  <TableHead className="w-[50px] text-muted-foreground">#</TableHead>
                  <TableHead className="text-muted-foreground uppercase text-[10px] font-black tracking-widest">Customer</TableHead>
                  <TableHead className="text-muted-foreground uppercase text-[10px] font-black tracking-widest">Order Details</TableHead>
                  <TableHead className="text-muted-foreground uppercase text-[10px] font-black tracking-widest">Amount</TableHead>
                  <TableHead className="text-muted-foreground uppercase text-[10px] font-black tracking-widest">Payment Status</TableHead>
                  <TableHead className="text-muted-foreground uppercase text-[10px] font-black tracking-widest text-right">Completed</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map((transaction, index) => {
                  const isToday = new Date(transaction.createdAt).toDateString() === today
                  return (
                    <TableRow key={transaction.id} className="border-border hover:bg-muted/10">
                      <TableCell className="text-muted-foreground font-mono text-[10px]">{index + 1}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-bold text-foreground text-sm tracking-tight">{transaction.customerName}</span>
                          <span className="text-[10px] text-muted-foreground font-medium">{transaction.phoneNumber}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1 max-w-[300px]">
                          {transaction.items && transaction.items.length > 0 ? (
                            transaction.items.map((item, i) => (
                              <span key={i} className="inline-block whitespace-nowrap rounded-md bg-secondary/80 px-1.5 py-0.5 text-[9px] font-bold border border-border/50 text-foreground">
                                {item.quantity}x {item.foodItem} ({item.size})
                              </span>
                            ))
                          ) : (
                            <span className="rounded-md bg-secondary/80 px-1.5 py-0.5 text-[9px] font-bold border border-border/50 text-foreground">
                              {transaction.foodItem} ({transaction.size})
                            </span>
                          )}
                          {transaction.extras && transaction.extras.length > 0 && (
                            <span className="text-[9px] font-bold text-primary italic flex items-center">
                              +{transaction.extras.reduce((sum, e) => sum + e.quantity, 0)} extras
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-black text-foreground text-sm">
                        {formatCurrency(transaction.amount)}
                      </TableCell>
                      <TableCell>
                        {isToday ? (
                          <select
                            value={transaction.paymentStatus}
                            onChange={(e) => onUpdatePaymentStatus(transaction.id, e.target.value)}
                            className={cn(
                              "rounded-full px-2 py-1 text-[10px] font-black border uppercase focus:outline-none transition-colors cursor-pointer",
                              transaction.paymentStatus === "PAID" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30" :
                                transaction.paymentStatus === "PENDING" ? "bg-amber-500/10 text-amber-600 border-amber-500/30" :
                                  "bg-destructive/10 text-destructive border-destructive/30"
                            )}
                          >
                            <option value="PAID">Paid</option>
                            <option value="UNPAID">Unpaid</option>
                            <option value="PENDING">Pending</option>
                          </select>
                        ) : (
                          <span className={cn(
                            "inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-black border uppercase",
                            transaction.paymentStatus === "PAID" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" :
                              transaction.paymentStatus === "PENDING" ? "bg-amber-500/10 text-amber-600 border-amber-500/20" :
                                "bg-destructive/10 text-destructive border-destructive/20"
                          )}>
                            {transaction.paymentStatus}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right text-[10px] font-bold text-muted-foreground whitespace-nowrap">
                        {formatDateTime(transaction.createdAt)}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between px-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
        <p>RECORDS: {filteredTransactions.length} / {transactions.length}</p>
        <p>GUY MAN SAAS v2.0 <br />Powered by Mmabiaa-CS</p>
      </div>
    </div>
  )
}
