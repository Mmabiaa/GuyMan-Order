"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorMiddleware = errorMiddleware;
const httpError_1 = require("./httpError");
function errorMiddleware(err, _req, res, _next) {
    if (err instanceof httpError_1.HttpError) {
        return res.status(err.statusCode).json({ error: err.message });
    }
    // Avoid leaking internals in production.
    const message = process.env.NODE_ENV === "production"
        ? "Internal server error"
        : err instanceof Error
            ? err.message
            : "Internal server error";
    // eslint-disable-next-line no-console
    console.error(err);
    return res.status(500).json({ error: message });
}
