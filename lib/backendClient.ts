import type { Order } from "@/lib/store"

const BACKEND_BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:4000"

function toOrderDto(raw: any): Order {
  return {
    id: String(raw.id),
    customerName: String(raw.customerName),
    phoneNumber: String(raw.phoneNumber),
    foodItem: String(raw.foodItem),
    size: String(raw.size),
    amount: Number(raw.amount),
    createdAt: String(raw.createdAt),
    completed: Boolean(raw.completed)
  }
}

async function authedFetch<T>(path: string): Promise<T> {
  const url = `${BACKEND_BASE_URL}${path}`
  const res = await fetch(url, {
    method: "GET",
    credentials: "include",
    headers: {
      "Content-Type": "application/json"
    }
  })

  if (res.status === 401) throw new Error("unauthorized")
  if (!res.ok) {
    const body = await res.json().catch(() => null)
    throw new Error(body?.error ?? `Request failed: ${res.status}`)
  }

  return (await res.json()) as T
}

export async function listActiveOrders(): Promise<Order[]> {
  const data = await authedFetch<{ items: any[] }>("/v1/orders")
  return data.items.map(toOrderDto)
}

export async function listTransactions(search?: string): Promise<Order[]> {
  const qs = search ? `?search=${encodeURIComponent(search)}` : ""
  const data = await authedFetch<{ items: any[] }>(`/v1/transactions${qs}`)
  return data.items.map(toOrderDto)
}

export async function createOrder(input: {
  customerName: string
  phoneNumber: string
  foodItem: string
  size: string
  amount: number
  // Optional for idempotency in case you want to pass a client id later
  clientOrderId?: string
}): Promise<Order> {
  const url = `${BACKEND_BASE_URL}/v1/orders`
  const res = await fetch(url, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      clientOrderId: input.clientOrderId,
      customerName: input.customerName,
      phoneNumber: input.phoneNumber,
      foodItem: input.foodItem,
      size: input.size,
      amount: input.amount
    })
  })

  if (res.status === 401) throw new Error("unauthorized")
  if (!res.ok) {
    const body = await res.json().catch(() => null)
    throw new Error(body?.error ?? `Request failed: ${res.status}`)
  }

  const raw = await res.json()
  return toOrderDto(raw)
}

export async function completeOrder(orderId: string): Promise<Order> {
  const url = `${BACKEND_BASE_URL}/v1/orders/${encodeURIComponent(orderId)}/complete`
  const res = await fetch(url, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({})
  })

  if (res.status === 401) throw new Error("unauthorized")
  if (!res.ok) {
    const body = await res.json().catch(() => null)
    throw new Error(body?.error ?? `Request failed: ${res.status}`)
  }

  const raw = await res.json()
  return toOrderDto(raw)
}

