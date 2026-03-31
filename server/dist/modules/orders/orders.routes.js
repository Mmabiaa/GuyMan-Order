"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ordersRouter = void 0;
const express_1 = require("express");
const zod_1 = require("zod");
const asyncHandler_1 = require("../../shared/asyncHandler");
const httpError_1 = require("../../shared/httpError");
const auth_middleware_1 = require("../auth/auth.middleware");
const orders_controller_1 = require("./orders.controller");
const createOrderSchema = zod_1.z.object({
    clientOrderId: zod_1.z.string().min(1).optional(),
    customerName: zod_1.z.string().min(1),
    phoneNumber: zod_1.z.string().min(1),
    foodItem: zod_1.z.string().min(1),
    size: zod_1.z.string().min(1),
    amount: zod_1.z.number().finite().min(0)
});
exports.ordersRouter = (0, express_1.Router)();
exports.ordersRouter.get("/orders", auth_middleware_1.requireAuth, (0, asyncHandler_1.asyncHandler)(orders_controller_1.listActiveOrdersController));
exports.ordersRouter.post("/orders", auth_middleware_1.requireAuth, (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const parsed = createOrderSchema.safeParse(req.body);
    if (!parsed.success)
        throw new httpError_1.HttpError(400, "Invalid payload");
    req.body = parsed.data;
    return (0, orders_controller_1.createOrderController)(req, res);
}));
exports.ordersRouter.post("/orders/:id/complete", auth_middleware_1.requireAuth, (0, asyncHandler_1.asyncHandler)(orders_controller_1.completeOrderController));
exports.ordersRouter.get("/transactions", auth_middleware_1.requireAuth, (0, asyncHandler_1.asyncHandler)(orders_controller_1.listTransactionsController));
