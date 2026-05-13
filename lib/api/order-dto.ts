import type { Order } from "@/lib/store"

/** Maps API JSON to the UI `Order` shape (no business rules). */
export function mapOrderDto(raw: Record<string, any>): Order {
  return {
    id: String(raw.id),
    customerName: String(raw.customerName),
    phoneNumber: String(raw.phoneNumber),
    foodItem: String(raw.foodItem),
    size: String(raw.size),
    items: raw.items || [],
    extras: raw.extras || [],
    amount: Number(raw.amount),
    createdAt: String(raw.createdAt),
    completed: Boolean(raw.completed),
    paymentStatus: raw.paymentStatus || "UNPAID",
    paidAt: raw.paidAt ? String(raw.paidAt) : null
  }
}
