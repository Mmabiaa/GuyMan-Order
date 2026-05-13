import { randomUUID } from "crypto"
import mongoose from "mongoose"
import { HttpError } from "../../shared/httpError"
import { OrderModel, orderToDto, PaymentStatus, type OrderDoc } from "./order.model"

type CreateOrderInput = {
  externalId?: string
  customerName: string
  phoneNumber: string
  items?: { foodItem: string; size: string; price: number; quantity: number }[]
  extras?: { name: string; size: string; price: number; quantity: number }[]
  amount: number
}

export async function createOrder(input: CreateOrderInput) {
  const externalId = input.externalId ?? randomUUID()

  const order = await OrderModel.create({
    externalId,
    customerName: input.customerName,
    phoneNumber: input.phoneNumber,
    items: input.items,
    extras: input.extras,
    amount: input.amount,
    status: "ACTIVE",
    paymentStatus: "UNPAID"
  })

  return orderToDto(order)
}

export async function updatePaymentStatus(orderId: string, status: PaymentStatus) {
  const update: any = { paymentStatus: status }
  if (status === "PAID") {
    update.paidAt = new Date()
  } else {
    update.paidAt = null
  }

  let updated = await OrderModel.findOneAndUpdate(
    { externalId: orderId },
    { $set: update },
    { new: true }
  ).exec()

  if (!updated && mongoose.isValidObjectId(orderId)) {
    updated = await OrderModel.findOneAndUpdate(
      { _id: orderId },
      { $set: update },
      { new: true }
    ).exec()
  }

  if (!updated) throw new HttpError(404, "Order not found")
  return orderToDto(updated)
}

export async function listActiveOrders() {
  const orders = await OrderModel.find({ status: "ACTIVE" })
    .sort({ createdAt: 1 })
    .exec()

  return { items: orders.map(orderToDto) }
}

export async function deleteOrder(orderId: string) {
  let deleted = await OrderModel.findOneAndDelete({ externalId: orderId, status: "ACTIVE" }).exec()
  if (!deleted && mongoose.isValidObjectId(orderId)) {
    deleted = await OrderModel.findOneAndDelete({ _id: orderId, status: "ACTIVE" }).exec()
  }
  if (!deleted) throw new HttpError(404, "Order not found or not in ACTIVE status")
  return { success: true }
}

export async function updateOrder(orderId: string, updates: Partial<CreateOrderInput>) {
  // We only allow updating ACTIVE orders
  let updated = await OrderModel.findOneAndUpdate(
    { externalId: orderId, status: "ACTIVE" },
    { $set: updates },
    { new: true }
  ).exec()

  if (!updated && mongoose.isValidObjectId(orderId)) {
    updated = await OrderModel.findOneAndUpdate(
      { _id: orderId, status: "ACTIVE" },
      { $set: updates },
      { new: true }
    ).exec()
  }

  if (!updated) throw new HttpError(404, "Order not found or not in ACTIVE status")
  return orderToDto(updated)
}

export async function completeOrder(orderId: string, completedByUserId: string) {
  // Prefer externalId since that is what the frontend uses.
  let updated = await OrderModel.findOneAndUpdate(
    { externalId: orderId, status: "ACTIVE" },
    {
      $set: {
        status: "COMPLETED",
        completedAt: new Date(),
        completedByUserId
      }
    },
    { new: true }
  ).exec()

  // Fallback: allow Mongo _id if a client passes it.
  if (!updated && mongoose.isValidObjectId(orderId)) {
    updated = await OrderModel.findOneAndUpdate(
      { _id: orderId, status: "ACTIVE" },
      {
        $set: {
          status: "COMPLETED",
          completedAt: new Date(),
          completedByUserId
        }
      },
      { new: true }
    ).exec()
  }

  if (!updated) throw new HttpError(404, "Order not found or already completed")
  return orderToDto(updated)
}

export async function listTransactions(options: {
  search?: string
  status?: string
  paymentStatus?: string
  startDate?: Date
  endDate?: Date
  sort?: "recent" | "oldest"
  excludeRecent?: boolean // Add this to support the 24h rule
} = {}) {
  const filter: Record<string, any> = { status: "COMPLETED" }

  if (options.search && options.search.trim()) {
    const q = options.search.trim()
    filter["$or"] = [
      { customerName: { $regex: q, $options: "i" } },
      { phoneNumber: { $regex: q, $options: "i" } },
      { "items.foodItem": { $regex: q, $options: "i" } }
    ]
  }

  if (options.paymentStatus) {
    filter.paymentStatus = options.paymentStatus
  }

  if (options.startDate || options.endDate || options.excludeRecent) {
    filter.createdAt = {}
    if (options.startDate) filter.createdAt.$gte = options.startDate
    if (options.endDate) filter.createdAt.$lte = options.endDate
    if (options.excludeRecent) {
      // Exclude everything from the last 24 hours
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
      filter.createdAt.$lt = twentyFourHoursAgo
    }
    if (Object.keys(filter.createdAt).length === 0) delete filter.createdAt
  }

  const sortOrder = options.sort === "oldest" ? 1 : -1
  const orders = await OrderModel.find(filter).sort({ createdAt: sortOrder }).exec()
  return { items: orders.map(orderToDto) }
}

