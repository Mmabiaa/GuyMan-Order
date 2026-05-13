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
import { Button } from "@/components/ui/button"
import { Check, CreditCard, Trash2, Edit2, X } from "lucide-react"
import type { Order } from "@/lib/store"
import { cn } from "@/lib/utils"

interface OrdersTableProps {
  orders: Order[]
  onCompleteOrder: (id: string) => void
  onConfirmPayment: (id: string, status?: string) => void
  onDeleteOrder: (id: string) => void
  onUpdateOrder: (id: string, updates: any) => void
}

export function OrdersTable({
  orders,
  onCompleteOrder,
  onConfirmPayment,
  onDeleteOrder,
  onUpdateOrder
}: OrdersTableProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValues, setEditValues] = useState<any>(null)

  const sortedOrders = useMemo(() => {
    return [...orders].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    )
  }, [orders])

  const startEditing = (order: Order) => {
    setEditingId(order.id)
    setEditValues({
      customerName: order.customerName,
      phoneNumber: order.phoneNumber,
      items: order.items ? JSON.parse(JSON.stringify(order.items)) : [],
      extras: order.extras ? JSON.parse(JSON.stringify(order.extras)) : []
    })
  }

  const cancelEditing = () => {
    setEditingId(null)
    setEditValues(null)
  }

  const saveEditing = (id: string) => {
    const itemsTotal = editValues.items.reduce((sum: number, it: any) => sum + (it.price * it.quantity), 0)
    const extrasTotal = editValues.extras.reduce((sum: number, ex: any) => sum + (ex.price * ex.quantity), 0)
    const newAmount = itemsTotal + extrasTotal

    onUpdateOrder(id, { ...editValues, amount: newAmount })
    setEditingId(null)
    setEditValues(null)
  }

  const updateEditItem = (idx: number, qty: number) => {
    const newItems = [...editValues.items]
    newItems[idx].quantity = qty
    setEditValues({ ...editValues, items: newItems })
  }

  const updateEditExtra = (idx: number, qty: number) => {
    const newExtras = [...editValues.extras]
    newExtras[idx].quantity = qty
    setEditValues({ ...editValues, extras: newExtras })
  }

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
      <div className="space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground px-1">Orders list</h3>
        <div className="rounded-lg border border-border bg-card p-8 text-center sm:p-12">
          <p className="text-muted-foreground">No orders yet. Add your first order above.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground px-1">Orders list</h3>
      <div className="min-w-0 overflow-hidden rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="w-[120px] text-muted-foreground">Actions</TableHead>
              <TableHead className="text-muted-foreground">Customer</TableHead>
              <TableHead className="text-muted-foreground">Order Items</TableHead>
              <TableHead className="text-muted-foreground">Amount</TableHead>
              <TableHead className="text-muted-foreground">Status</TableHead>
              <TableHead className="text-muted-foreground">Payment</TableHead>
              <TableHead className="text-muted-foreground">Date/Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedOrders.map((order) => {
              const isEditing = editingId === order.id
              return (
                <TableRow key={order.id} className={cn("border-border", isEditing && "bg-secondary/20")}>
                  <TableCell>
                    {isEditing ? (
                      <div className="flex gap-1.5">
                        <Button
                          size="sm"
                          onClick={() => saveEditing(order.id)}
                          title="Save Changes"
                          className="h-8 w-8 px-0 bg-emerald-600 hover:bg-emerald-500"
                        >
                          <Check className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={cancelEditing}
                          title="Cancel"
                          className="h-8 w-8 px-0"
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onCompleteOrder(order.id)}
                          title="Mark as Fulfilled"
                          className="h-9 w-9 px-0 border-emerald-600/30 text-emerald-600 hover:bg-emerald-600 hover:text-white"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => startEditing(order)}
                          title="Edit Order"
                          className="h-9 w-9 px-0 border-blue-600/30 text-blue-600 hover:bg-blue-600 hover:text-white"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onDeleteOrder(order.id)}
                          title="Delete Order"
                          className="h-9 w-9 px-0 border-destructive/30 text-destructive hover:bg-destructive hover:text-white"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                        {order.paymentStatus !== "PAID" && (
                          <Button
                            size="sm"
                            onClick={() => onConfirmPayment(order.id, "PAID")}
                            title="Confirm Payment"
                            className="h-9 w-9 px-0 bg-amber-600 text-white hover:bg-amber-500"
                          >
                            <CreditCard className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {isEditing ? (
                      <div className="flex flex-col gap-1.5 min-w-[120px]">
                        <input
                          className="h-7 w-full rounded border border-border bg-background px-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
                          value={editValues.customerName}
                          onChange={e => setEditValues({ ...editValues, customerName: e.target.value })}
                        />
                        <input
                          className="h-7 w-full rounded border border-border bg-background px-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                          value={editValues.phoneNumber}
                          onChange={e => setEditValues({ ...editValues, phoneNumber: e.target.value })}
                        />
                      </div>
                    ) : (
                      <div className="flex flex-col">
                        <span className="font-semibold text-foreground">{order.customerName}</span>
                        <span className="text-xs text-muted-foreground">{order.phoneNumber}</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="max-w-[200px]">
                    <div className="flex flex-col gap-1.5">
                      {isEditing ? (
                        <>
                          {editValues.items.map((item: any, i: number) => (
                            <div key={i} className="flex items-center gap-2 text-xs">
                              <span className="flex-1 truncate">{item.foodItem} ({item.size})</span>
                              <input
                                type="number"
                                min="1"
                                className="h-7 w-12 rounded border border-border bg-background px-1.5 text-center text-xs font-bold focus:outline-none focus:ring-1 focus:ring-primary"
                                value={item.quantity}
                                onChange={e => updateEditItem(i, parseInt(e.target.value) || 1)}
                              />
                            </div>
                          ))}
                          {editValues.extras.map((extra: any, i: number) => (
                            <div key={`ex-${i}`} className="flex items-center gap-2 text-[10px] text-muted-foreground italic">
                              <span className="flex-1 truncate">+ {extra.name} ({extra.size})</span>
                              <input
                                type="number"
                                min="0"
                                className="h-6 w-10 rounded border border-border bg-background px-1 text-center text-[10px] font-bold focus:outline-none"
                                value={extra.quantity}
                                onChange={e => updateEditExtra(i, parseInt(e.target.value) || 0)}
                              />
                            </div>
                          ))}
                        </>
                      ) : (
                        <>
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
                        </>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-bold text-foreground">
                    {isEditing ? (
                      <span className="text-primary font-black">
                        {formatCurrency(
                          editValues.items.reduce((sum: number, it: any) => sum + (it.price * it.quantity), 0) +
                          editValues.extras.reduce((sum: number, ex: any) => sum + (ex.price * ex.quantity), 0)
                        )}
                      </span>
                    ) : (
                      formatCurrency(order.amount)
                    )}
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
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}