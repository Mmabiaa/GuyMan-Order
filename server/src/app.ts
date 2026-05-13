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

  // No /v1 prefix — useful for load balancers and mistaken /healthz vs /v1/healthz
  app.get("/health", (_req, res) =>
    res.json({ ok: true, service: "guy-man-backend" })
  )
  app.get("/healthz", (_req, res) =>
    res.json({ ok: true, service: "guy-man-backend" })
  )

  app.use(helmet())
  app.use(express.json({ limit: "1mb" }))
  app.use(cookieParser())

  // Analytical Logger for Debugging
  app.use((req, _res, next) => {
    const timestamp = new Date().toISOString()
    const method = req.method
    const url = req.url
    if (method !== "GET" && req.body && Object.keys(req.body).length > 0) {
      // eslint-disable-next-line no-console
      console.log(`[${timestamp}] ${method} ${url} - Body:`, JSON.stringify(req.body))
    } else {
      // eslint-disable-next-line no-console
      console.log(`[${timestamp}] ${method} ${url}`)
    }
    next()
  })

  app.use(morgan("dev"))

  // Documentation Redirects
  app.get("/", (_req, res) => res.redirect("/v1/docs"))
  app.get("/docs", (_req, res) => res.redirect("/v1/docs"))
  app.get("/api/docs", (_req, res) => res.redirect("/v1/docs"))
  app.get("/v1/api/docs", (_req, res) => res.redirect("/v1/docs"))

  app.use(
    cors({
      origin: env.corsOrigin,
      credentials: true
    })
  )

  const openapiSpec = {
    openapi: "3.0.3",
    info: { title: "GuyMan API", version: "2.2.0", description: "API documentation for the Guy Man Order Management System" },
    servers: [{ url: `/v1`, description: "Main API v1" }],
    tags: [
      { name: "Auth", description: "Authentication endpoints" },
      { name: "Orders", description: "Active order management" },
      { name: "Transactions", description: "Historical transaction logs" }
    ],
    components: {
      securitySchemes: {
        authTokenCookie: {
          type: "apiKey",
          in: "cookie",
          name: "auth-token"
        }
      },
      schemas: {
        OrderItem: {
          type: "object",
          properties: {
            foodItem: { type: "string" },
            size: { type: "string" },
            price: { type: "number" },
            quantity: { type: "number" }
          },
          required: ["foodItem", "size", "price", "quantity"]
        },
        ExtraItem: {
          type: "object",
          properties: {
            name: { type: "string" },
            size: { type: "string" },
            price: { type: "number" },
            quantity: { type: "number" }
          },
          required: ["name", "size", "price", "quantity"]
        }
      }
    },
    paths: {
      "/healthz": {
        get: {
          tags: ["Auth"],
          summary: "Health check",
          responses: { "200": { description: "OK" } }
        }
      },
      "/auth/login": {
        post: {
          tags: ["Auth"],
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
          tags: ["Auth"],
          summary: "Logout",
          responses: { "200": { description: "Logged out (cookie cleared)" } }
        }
      },
      "/auth/me": {
        get: {
          tags: ["Auth"],
          summary: "Current user session info",
          security: [{ authTokenCookie: [] }],
          responses: { "200": { description: "User info" }, "401": { description: "Unauthorized" } }
        }
      },
      "/orders": {
        get: {
          tags: ["Orders"],
          summary: "List active orders",
          security: [{ authTokenCookie: [] }],
          responses: { "200": { description: "Active orders list" } }
        },
        post: {
          tags: ["Orders"],
          summary: "Create a new order",
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
                    items: { type: "array", items: { $ref: "#/components/schemas/OrderItem" } },
                    extras: { type: "array", items: { $ref: "#/components/schemas/ExtraItem" } },
                    amount: { type: "number" }
                  },
                  required: ["customerName", "phoneNumber", "amount"]
                }
              }
            }
          },
          responses: { "201": { description: "Order created successfully" } }
        }
      },
      "/orders/{id}": {
        put: {
          tags: ["Orders"],
          summary: "Update an active order",
          security: [{ authTokenCookie: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    customerName: { type: "string" },
                    phoneNumber: { type: "string" },
                    items: { type: "array", items: { $ref: "#/components/schemas/OrderItem" } },
                    extras: { type: "array", items: { $ref: "#/components/schemas/ExtraItem" } },
                    amount: { type: "number" }
                  }
                }
              }
            }
          },
          responses: { "200": { description: "Order updated" }, "404": { description: "Not found or not active" } }
        },
        delete: {
          tags: ["Orders"],
          summary: "Delete an active order",
          security: [{ authTokenCookie: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: { "200": { description: "Order deleted" }, "404": { description: "Not found or not active" } }
        }
      },
      "/orders/{id}/complete": {
        post: {
          tags: ["Orders"],
          summary: "Mark order as completed/fulfilled",
          security: [{ authTokenCookie: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: { "200": { description: "Order fulfilled" }, "404": { description: "Order not found" } }
        }
      },
      "/orders/{id}/update-payment-status": {
        post: {
          tags: ["Orders"],
          summary: "Update payment status (PAID, UNPAID, PENDING)",
          security: [{ authTokenCookie: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          requestBody: {
            required: true,
            content: { "application/json": { schema: { type: "object", properties: { status: { type: "string", enum: ["PAID", "UNPAID", "PENDING"] } } } } }
          },
          responses: { "200": { description: "Payment status updated" } }
        }
      },
      "/transactions": {
        get: {
          tags: ["Transactions"],
          summary: "List historical transactions (completed orders)",
          security: [{ authTokenCookie: [] }],
          parameters: [
            { name: "excludeRecent", in: "query", required: false, schema: { type: "boolean" }, description: "Exclude transactions from last 24h" }
          ],
          responses: { "200": { description: "Transactions list" } }
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

