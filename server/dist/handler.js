"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = handler;
const app_1 = require("./app");
const mongoose_1 = require("./db/mongoose");
const auth_service_1 = require("./modules/auth/auth.service");
let app;
let dbReady = false;
async function ensureDb() {
    if (dbReady)
        return;
    await (0, mongoose_1.connectMongo)();
    await (0, auth_service_1.ensureAdminUser)();
    dbReady = true;
}
/** Paths that must respond without MongoDB (ops, Swagger static, OpenAPI JSON). */
function skipsDatabase(pathname) {
    if (pathname === "/health" || pathname === "/healthz")
        return true;
    if (pathname === "/v1/healthz" || pathname === "/v1/openapi.json")
        return true;
    if (pathname.startsWith("/v1/docs"))
        return true;
    return false;
}
function pathnameOf(req) {
    if (req.path)
        return req.path;
    const u = req.url ?? "/";
    return u.split("?")[0] || "/";
}
async function handler(req, res) {
    if (!app) {
        app = (0, app_1.createApp)();
    }
    const path = pathnameOf(req);
    if (!skipsDatabase(path)) {
        try {
            await ensureDb();
        }
        catch (err) {
            // eslint-disable-next-line no-console
            console.error(err);
            res.status(503).json({
                error: "Database unavailable. Set MONGODB_URI in Vercel env and allow Atlas access (Network Access → 0.0.0.0/0 or Vercel-friendly rules)."
            });
            return;
        }
    }
    return app(req, res);
}
