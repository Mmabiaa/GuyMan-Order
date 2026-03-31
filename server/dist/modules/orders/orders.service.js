"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOrder = createOrder;
exports.listActiveOrders = listActiveOrders;
exports.completeOrder = completeOrder;
exports.listTransactions = listTransactions;
const crypto_1 = require("crypto");
const mongoose_1 = __importDefault(require("mongoose"));
const httpError_1 = require("../../shared/httpError");
const order_model_1 = require("./order.model");
async function createOrder(input) {
    const externalId = input.externalId ?? (0, crypto_1.randomUUID)();
    const order = await order_model_1.OrderModel.create({
        externalId,
        customerName: input.customerName,
        phoneNumber: input.phoneNumber,
        foodItem: input.foodItem,
        size: input.size,
        amount: input.amount,
        status: "ACTIVE"
    });
    return (0, order_model_1.orderToDto)(order);
}
async function listActiveOrders() {
    const orders = await order_model_1.OrderModel.find({ status: "ACTIVE" })
        .sort({ createdAt: 1 })
        .exec();
    return { items: orders.map(order_model_1.orderToDto) };
}
async function completeOrder(orderId, completedByUserId) {
    // Prefer externalId since that is what the frontend uses.
    let updated = await order_model_1.OrderModel.findOneAndUpdate({ externalId: orderId, status: "ACTIVE" }, {
        $set: {
            status: "COMPLETED",
            completedAt: new Date(),
            completedByUserId
        }
    }, { new: true }).exec();
    // Fallback: allow Mongo _id if a client passes it.
    if (!updated && mongoose_1.default.isValidObjectId(orderId)) {
        updated = await order_model_1.OrderModel.findOneAndUpdate({ _id: orderId, status: "ACTIVE" }, {
            $set: {
                status: "COMPLETED",
                completedAt: new Date(),
                completedByUserId
            }
        }, { new: true }).exec();
    }
    if (!updated)
        throw new httpError_1.HttpError(404, "Order not found or already completed");
    return (0, order_model_1.orderToDto)(updated);
}
async function listTransactions(search) {
    const filter = { status: "COMPLETED" };
    if (search && search.trim()) {
        const q = search.trim();
        // Basic text-ish filtering without requiring full-text index.
        filter["$or"] = [
            { customerName: { $regex: q, $options: "i" } },
            { phoneNumber: { $regex: q, $options: "i" } },
            { foodItem: { $regex: q, $options: "i" } }
        ];
    }
    const orders = await order_model_1.OrderModel.find(filter).sort({ createdAt: 1 }).exec();
    return { items: orders.map(order_model_1.orderToDto) };
}
