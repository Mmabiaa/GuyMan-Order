import type { Request, Response } from "express"
import { createOrder, completeOrder, updatePaymentStatus, listActiveOrders, listTransactions } from "./orders.service"

export async function createOrderController(req: Request, res: Response) {
  const dto = await createOrder({
    externalId: req.body.clientOrderId,
    customerName: req.body.customerName,
    phoneNumber: req.body.phoneNumber,
    items: req.body.items,
    extras: req.body.extras,
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

export async function updatePaymentStatusController(req: Request, res: Response) {
  if (!req.user) return res.status(401).json({ error: "Unauthorized" })

  const { status } = req.body
  if (!status) return res.status(400).json({ error: "Status is required" })

  const dto = await updatePaymentStatus(req.params.id, status)
  return res.json(dto)
}

export async function listTransactionsController(req: Request, res: Response) {
  const search = typeof req.query.search === "string" ? req.query.search : undefined
  const paymentStatus = typeof req.query.paymentStatus === "string" ? req.query.paymentStatus : undefined
  const sort = (req.query.sort === "recent" || req.query.sort === "oldest") ? req.query.sort : undefined
  const excludeRecent = req.query.excludeRecent === "true"

  let startDate: Date | undefined
  let endDate: Date | undefined

  if (typeof req.query.startDate === "string") {
    startDate = new Date(req.query.startDate)
  }
  if (typeof req.query.endDate === "string") {
    endDate = new Date(req.query.endDate)
  }

  const result = await listTransactions({
    search,
    paymentStatus,
    startDate,
    endDate,
    sort,
    excludeRecent
  })
  return res.json(result)
}
