"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginController = loginController;
exports.logoutController = logoutController;
exports.meController = meController;
const env_1 = require("../../config/env");
const auth_service_1 = require("./auth.service");
const user_model_1 = require("./user.model");
async function loginController(req, res) {
    const { username, password } = req.body;
    if (!username || !password)
        return res.status(400).json({ error: "Missing credentials" });
    const user = await (0, auth_service_1.validateLogin)(username, password);
    const token = (0, auth_service_1.issueJwt)(user);
    res.cookie("auth-token", token, {
        httpOnly: true,
        secure: env_1.env.nodeEnv === "production",
        sameSite: "lax",
        path: "/"
    });
    return res.json({ ok: true });
}
function logoutController(_req, res) {
    res.clearCookie("auth-token", {
        httpOnly: true,
        sameSite: "lax",
        path: "/"
    });
    return res.json({ ok: true });
}
function meController(req, res) {
    if (!req.user)
        return res.status(401).json({ error: "Unauthorized" });
    return user_model_1.UserModel.findById(req.user.id)
        .select({ username: 1, role: 1 })
        .lean()
        .then((user) => {
        if (!user)
            return res.status(401).json({ error: "Unauthorized" });
        return res.json({ id: req.user.id, username: user.username, role: user.role });
    });
}
