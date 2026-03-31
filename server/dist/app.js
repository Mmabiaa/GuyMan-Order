"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = createApp;
const express_1 = __importDefault(require("express"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const helmet_1 = __importDefault(require("helmet"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const env_1 = require("./config/env");
const auth_routes_1 = require("./modules/auth/auth.routes");
const orders_routes_1 = require("./modules/orders/orders.routes");
const errorMiddleware_1 = require("./shared/errorMiddleware");
function createApp() {
    const app = (0, express_1.default)();
    app.use((0, helmet_1.default)());
    app.use(express_1.default.json({ limit: "1mb" }));
    app.use((0, cookie_parser_1.default)());
    app.use((0, morgan_1.default)("dev"));
    app.use((0, cors_1.default)({
        origin: env_1.env.corsOrigin,
        credentials: true
    }));
    app.get("/v1/docs", (_req, res) => {
        res.json({
            ok: true,
            service: "guy-man-backend",
            version: "0.1.0",
            endpoints: [
                { method: "GET", path: "/v1/healthz", auth: "none" },
                { method: "POST", path: "/v1/auth/login", auth: "none" },
                { method: "POST", path: "/v1/auth/logout", auth: "cookie (auth-token)" },
                { method: "GET", path: "/v1/auth/me", auth: "cookie (auth-token)" },
                { method: "GET", path: "/v1/orders", auth: "cookie (auth-token)" },
                { method: "POST", path: "/v1/orders", auth: "cookie (auth-token)" },
                {
                    method: "POST",
                    path: "/v1/orders/:id/complete",
                    auth: "cookie (auth-token)"
                },
                { method: "GET", path: "/v1/transactions", auth: "cookie (auth-token)" }
            ]
        });
    });
    app.get("/v1/healthz", (_req, res) => res.json({ ok: true }));
    app.use("/v1/auth", auth_routes_1.authRouter);
    app.use("/v1", orders_routes_1.ordersRouter);
    app.use(errorMiddleware_1.errorMiddleware);
    return app;
}
