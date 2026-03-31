import { Router } from "express"
import { z } from "zod"
import { asyncHandler } from "../../shared/asyncHandler"
import { HttpError } from "../../shared/httpError"
import { requireAuth } from "../auth/auth.middleware"
import {
  completeOrderController,
  createOrderController,
  listActiveOrdersController,
  listTransactionsController
} from "./orders.controller"

const createOrderSchema = z.object({
  clientOrderId: z.string().min(1).optional(),
  customerName: z.string().min(1),
  phoneNumber: z.string().min(1),
  foodItem: z.string().min(1),
  size: z.string().min(1),
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

ordersRouter.get(
  "/transactions",
  requireAuth,
  asyncHandler(listTransactionsController)
)

