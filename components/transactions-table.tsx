"use client"

import { useMemo, useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import type { Order } from "@/lib/store"

interface TransactionsTableProps {
  transactions: Order[]
}

export function TransactionsTable({ transactions }: TransactionsTableProps) {
  const [searchQuery, setSearchQuery] = useState("")

  // Filter and sort transactions
  const filteredTransactions = useMemo(() => {
    let filtered = [...transactions]

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (t) =>
          t.customerName.toLowerCase().includes(query) ||
          t.phoneNumber.toLowerCase().includes(query) ||
          t.foodItem.toLowerCase().includes(query)
      )
    }

    // Sort by createdAt ascending (FIFO)
    return filtered.sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    )
  }, [transactions, searchQuery])

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

  const totalRevenue = useMemo(() => {
    return transactions.reduce((sum, t) => sum + t.amount, 0)
  }, [transactions])

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative min-w-0 w-full max-w-sm sm:flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search transactions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-input pl-9"
          />
        </div>
        <div className="shrink-0 text-left sm:text-right">
          <p className="text-sm text-muted-foreground">Total Revenue</p>
          <p className="text-lg font-semibold text-foreground sm:text-xl">
            {formatCurrency(totalRevenue)}
          </p>
        </div>
      </div>

      {filteredTransactions.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-8 text-center sm:p-12">
          <p className="text-muted-foreground">
            {transactions.length === 0
              ? "No completed transactions yet."
              : "No transactions match your search."}
          </p>
        </div>
      ) : (
        <div className="min-w-0 overflow-hidden rounded-lg border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground">#</TableHead>
                <TableHead className="text-muted-foreground">Customer</TableHead>
                <TableHead className="text-muted-foreground">Phone</TableHead>
                <TableHead className="text-muted-foreground">Food Item</TableHead>
                <TableHead className="text-muted-foreground">Size</TableHead>
                <TableHead className="text-muted-foreground">Amount</TableHead>
                <TableHead className="text-muted-foreground">Completed</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.map((transaction, index) => (
                <TableRow key={transaction.id} className="border-border">
                  <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                  <TableCell className="font-medium text-foreground">
                    {transaction.customerName}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {transaction.phoneNumber}
                  </TableCell>
                  <TableCell className="text-foreground">
                    {transaction.foodItem}
                  </TableCell>
                  <TableCell className="text-foreground">{transaction.size}</TableCell>
                  <TableCell className="text-foreground">
                    {formatCurrency(transaction.amount)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDateTime(transaction.createdAt)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <p className="text-sm text-muted-foreground">
        Showing {filteredTransactions.length} of {transactions.length} transactions
      </p>
    </div>
  )
}
