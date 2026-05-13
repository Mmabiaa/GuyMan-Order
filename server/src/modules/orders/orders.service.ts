import { randomUUID } from "crypto"
import mongoose from "mongoose"
import { HttpError } from "../../shared/httpError"
import { OrderModel, orderToDto, type OrderDoc } from "./order.model"

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

export async function confirmPayment(orderId: string) {
  let updated = await OrderModel.findOneAndUpdate(
    { externalId: orderId },
    {
      $set: {
        paymentStatus: "PAID",
        paidAt: new Date()
      }
    },
    { new: true }
  ).exec()

  if (!updated && mongoose.isValidObjectId(orderId)) {
    updated = await OrderModel.findOneAndUpdate(
      { _id: orderId },
      {
        $set: {
          paymentStatus: "PAID",
          paidAt: new Date()
        }
      },
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

  if (options.startDate || options.endDate) {
    filter.createdAt = {}
    if (options.startDate) filter.createdAt.$gte = options.startDate
    if (options.endDate) filter.createdAt.$lte = options.endDate
  }

  const sortOrder = options.sort === "oldest" ? 1 : -1
  const orders = await OrderModel.find(filter).sort({ createdAt: sortOrder }).exec()
  return { items: orders.map(orderToDto) }
}

