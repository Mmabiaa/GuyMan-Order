import { Schema, model, type InferSchemaType, type HydratedDocument } from "mongoose"

export type OrderStatus = "ACTIVE" | "COMPLETED"
export type PaymentStatus = "UNPAID" | "PENDING" | "PAID"

const orderItemSchema = new Schema({
  foodItem: { type: String, required: true },
  size: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, default: 1 }
}, { _id: false })

const extraItemSchema = new Schema({
  name: { type: String, required: true },
  size: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, default: 1 }
}, { _id: false })

const orderSchema = new Schema(
  {
    externalId: { type: String, required: true, unique: true, index: true },
    customerName: { type: String, required: true, trim: true },
    phoneNumber: { type: String, required: true, trim: true },
    foodItem: { type: String, trim: true }, // Kept for backward compatibility
    size: { type: String, trim: true },    // Kept for backward compatibility
    items: [orderItemSchema],
    extras: [extraItemSchema],
    amount: { type: Number, required: true, min: 0 },
    status: { type: String, required: true, enum: ["ACTIVE", "COMPLETED"], index: true },
    paymentStatus: {
      type: String,
      required: true,
      enum: ["UNPAID", "PENDING", "PAID"],
      default: "UNPAID",
      index: true
    },
    completedAt: { type: Date, default: null },
    completedByUserId: { type: String, default: null },
    paidAt: { type: Date, default: null }
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
    foodItem: order.foodItem || (order.items && order.items.length > 0 ? order.items[0].foodItem : ""),
    size: order.size || (order.items && order.items.length > 0 ? order.items[0].size : ""),
    items: order.items || [],
    extras: order.extras || [],
    amount: order.amount,
    createdAt: order.createdAt.toISOString(),
    completed,
    paymentStatus: order.paymentStatus,
    paidAt: order.paidAt ? order.paidAt.toISOString() : null,
    ...(completed
      ? { completedAt: order.completedAt ? order.completedAt.toISOString() : null }
      : { completedAt: undefined })
  }
}

