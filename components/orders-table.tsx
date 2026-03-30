"use client"

import { useMemo } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"
import type { Order } from "@/lib/store"

interface OrdersTableProps {
  orders: Order[]
  onCompleteOrder: (id: string) => void
}

export function OrdersTable({ orders, onCompleteOrder }: OrdersTableProps) {
  // Sort orders by createdAt ascending (FIFO - oldest first)
  const sortedOrders = useMemo(() => {
    return [...orders].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    )
  }, [orders])

  const formatCurrency = (amount: number) => {
    return `${amount} GHS`
  }

  const formatTime = (dateString: string) => {
    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(new Date(dateString))
  }

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
    }).format(new Date(dateString))
  }

  if (orders.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-12 text-center">
        <p className="text-muted-foreground">No orders yet. Add your first order above.</p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow className="border-border hover:bg-transparent">
            <TableHead className="w-[70px] text-muted-foreground">Complete</TableHead>
            <TableHead className="text-muted-foreground">Customer</TableHead>
            <TableHead className="text-muted-foreground">Phone</TableHead>
            <TableHead className="text-muted-foreground">Food Item</TableHead>
            <TableHead className="text-muted-foreground">Size</TableHead>
            <TableHead className="text-muted-foreground">Amount</TableHead>
            <TableHead className="text-muted-foreground">Date</TableHead>
            <TableHead className="text-muted-foreground">Time</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedOrders.map((order) => (
            <TableRow key={order.id} className="border-border">
              <TableCell>
                <Button
                  size="sm"
                  onClick={() => onCompleteOrder(order.id)}
                  aria-label="Mark as completed"
                  className="h-8 w-8 bg-emerald-600 hover:bg-emerald-500 text-white"
                >
                  <Check className="h-4 w-4" />
                </Button>
              </TableCell>
              <TableCell className="font-medium text-foreground">
                {order.customerName}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {order.phoneNumber}
              </TableCell>
              <TableCell className="text-foreground">{order.foodItem}</TableCell>
              <TableCell className="text-foreground">{order.size}</TableCell>
              <TableCell className="text-foreground">
                {formatCurrency(order.amount)}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {formatDate(order.createdAt)}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {formatTime(order.createdAt)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
