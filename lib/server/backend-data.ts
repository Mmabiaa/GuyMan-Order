/**
 * Server-only transport to the backend API (no auth or domain logic — that lives in the API).
 * Do not import this file from Client Components.
 */
import type { Order } from "@/lib/store"
import { mapOrderDto } from "@/lib/api/order-dto"

function backendBase(): string {
  const raw =
    process.env.BACKEND_URL ??
    process.env.NEXT_PUBLIC_BACKEND_URL ??
    "http://localhost:4000"
  return raw.replace(/\/$/, "")
}

export type DashboardInitialData = {
  orders: Order[]
  transactions: Order[]
}

export async function loadDashboardInitialData(
  authToken: string
): Promise<DashboardInitialData | "unauthorized"> {
  const base = backendBase()
  const cookie = `auth-token=${authToken}`

  const [ordersRes, txRes] = await Promise.all([
    fetch(`${base}/v1/orders`, {
      headers: { cookie, accept: "application/json" },
      cache: "no-store"
    }),
    fetch(`${base}/v1/transactions`, {
      headers: { cookie, accept: "application/json" },
      cache: "no-store"
    })
  ])

  if (ordersRes.status === 401 || txRes.status === 401) {
    return "unauthorized"
  }

  if (!ordersRes.ok || !txRes.ok) {
    throw new Error(
      `API error: orders ${ordersRes.status}, transactions ${txRes.status}`
    )
  }

  const ordersJson = (await ordersRes.json()) as { items: Record<string, unknown>[] }
  const txJson = (await txRes.json()) as { items: Record<string, unknown>[] }

  return {
    orders: ordersJson.items.map(mapOrderDto),
    transactions: txJson.items.map(mapOrderDto)
  }
}
