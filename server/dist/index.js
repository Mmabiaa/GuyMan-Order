"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const env_1 = require("./config/env");
const mongoose_1 = require("./db/mongoose");
const auth_service_1 = require("./modules/auth/auth.service");
async function main() {
    await (0, mongoose_1.connectMongo)();
    await (0, auth_service_1.ensureAdminUser)();
    const app = (0, app_1.createApp)();
    app.listen(env_1.env.port, () => {
        // eslint-disable-next-line no-console
        console.log(`Backend listening on http://localhost:${env_1.env.port}/v1`);
    });
}
main().catch((err) => {
    // eslint-disable-next-line no-console
    console.error(err);
    process.exit(1);
});
