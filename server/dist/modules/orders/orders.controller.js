"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOrderController = createOrderController;
exports.listActiveOrdersController = listActiveOrdersController;
exports.completeOrderController = completeOrderController;
exports.listTransactionsController = listTransactionsController;
const orders_service_1 = require("./orders.service");
async function createOrderController(req, res) {
    const dto = await (0, orders_service_1.createOrder)({
        externalId: req.body.clientOrderId,
        customerName: req.body.customerName,
        phoneNumber: req.body.phoneNumber,
        foodItem: req.body.foodItem,
        size: req.body.size,
        amount: req.body.amount
    });
    return res.status(201).json(dto);
}
async function listActiveOrdersController(_req, res) {
    const result = await (0, orders_service_1.listActiveOrders)();
    return res.json(result);
}
async function completeOrderController(req, res) {
    if (!req.user)
        return res.status(401).json({ error: "Unauthorized" });
    const dto = await (0, orders_service_1.completeOrder)(req.params.id, req.user.id);
    return res.json(dto);
}
async function listTransactionsController(req, res) {
    const search = typeof req.query.search === "string" ? req.query.search : undefined;
    const result = await (0, orders_service_1.listTransactions)(search);
    return res.json(result);
}
