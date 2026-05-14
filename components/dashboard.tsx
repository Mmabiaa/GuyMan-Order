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
  postUpdatePaymentStatus,
  deleteOrder,
  putUpdateOrder,
  postLogout,
  postOrder
} from "@/lib/api/browser-transport"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import type { OrderItem, ExtraOrderItem } from "@/lib/store"

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
      items: OrderItem[]
      extras: ExtraOrderItem[]
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

  const handleUpdatePaymentStatus = useCallback(
    (id: string, status: string) => {
      void (async () => {
        try {
          await postUpdatePaymentStatus(id, status)
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

  const handleDeleteOrder = useCallback(
    (id: string) => {
      if (!confirm("Are you sure you want to delete this order?")) return
      void (async () => {
        try {
          await deleteOrder(id)
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

  const handleUpdateOrder = useCallback(
    (id: string, updates: any) => {
      void (async () => {
        try {
          await putUpdateOrder(id, updates)
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
            <nav className="hidden sm:flex min-w-0 flex-1 flex-wrap gap-1 sm:justify-end">
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

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 pb-24 sm:pb-8">
        {currentView === "orders" ? (
          <>
            <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-xl font-bold text-foreground sm:text-2xl tracking-tight">
                  Orders list
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

            <div className="space-y-12">
              <OrderForm onAddOrder={handleAddOrder} />
              <OrdersTable
                orders={orders}
                onCompleteOrder={handleCompleteOrder}
                onConfirmPayment={(id) => handleUpdatePaymentStatus(id, "PAID")}
                onDeleteOrder={handleDeleteOrder}
                onUpdateOrder={handleUpdateOrder}
              />
            </div>
          </>
        ) : (
          <>
            <div className="mb-6 sm:mb-8">
              <h2 className="text-xl font-semibold text-foreground sm:text-2xl">
                {formattedDate}
              </h2>
              <p className="text-sm text-muted-foreground sm:text-base">
                Record of completed transactions
              </p>
            </div>
            <TransactionsTable
              transactions={transactions}
              onUpdatePaymentStatus={handleUpdatePaymentStatus}
            />
          </>
        )}
      </main>

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-4 left-4 right-4 z-50 rounded-2xl border border-border bg-background/80 p-1 backdrop-blur-lg shadow-lg sm:hidden">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentView("orders")}
            className={cn(
              "flex flex-1 flex-col items-center gap-1 rounded-xl py-2 transition-all",
              currentView === "orders" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary/50"
            )}
          >
            <LayoutDashboard className="h-5 w-5" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Orders</span>
          </button>
          <button
            onClick={() => setCurrentView("transactions")}
            className={cn(
              "flex flex-1 flex-col items-center gap-1 rounded-xl py-2 transition-all",
              currentView === "transactions" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary/50"
            )}
          >
            <ClipboardList className="h-5 w-5" />
            <span className="text-[10px] font-bold uppercase tracking-widest">History</span>
          </button>
        </div>
      </div>
    </div>
  )
}