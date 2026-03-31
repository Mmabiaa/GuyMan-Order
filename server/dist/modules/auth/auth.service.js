"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureAdminUser = ensureAdminUser;
exports.validateLogin = validateLogin;
exports.issueJwt = issueJwt;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../../config/env");
const httpError_1 = require("../../shared/httpError");
const user_model_1 = require("./user.model");
async function findByUsername(username) {
    return user_model_1.UserModel.findOne({ username }).exec();
}
async function ensureAdminUser() {
    const existing = await findByUsername(env_1.env.adminUsername);
    if (existing)
        return;
    const passwordHash = await bcryptjs_1.default.hash(env_1.env.adminPassword, 12);
    await user_model_1.UserModel.create({
        username: env_1.env.adminUsername,
        passwordHash,
        role: "admin"
    });
}
async function validateLogin(username, password) {
    const user = await findByUsername(username);
    if (!user)
        throw new httpError_1.HttpError(401, "Invalid username or password");
    const ok = await bcryptjs_1.default.compare(password, user.passwordHash);
    if (!ok)
        throw new httpError_1.HttpError(401, "Invalid username or password");
    return user;
}
function issueJwt(user) {
    const payload = {
        sub: user._id.toString(),
        role: user.role
    };
    // jsonwebtoken's TS types are a bit strict about `secret` and `expiresIn`.
    return jsonwebtoken_1.default.sign(payload, env_1.env.jwtSecret, {
        expiresIn: env_1.env.jwtExpiresIn
    });
}
