"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
const express_1 = require("express");
const zod_1 = require("zod");
const asyncHandler_1 = require("../../shared/asyncHandler");
const httpError_1 = require("../../shared/httpError");
const auth_middleware_1 = require("./auth.middleware");
const auth_controller_1 = require("./auth.controller");
const loginSchema = zod_1.z.object({
    username: zod_1.z.string().min(1),
    password: zod_1.z.string().min(1)
});
exports.authRouter = (0, express_1.Router)();
exports.authRouter.get("/me", auth_middleware_1.requireAuth, auth_controller_1.meController);
exports.authRouter.post("/login", (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success)
        throw new httpError_1.HttpError(400, "Invalid payload");
    req.body = parsed.data;
    return (0, auth_controller_1.loginController)(req, res);
}));
exports.authRouter.post("/logout", auth_controller_1.logoutController);
