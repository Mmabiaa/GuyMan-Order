"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { OrderForm } from "@/components/order-form"
import { OrdersTable } from "@/components/orders-table"
import {
  UtensilsCrossed,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Clock // Added for visual flair
} from "lucide-react"
import { TransactionsTable } from "@/components/transactions-table"
import type { Order } from "@/lib/store"
import {
  postCompleteOrder,
  postLogout,
  postOrder
} from "@/lib/api/browser-transport"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

type View = "orders" | "transactions"

type DashboardProps = {
  initialOrders: Order[]
  initialTransactions: Order[]
}

export function Dashboard({
  initialOrders,
  initialTransactions
}: DashboardProps) {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>(initialOrders)
  const [transactions, setTransactions] = useState<Order[]>(
    initialTransactions
  )
  const [currentView, setCurrentView] = useState<View>("orders")
  const [loggingOut, setLoggingOut] = useState(false)

  // State for Date and Time
  const [currentTime, setCurrentTime] = useState(new Date())

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    setOrders(initialOrders)
    setTransactions(initialTransactions)
  }, [initialOrders, initialTransactions])

  const handleAddOrder = useCallback(
    (orderData: {
      customerName: string
      phoneNumber: string
      foodItem: string
      size: string
      amount: number
    }) => {
      void (async () => {
        try {
          await postOrder(orderData)
          router.refresh()
        } catch (err: unknown) {
          if (err instanceof Error && err.message === "unauthorized") {
            window.location.href = "/login"
            return
          }
          console.error(err)
        }
      })()
    },
    [router]
  )

  const handleCompleteOrder = useCallback(
    (id: string) => {
      void (async () => {
        try {
          await postCompleteOrder(id)
          router.refresh()
        } catch (err: unknown) {
          if (err instanceof Error && err.message === "unauthorized") {
            window.location.href = "/login"
            return
          }
          console.error(err)
        }
      })()
    },
    [router]
  )

  const totalAmount = orders.reduce((sum, order) => sum + order.amount, 0)

  const handleLogout = useCallback(() => {
    setLoggingOut(true)
    void postLogout().finally(() => {
      window.location.href = "/login"
    })
  }, [])

  // Formatter for Date and Time
  const formattedDate = currentTime.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric"
  })

  const formattedTime = currentTime.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  })

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <UtensilsCrossed className="h-6 w-6 shrink-0 text-foreground" />
              <h1 className="truncate text-lg font-semibold text-foreground sm:text-xl">
                Guy Man
              </h1>
            </div>

            {/* New Date and Time Display */}
            <div className="hidden border-l border-border pl-4 md:block">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                <span>{formattedDate}</span>
                <span className="text-foreground">{formattedTime}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
            <nav className="flex min-w-0 flex-1 flex-wrap gap-1 sm:justify-end">
              <button
                type="button"
                onClick={() => setCurrentView("orders")}
                className={cn(
                  "flex min-h-10 min-w-0 items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors sm:px-4",
                  currentView === "orders"
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                )}
              >
                <LayoutDashboard className="h-4 w-4 shrink-0" />
                <span className="truncate">Orders</span>
              </button>
              <button
                type="button"
                onClick={() => setCurrentView("transactions")}
                className={cn(
                  "flex min-h-10 min-w-0 items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors sm:px-4",
                  currentView === "transactions"
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                )}
              >
                <ClipboardList className="h-4 w-4 shrink-0" />
                <span className="truncate">Transactions</span>
                {transactions.length > 0 && (
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs">
                    {transactions.length}
                  </span>
                )}
              </button>
            </nav>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full shrink-0 sm:w-auto"
              disabled={loggingOut}
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              {loggingOut ? "Signing out…" : "Log out"}
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        {currentView === "orders" ? (
          <>
            <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-foreground sm:text-2xl">
                  Active Orders
                </h2>
                <p className="text-sm text-muted-foreground sm:text-base">
                  {orders.length} {orders.length === 1 ? "order" : "orders"}{" "}
                  pending
                </p>
              </div>
              {orders.length > 0 && (
                <div className="text-left sm:text-right">
                  <p className="text-sm text-muted-foreground">Pending Total</p>
                  <p className="text-xl font-semibold text-foreground sm:text-2xl">
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
            <div className="mb-6 sm:mb-8">
              <h2 className="text-xl font-semibold text-foreground sm:text-2xl">
                Transaction History
              </h2>
              <p className="text-sm text-muted-foreground sm:text-base">
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