import { randomUUID } from "crypto"
import mongoose from "mongoose"
import { HttpError } from "../../shared/httpError"
import { OrderModel, orderToDto, type OrderDoc } from "./order.model"

type CreateOrderInput = {
  externalId?: string
  customerName: string
  phoneNumber: string
  foodItem: string
  size: string
  amount: number
}

export async function createOrder(input: CreateOrderInput) {
  const externalId = input.externalId ?? randomUUID()

  const order = await OrderModel.create({
    externalId,
    customerName: input.customerName,
    phoneNumber: input.phoneNumber,
    foodItem: input.foodItem,
    size: input.size,
    amount: input.amount,
    status: "ACTIVE"
  })

  return orderToDto(order)
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

export async function listTransactions(search?: string) {
  const filter: Record<string, unknown> = { status: "COMPLETED" }

  if (search && search.trim()) {
    const q = search.trim()
    // Basic text-ish filtering without requiring full-text index.
    filter["$or"] = [
      { customerName: { $regex: q, $options: "i" } },
      { phoneNumber: { $regex: q, $options: "i" } },
      { foodItem: { $regex: q, $options: "i" } }
    ]
  }

  const orders = await OrderModel.find(filter as any).sort({ createdAt: 1 }).exec()
  return { items: orders.map(orderToDto) }
}

