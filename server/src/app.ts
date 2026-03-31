import express from "express"
import cookieParser from "cookie-parser"
import helmet from "helmet"
import cors from "cors"
import morgan from "morgan"
import swaggerUI from "swagger-ui-express"
import { env } from "./config/env"
import { authRouter } from "./modules/auth/auth.routes"
import { ordersRouter } from "./modules/orders/orders.routes"
import { errorMiddleware } from "./shared/errorMiddleware"

export function createApp() {
  const app = express()

  app.use(helmet())
  app.use(express.json({ limit: "1mb" }))
  app.use(cookieParser())
  app.use(morgan("dev"))

  app.use(
    cors({
      origin: env.corsOrigin,
      credentials: true
    })
  )

  const openapiSpec = {
    openapi: "3.0.3",
    info: { title: "GuyMan Backend", version: "0.1.0" },
    servers: [{ url: `http://localhost:${env.port}/v1` }],
    tags: [
      { name: "auth" },
      { name: "orders" },
      { name: "transactions" }
    ],
    components: {
      securitySchemes: {
        authTokenCookie: {
          type: "apiKey",
          in: "cookie",
          name: "auth-token"
        }
      }
    },
    paths: {
      "/healthz": {
        get: {
          tags: ["auth"],
          summary: "Health check",
          responses: { "200": { description: "OK" } }
        }
      },
      "/auth/login": {
        post: {
          tags: ["auth"],
          summary: "Login",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    username: { type: "string" },
                    password: { type: "string" }
                  },
                  required: ["username", "password"]
                }
              }
            }
          },
          responses: { "200": { description: "Logged in (cookie set)" } }
        }
      },
      "/auth/logout": {
        post: {
          tags: ["auth"],
          summary: "Logout",
          responses: { "200": { description: "Logged out (cookie cleared)" } }
        }
      },
      "/auth/me": {
        get: {
          tags: ["auth"],
          summary: "Current user",
          security: [{ authTokenCookie: [] }],
          responses: { "200": { description: "User info" }, "401": { description: "Unauthorized" } }
        }
      },
      "/orders": {
        get: {
          tags: ["orders"],
          summary: "List active orders",
          security: [{ authTokenCookie: [] }],
          responses: { "200": { description: "Active orders" } }
        },
        post: {
          tags: ["orders"],
          summary: "Create order",
          security: [{ authTokenCookie: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    clientOrderId: { type: "string", nullable: true },
                    customerName: { type: "string" },
                    phoneNumber: { type: "string" },
                    foodItem: { type: "string" },
                    size: { type: "string" },
                    amount: { type: "number" }
                  },
                  required: [
                    "customerName",
                    "phoneNumber",
                    "foodItem",
                    "size",
                    "amount"
                  ]
                }
              }
            }
          },
          responses: { "201": { description: "Created order" } }
        }
      },
      "/orders/{id}/complete": {
        post: {
          tags: ["orders"],
          summary: "Complete order",
          security: [{ authTokenCookie: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" }
            }
          ],
          responses: { "200": { description: "Completed order" }, "404": { description: "Not found" } }
        }
      },
      "/transactions": {
        get: {
          tags: ["transactions"],
          summary: "List transactions (completed orders)",
          security: [{ authTokenCookie: [] }],
          parameters: [
            {
              name: "search",
              in: "query",
              required: false,
              schema: { type: "string" }
            }
          ],
          responses: { "200": { description: "Transactions" } }
        }
      }
    }
  }

  app.get("/v1/openapi.json", (_req, res) => res.json(openapiSpec))
  app.use("/v1/docs", swaggerUI.serve, swaggerUI.setup(openapiSpec))

  app.get("/v1/healthz", (_req, res) => res.json({ ok: true }))

  app.use("/v1/auth", authRouter)
  app.use("/v1", ordersRouter)

  app.use(errorMiddleware)

  return app
}

