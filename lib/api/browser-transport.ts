"use client"

/**
 * Thin browser transport: same-origin calls to `/api/proxy` only.
 * Validation, auth, and persistence are implemented by the backend API.
 */
import type { Order } from "@/lib/store"
import { mapOrderDto } from "@/lib/api/order-dto"

const PROXY = "/api/proxy"

async function parseError(res: Response): Promise<string> {
  const body = await res.json().catch(() => null)
  return (body?.error as string) ?? `Request failed: ${res.status}`
}

export async function postOrder(input: {
  customerName: string
  phoneNumber: string
  foodItem: string
  size: string
  amount: number
  clientOrderId?: string
}): Promise<Order> {
  const res = await fetch(`${PROXY}/v1/orders`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
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
  if (!res.ok) throw new Error(await parseError(res))
  const raw = (await res.json()) as Record<string, unknown>
  return mapOrderDto(raw)
}

export async function postCompleteOrder(orderId: string): Promise<Order> {
  const res = await fetch(
    `${PROXY}/v1/orders/${encodeURIComponent(orderId)}/complete`,
    {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({})
    }
  )
  if (res.status === 401) throw new Error("unauthorized")
  if (!res.ok) throw new Error(await parseError(res))
  const raw = (await res.json()) as Record<string, unknown>
  return mapOrderDto(raw)
}

export async function postLogout(): Promise<void> {
  await fetch(`${PROXY}/v1/auth/logout`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({})
  })
}
