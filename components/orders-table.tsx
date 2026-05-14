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
import { Check, CreditCard, Trash2, Edit2, X, Phone, User, ShoppingBag } from "lucide-react"
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
        <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
          <p className="text-muted-foreground">No orders yet. Add your first order above.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground px-1">Orders list</h3>

      {/* Desktop Table View */}
      <div className="hidden md:block min-w-0 overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="border-border bg-muted/50 hover:bg-muted/50">
              <TableHead className="w-[120px] text-muted-foreground uppercase text-[10px] font-black tracking-widest">Actions</TableHead>
              <TableHead className="text-muted-foreground uppercase text-[10px] font-black tracking-widest">Customer</TableHead>
              <TableHead className="text-muted-foreground uppercase text-[10px] font-black tracking-widest">Order Items</TableHead>
              <TableHead className="text-muted-foreground uppercase text-[10px] font-black tracking-widest">Amount</TableHead>
              <TableHead className="text-muted-foreground uppercase text-[10px] font-black tracking-widest">Status</TableHead>
              <TableHead className="text-muted-foreground uppercase text-[10px] font-black tracking-widest">Payment</TableHead>
              <TableHead className="text-muted-foreground uppercase text-[10px] font-black tracking-widest">Date/Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedOrders.map((order) => {
              const isEditing = editingId === order.id
              return (
                <TableRow key={order.id} className={cn("border-border transition-colors", isEditing && "bg-primary/5")}>
                  <TableCell>
                    {isEditing ? (
                      <div className="flex gap-1.5">
                        <Button
                          size="sm"
                          onClick={() => saveEditing(order.id)}
                          className="h-8 w-8 px-0 bg-emerald-600 hover:bg-emerald-500"
                        >
                          <Check className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={cancelEditing}
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
                          className="h-9 w-9 px-0 border-emerald-600/30 text-emerald-600 hover:bg-emerald-600 hover:text-white"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => startEditing(order)}
                          className="h-9 w-9 px-0 border-blue-600/30 text-blue-600 hover:bg-blue-600 hover:text-white"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onDeleteOrder(order.id)}
                          className="h-9 w-9 px-0 border-destructive/30 text-destructive hover:bg-destructive hover:text-white"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                        {order.paymentStatus !== "PAID" && (
                          <Button
                            size="sm"
                            onClick={() => onConfirmPayment(order.id, "PAID")}
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
                          className="h-7 w-full rounded border border-border bg-background px-2 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-primary"
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
                        <span className="font-bold text-foreground text-sm tracking-tight">{order.customerName}</span>
                        <span className="text-[10px] text-muted-foreground font-medium">{order.phoneNumber}</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="max-w-[200px]">
                    <div className="flex flex-wrap gap-1">
                      {isEditing ? (
                        <>
                          {editValues.items.map((item: any, i: number) => (
                            <div key={i} className="flex items-center gap-1.5 rounded-md bg-secondary/50 px-2 py-1 text-[10px] border border-border/50">
                              <span className="truncate">{item.foodItem} ({item.size})</span>
                              <input
                                type="number"
                                min="1"
                                className="h-5 w-8 rounded border border-border bg-background px-1 text-center text-[10px] font-black focus:outline-none"
                                value={item.quantity}
                                onChange={e => updateEditItem(i, parseInt(e.target.value) || 1)}
                              />
                            </div>
                          ))}
                        </>
                      ) : (
                        <>
                          {order.items && order.items.length > 0 ? (
                            order.items.map((item, i) => (
                              <span key={i} className="inline-block whitespace-nowrap rounded-md bg-secondary/80 px-1.5 py-0.5 text-[9px] font-bold border border-border/50 text-foreground">
                                {item.quantity}x {item.foodItem} ({item.size})
                              </span>
                            ))
                          ) : (
                            <span className="rounded-md bg-secondary/80 px-1.5 py-0.5 text-[9px] font-bold border border-border/50 text-foreground">
                              {order.foodItem} ({order.size})
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-black text-foreground text-sm">
                    {isEditing ? (
                      <span className="text-primary tracking-tighter">
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
                      "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-black border uppercase tracking-wider",
                      order.completed
                        ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                        : "bg-blue-500/10 text-blue-600 border-blue-500/20"
                    )}>
                      {order.completed ? "Fulfilled" : "Pending"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={cn(
                      "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-black border uppercase tracking-wider",
                      order.paymentStatus === "PAID" ? "bg-emerald-600 text-white border-emerald-600" :
                        order.paymentStatus === "PENDING" ? "bg-amber-500 text-white border-amber-500" : "bg-destructive text-white border-destructive"
                    )}>
                      {order.paymentStatus}
                    </span>
                  </TableCell>
                  <TableCell className="text-[10px] font-bold text-muted-foreground whitespace-nowrap">
                    {formatDate(order.createdAt)} • {formatTime(order.createdAt)}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card View */}
      <div className="grid gap-4 md:hidden">
        {sortedOrders.map((order) => {
          const isEditing = editingId === order.id
          return (
            <div key={order.id} className={cn(
              "relative overflow-hidden rounded-2xl border transition-all shadow-sm",
              isEditing ? "border-primary bg-primary/5 ring-1 ring-primary/20" : "border-border bg-card hover:border-border/80"
            )}>
              {/* Status Banner */}
              <div className="flex items-center justify-between px-4 py-2 bg-muted/30 border-b border-border/50">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  {formatDate(order.createdAt)} • {formatTime(order.createdAt)}
                </span>
                <div className="flex gap-2">
                  <span className={cn(
                    "rounded-full px-2 py-0.5 text-[9px] font-black border uppercase tracking-tighter",
                    order.completed ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-blue-500/10 text-blue-600 border-blue-500/20"
                  )}>
                    {order.completed ? "Fulfilled" : "Pending"}
                  </span>
                  <span className={cn(
                    "rounded-full px-2 py-0.5 text-[9px] font-black border uppercase tracking-tighter",
                    order.paymentStatus === "PAID" ? "bg-emerald-600 text-white border-emerald-600" :
                      order.paymentStatus === "PENDING" ? "bg-amber-500 text-white border-amber-500" : "bg-destructive text-white border-destructive"
                  )}>
                    {order.paymentStatus}
                  </span>
                </div>
              </div>

              <div className="p-4 space-y-4">
                {/* Customer Info */}
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    {isEditing ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <User className="h-3 w-3 text-primary" />
                          <input
                            className="h-8 w-full rounded-lg border border-border bg-background px-3 text-xs font-black focus:outline-none focus:ring-2 focus:ring-primary/20"
                            value={editValues.customerName}
                            onChange={e => setEditValues({ ...editValues, customerName: e.target.value })}
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-3 w-3 text-primary" />
                          <input
                            className="h-8 w-full rounded-lg border border-border bg-background px-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
                            value={editValues.phoneNumber}
                            onChange={e => setEditValues({ ...editValues, phoneNumber: e.target.value })}
                          />
                        </div>
                      </div>
                    ) : (
                      <>
                        <h4 className="font-black text-foreground text-base tracking-tight leading-none">{order.customerName}</h4>
                        <p className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                          <Phone className="h-3 w-3" /> {order.phoneNumber}
                        </p>
                      </>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase mb-0.5">Grand Total</p>
                    <p className="text-lg font-black text-foreground tracking-tighter">
                      {isEditing ? (
                        formatCurrency(
                          editValues.items.reduce((sum: number, it: any) => sum + (it.price * it.quantity), 0) +
                          editValues.extras.reduce((sum: number, ex: any) => sum + (ex.price * ex.quantity), 0)
                        )
                      ) : formatCurrency(order.amount)}
                    </p>
                  </div>
                </div>

                {/* Items List */}
                <div className="rounded-xl bg-muted/20 p-3 border border-border/30">
                  <div className="flex items-center gap-1.5 mb-2 text-[10px] font-black uppercase text-primary tracking-widest">
                    <ShoppingBag className="h-3 w-3" /> Items
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {isEditing ? (
                      editValues.items.map((item: any, i: number) => (
                        <div key={i} className="flex items-center gap-2 rounded-lg bg-background border border-border p-1.5 pr-2">
                          <span className="text-[10px] font-bold text-foreground pl-1">{item.foodItem} ({item.size})</span>
                          <input
                            type="number"
                            min="1"
                            className="h-6 w-10 rounded-md border border-border bg-muted/30 px-1 text-center text-xs font-black focus:outline-none"
                            value={item.quantity}
                            onChange={e => updateEditItem(i, parseInt(e.target.value) || 1)}
                          />
                        </div>
                      ))
                    ) : (
                      order.items?.map((item, i) => (
                        <div key={i} className="flex items-center gap-1 rounded-lg bg-secondary/20 border border-border/50 px-2 py-1">
                          <span className="text-[10px] font-black text-primary">{item.quantity}x</span>
                          <span className="text-[10px] font-bold text-foreground">{item.foodItem}</span>
                          <span className="text-[9px] text-muted-foreground uppercase font-black">({item.size})</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Mobile Actions */}
                <div className="pt-2 flex gap-2">
                  {isEditing ? (
                    <>
                      <Button
                        onClick={() => saveEditing(order.id)}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-500 rounded-xl h-11"
                      >
                        <Check className="h-4 w-4 mr-2" /> Save
                      </Button>
                      <Button
                        variant="outline"
                        onClick={cancelEditing}
                        className="flex-1 rounded-xl h-11"
                      >
                        <X className="h-4 w-4 mr-2" /> Cancel
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        onClick={() => onCompleteOrder(order.id)}
                        className="flex-1 rounded-xl h-11 border-emerald-600/30 text-emerald-600 hover:bg-emerald-600 hover:text-white"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => startEditing(order)}
                        className="flex-1 rounded-xl h-11 border-blue-600/30 text-blue-600 hover:bg-blue-600 hover:text-white"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => onDeleteOrder(order.id)}
                        className="flex-1 rounded-xl h-11 border-destructive/30 text-destructive hover:bg-destructive hover:text-white"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      {order.paymentStatus !== "PAID" && (
                        <Button
                          onClick={() => onConfirmPayment(order.id, "PAID")}
                          className="flex-1 bg-amber-600 text-white hover:bg-amber-500 rounded-xl h-11"
                        >
                          <CreditCard className="h-4 w-4" />
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}