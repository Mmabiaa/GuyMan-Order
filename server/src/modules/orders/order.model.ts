import { Schema, model, type InferSchemaType, type HydratedDocument } from "mongoose"

export type OrderStatus = "ACTIVE" | "COMPLETED"

const orderSchema = new Schema(
  {
    externalId: { type: String, required: true, unique: true, index: true },
    customerName: { type: String, required: true, trim: true },
    phoneNumber: { type: String, required: true, trim: true },
    foodItem: { type: String, required: true, trim: true },
    size: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0 },
    status: { type: String, required: true, enum: ["ACTIVE", "COMPLETED"], index: true },
    completedAt: { type: Date, default: null },
    completedByUserId: { type: String, default: null }
  },
  { timestamps: { createdAt: "createdAt", updatedAt: false } }
)

export type Order = InferSchemaType<typeof orderSchema>
export type OrderDoc = HydratedDocument<Order>

export const OrderModel = model<Order>("Order", orderSchema)

export function orderToDto(order: OrderDoc) {
  const completed = order.status === "COMPLETED"
  return {
    id: order.externalId,
    customerName: order.customerName,
    phoneNumber: order.phoneNumber,
    foodItem: order.foodItem,
    size: order.size,
    amount: order.amount,
    createdAt: order.createdAt.toISOString(),
    completed,
    ...(completed
      ? { completedAt: order.completedAt ? order.completedAt.toISOString() : null }
      : { completedAt: undefined })
  }
}

