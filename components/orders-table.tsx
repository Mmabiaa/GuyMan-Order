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
// Changed Plus to CreditCard
import { Check, CreditCard } from "lucide-react"
import type { Order } from "@/lib/store"
import { cn } from "@/lib/utils"

interface OrdersTableProps {
  orders: Order[]
  onCompleteOrder: (id: string) => void
  onConfirmPayment: (id: string) => void
}

export function OrdersTable({ orders, onCompleteOrder, onConfirmPayment }: OrdersTableProps) {
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
      <div className="rounded-lg border border-border bg-card p-8 text-center sm:p-12">
        <p className="text-muted-foreground">No orders yet. Add your first order above.</p>
      </div>
    )
  }

  return (
    <div className="min-w-0 overflow-hidden rounded-lg border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow className="border-border hover:bg-transparent">
            <TableHead className="w-[100px] text-muted-foreground">Actions</TableHead>
            <TableHead className="text-muted-foreground">Customer</TableHead>
            <TableHead className="text-muted-foreground">Order Items</TableHead>
            <TableHead className="text-muted-foreground">Amount</TableHead>
            <TableHead className="text-muted-foreground">Status</TableHead>
            <TableHead className="text-muted-foreground">Payment</TableHead>
            <TableHead className="text-muted-foreground">Date/Time</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedOrders.map((order) => (
            <TableRow key={order.id} className="border-border">
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onCompleteOrder(order.id)}
                    title="Mark as Fulfilled"
                    className="h-9 w-9 shrink-0 border-emerald-600/30 text-emerald-600 hover:bg-emerald-600 hover:text-white"
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  {order.paymentStatus !== "PAID" && (
                    <Button
                      size="sm"
                      onClick={() => onConfirmPayment(order.id)}
                      title="Confirm Payment"
                      className="h-9 w-9 shrink-0 bg-amber-600 text-white hover:bg-amber-500"
                    >
                      {/* Swapped Plus for CreditCard */}
                      <CreditCard className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-semibold text-foreground">{order.customerName}</span>
                  <span className="text-xs text-muted-foreground">{order.phoneNumber}</span>
                </div>
              </TableCell>
              <TableCell className="max-w-[200px]">
                <div className="flex flex-col gap-1">
                  {order.items && order.items.length > 0 ? (
                    order.items.map((item, i) => (
                      <div key={i} className="text-xs text-foreground bg-secondary/30 px-1.5 py-0.5 rounded border border-border/50">
                        {item.quantity}x {item.foodItem} ({item.size})
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-foreground">{order.foodItem} ({order.size})</div>
                  )}
                  {order.extras && order.extras.map((extra, i) => (
                    <div key={`extra-${i}`} className="text-[10px] text-muted-foreground italic">
                      + {extra.quantity} {extra.name} ({extra.size})
                    </div>
                  ))}
                </div>
              </TableCell>
              <TableCell className="font-bold text-foreground">
                {formatCurrency(order.amount)}
              </TableCell>
              <TableCell>
                <span className={cn(
                  "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium border",
                  order.completed
                    ? "bg-emerald-100/10 text-emerald-500 border-emerald-500/20"
                    : "bg-blue-100/10 text-blue-500 border-blue-500/20"
                )}>
                  {order.completed ? "Fulfilled" : "Pending"}
                </span>
              </TableCell>
              <TableCell>
                <span className={cn(
                  "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium border text-white",
                  order.paymentStatus === "PAID" ? "bg-emerald-600 border-emerald-600" :
                    order.paymentStatus === "PENDING" ? "bg-amber-500 border-amber-500" : "bg-destructive border-destructive"
                )}>
                  {order.paymentStatus === "PAID" ? "Paid" : order.paymentStatus === "PENDING" ? "Pending" : "Unpaid"}
                </span>
              </TableCell>
              <TableCell className="text-xs text-muted-foreground">
                <div>{formatDate(order.createdAt)}</div>
                <div>{formatTime(order.createdAt)}</div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}