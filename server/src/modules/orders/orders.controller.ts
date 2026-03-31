import type { Request, Response } from "express"
import { createOrder, completeOrder, listActiveOrders, listTransactions } from "./orders.service"

export async function createOrderController(req: Request, res: Response) {
  const dto = await createOrder({
    externalId: req.body.clientOrderId,
    customerName: req.body.customerName,
    phoneNumber: req.body.phoneNumber,
    foodItem: req.body.foodItem,
    size: req.body.size,
    amount: req.body.amount
  })

  return res.status(201).json(dto)
}

export async function listActiveOrdersController(_req: Request, res: Response) {
  const result = await listActiveOrders()
  return res.json(result)
}

export async function completeOrderController(req: Request, res: Response) {
  if (!req.user) return res.status(401).json({ error: "Unauthorized" })

  const dto = await completeOrder(req.params.id, req.user.id)
  return res.json(dto)
}

export async function listTransactionsController(req: Request, res: Response) {
  const search = typeof req.query.search === "string" ? req.query.search : undefined
  const result = await listTransactions(search)
  return res.json(result)
}

