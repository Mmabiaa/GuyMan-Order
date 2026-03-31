"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = void 0;
const mongoose_1 = require("mongoose");
const userSchema = new mongoose_1.Schema({
    username: { type: String, required: true, unique: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, required: true, default: "admin" }
}, { timestamps: { createdAt: "createdAt", updatedAt: false } });
exports.UserModel = (0, mongoose_1.model)("User", userSchema);
