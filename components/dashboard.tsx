"use client"

import { useState, useEffect, useCallback } from "react"
import { OrderForm } from "@/components/order-form"
import { OrdersTable } from "@/components/orders-table"
import { UtensilsCrossed, ClipboardList, LayoutDashboard } from "lucide-react"
import { TransactionsTable } from "@/components/transactions-table"
import type { Order } from "@/lib/store"
import {
  completeOrder,
  createOrder,
  listActiveOrders,
  listTransactions
} from "@/lib/backendClient"
import { cn } from "@/lib/utils"

type View = "orders" | "transactions"

export function Dashboard() {
  const [orders, setOrders] = useState<Order[]>([])
  const [transactions, setTransactions] = useState<Order[]>([])
  const [currentView, setCurrentView] = useState<View>("orders")
  const [mounted, setMounted] = useState(false)

  // Load data from backend on mount
  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const [activeOrders, txs] = await Promise.all([
          listActiveOrders(),
          listTransactions()
        ])
        if (cancelled) return
        setOrders(activeOrders)
        setTransactions(txs)
      } catch (err: any) {
        if (err?.message === "unauthorized") {
          window.location.href = "/login"
          return
        }
        // eslint-disable-next-line no-console
        console.error(err)
      } finally {
        if (!cancelled) setMounted(true)
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [])

  const handleAddOrder = useCallback(
    (orderData: {
      customerName: string
      phoneNumber: string
      foodItem: string
      size: string
      amount: number
    }) => {
      void (async () => {
        const created = await createOrder(orderData)
        setOrders((prev) => [...prev, created])
      })()
    },
    []
  )

  const handleCompleteOrder = useCallback(
    (id: string) => {
      void (async () => {
        try {
          const completed = await completeOrder(id)
          setOrders((prev) => prev.filter((o) => o.id !== id))
          setTransactions((prev) => [...prev, completed])
        } catch (err: any) {
          if (err?.message === "unauthorized") {
            window.location.href = "/login"
            return
          }
          // eslint-disable-next-line no-console
          console.error(err)
        }
      })()
    },
    []
  )

  const totalAmount = orders.reduce((sum, order) => sum + order.amount, 0)

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <UtensilsCrossed className="h-6 w-6 text-foreground" />
            <h1 className="text-xl font-semibold text-foreground">
              Guy Man
            </h1>
          </div>
          <nav className="flex gap-1">
            <button
              onClick={() => setCurrentView("orders")}
              className={cn(
                "flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors",
                currentView === "orders"
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
              )}
            >
              <LayoutDashboard className="h-4 w-4" />
              Orders
            </button>
            <button
              onClick={() => setCurrentView("transactions")}
              className={cn(
                "flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors",
                currentView === "transactions"
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
              )}
            >
              <ClipboardList className="h-4 w-4" />
              Transactions
              {transactions.length > 0 && (
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs">
                  {transactions.length}
                </span>
              )}
            </button>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        {currentView === "orders" ? (
          <>
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-foreground">
                  Active Orders
                </h2>
                <p className="text-muted-foreground">
                  {orders.length} {orders.length === 1 ? "order" : "orders"} pending
                </p>
              </div>
              {orders.length > 0 && (
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Pending Total</p>
                  <p className="text-2xl font-semibold text-foreground">
                    {totalAmount} GHS
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <OrderForm onAddOrder={handleAddOrder} />
              <OrdersTable orders={orders} onCompleteOrder={handleCompleteOrder} />
            </div>
          </>
        ) : (
          <>
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground">
                Transaction History
              </h2>
              <p className="text-muted-foreground">
                Record of all completed orders
              </p>
            </div>
            <TransactionsTable transactions={transactions} />
          </>
        )}
      </main>
    </div>
  )
}
