"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = handler;
const app_1 = require("./app");
const mongoose_1 = require("./db/mongoose");
const auth_service_1 = require("./modules/auth/auth.service");
let app;
async function handler(req, res) {
    if (!app) {
        await (0, mongoose_1.connectMongo)();
        await (0, auth_service_1.ensureAdminUser)();
        app = (0, app_1.createApp)();
    }
    return app(req, res);
}
