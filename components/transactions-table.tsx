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
}

type FilterStatus = "ALL" | "PAID" | "UNPAID" | "PENDING"
type SortOrder = "recent" | "oldest"

export function TransactionsTable({ transactions }: TransactionsTableProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState<"daily" | "history">("daily")
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("ALL")
  const [sortOrder, setSortOrder] = useState<SortOrder>("recent")

  const today = new Date().toDateString()

  // Filter and sort transactions
  const filteredTransactions = useMemo(() => {
    let filtered = [...transactions]

    // Tab filtering (Daily vs History)
    if (activeTab === "daily") {
      filtered = filtered.filter(t => new Date(t.createdAt).toDateString() === today)
    }

    // Status filtering
    if (statusFilter !== "ALL") {
      filtered = filtered.filter(t => t.paymentStatus === statusFilter)
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
  }, [transactions, searchQuery, activeTab, statusFilter, sortOrder, today])

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
      : transactions

    return pool
      .filter(t => t.paymentStatus === "PAID")
      .reduce((sum, t) => sum + t.amount, 0)
  }, [transactions, activeTab, today])

  return (
    <div className="space-y-6">
      {/* Revenue Header Card */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col justify-center rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Calendar className="h-4 w-4" />
            <span className="text-sm font-medium uppercase tracking-wider">
              {activeTab === "daily" ? "Today's Revenue" : "Total Revenue (History)"}
            </span>
          </div>
          <p className="text-3xl font-black text-foreground">
            {formatCurrency(totalRevenue)}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            * Only includes confirmed <strong>PAID</strong> transactions
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
              Daily Transactions
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={cn(
                "flex-1 rounded-md px-3 py-2 text-sm font-medium transition-all",
                activeTab === "history" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              All History
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

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center gap-3 border-y border-border/50 py-3">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">Filter:</span>
        </div>

        <div className="flex gap-1">
          {(["ALL", "PAID", "UNPAID", "PENDING"] as FilterStatus[]).map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-semibold border transition-all",
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
            className="bg-transparent text-sm font-medium focus:outline-none"
          >
            <option value="recent">Recent First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>
      </div>

      {filteredTransactions.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-muted/20 p-12 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <Search className="h-6 w-6 text-muted-foreground/50" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">No transactions found</h3>
          <p className="text-muted-foreground max-w-xs mx-auto">
            {transactions.length === 0
              ? "Start by completing some orders to see them here."
              : "Try adjusting your filters or search terms."}
          </p>
        </div>
      ) : (
        <div className="min-w-0 overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border bg-muted/30 hover:bg-muted/30">
                  <TableHead className="w-[50px] text-muted-foreground">#</TableHead>
                  <TableHead className="text-muted-foreground uppercase text-[10px] font-bold tracking-wider">Customer</TableHead>
                  <TableHead className="text-muted-foreground uppercase text-[10px] font-bold tracking-wider">Order Items</TableHead>
                  <TableHead className="text-muted-foreground uppercase text-[10px] font-bold tracking-wider">Total Amount</TableHead>
                  <TableHead className="text-muted-foreground uppercase text-[10px] font-bold tracking-wider">Payment Status</TableHead>
                  <TableHead className="text-muted-foreground uppercase text-[10px] font-bold tracking-wider text-right">Date Completed</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map((transaction, index) => (
                  <TableRow key={transaction.id} className="border-border hover:bg-muted/20">
                    <TableCell className="text-muted-foreground font-mono text-xs">{index + 1}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-semibold text-foreground">{transaction.customerName}</span>
                        <span className="text-xs text-muted-foreground">{transaction.phoneNumber}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1 max-w-[250px]">
                        {transaction.items && transaction.items.length > 0 ? (
                          transaction.items.map((item, i) => (
                            <span key={i} className="inline-block whitespace-nowrap rounded bg-secondary/50 px-1.5 py-0.5 text-[10px] border border-border/50">
                              {item.quantity}x {item.foodItem} ({item.size})
                            </span>
                          ))
                        ) : (
                          <span className="rounded bg-secondary/50 px-1.5 py-0.5 text-[10px] border border-border/50">
                            {transaction.foodItem} ({transaction.size})
                          </span>
                        )}
                        {transaction.extras && transaction.extras.length > 0 && (
                          <span className="text-[10px] text-muted-foreground italic flex items-center">
                            + {transaction.extras.length} extras
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-bold text-foreground">
                      {formatCurrency(transaction.amount)}
                    </TableCell>
                    <TableCell>
                      <span className={cn(
                        "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold border",
                        transaction.paymentStatus === "PAID" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                          transaction.paymentStatus === "PENDING" ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                            "bg-destructive/10 text-destructive border-destructive/20"
                      )}>
                        {transaction.paymentStatus === "PAID" ? "Paid" : transaction.paymentStatus === "PENDING" ? "Pending" : "Unpaid"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right text-xs font-medium text-muted-foreground">
                      {formatDateTime(transaction.createdAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between px-2 text-xs text-muted-foreground">
        <p>Showing {filteredTransactions.length} of {transactions.length} record{transactions.length !== 1 ? 's' : ''}</p>
        <p>Powered by Guy Man SaaS</p>
      </div>
    </div>
  )
}
