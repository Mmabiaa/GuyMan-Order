import { Router } from "express"
import { z } from "zod"
import { asyncHandler } from "../../shared/asyncHandler"
import { HttpError } from "../../shared/httpError"
import { requireAuth } from "../auth/auth.middleware"
import {
  completeOrderController,
  updateOrderController,
  deleteOrderController,
  updatePaymentStatusController,
  createOrderController,
  listActiveOrdersController,
  listTransactionsController
} from "./orders.controller"

const createOrderSchema = z.object({
  clientOrderId: z.string().min(1).optional(),
  customerName: z.string().min(1),
  phoneNumber: z.string().min(1),
  items: z.array(z.object({
    foodItem: z.string().min(1),
    size: z.string().min(1),
    price: z.number().min(0),
    quantity: z.number().int().min(1)
  })).optional(),
  extras: z.array(z.object({
    name: z.string().min(1),
    size: z.string().min(1),
    price: z.number().min(0),
    quantity: z.number().int().min(1)
  })).optional(),
  amount: z.number().finite().min(0)
})

export const ordersRouter = Router()

ordersRouter.get("/orders", requireAuth, asyncHandler(listActiveOrdersController))

ordersRouter.post(
  "/orders",
  requireAuth,
  asyncHandler(async (req, res) => {
    const parsed = createOrderSchema.safeParse(req.body)
    if (!parsed.success) throw new HttpError(400, "Invalid payload")
    req.body = parsed.data
    return createOrderController(req, res)
  })
)

ordersRouter.post(
  "/orders/:id/complete",
  requireAuth,
  asyncHandler(completeOrderController)
)

ordersRouter.post(
  "/orders/:id/update-payment-status",
  requireAuth,
  asyncHandler(updatePaymentStatusController)
)

ordersRouter.put(
  "/orders/:id",
  requireAuth,
  asyncHandler(updateOrderController)
)

ordersRouter.delete(
  "/orders/:id",
  requireAuth,
  asyncHandler(deleteOrderController)
)

ordersRouter.get(
  "/orders",
  requireAuth,
  asyncHandler(listActiveOrdersController)
)

ordersRouter.get(
  "/transactions",
  requireAuth,
  asyncHandler(listTransactionsController)
)

