"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = requireAuth;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../../config/env");
const httpError_1 = require("../../shared/httpError");
function requireAuth(req, _res, next) {
    const token = req.cookies?.["auth-token"];
    if (!token)
        throw new httpError_1.HttpError(401, "Unauthorized");
    try {
        const decoded = jsonwebtoken_1.default.verify(token, env_1.env.jwtSecret);
        if (!decoded?.sub)
            throw new Error("Missing sub");
        req.user = {
            id: String(decoded.sub),
            role: String(decoded.role ?? "admin")
        };
        return next();
    }
    catch {
        throw new httpError_1.HttpError(401, "Unauthorized");
    }
}
