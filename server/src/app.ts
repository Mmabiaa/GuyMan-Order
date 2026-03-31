import express from "express"
import cookieParser from "cookie-parser"
import helmet from "helmet"
import cors from "cors"
import morgan from "morgan"
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

  app.get("/v1/docs", (_req, res) => {
    res.json({
      ok: true,
      service: "guy-man-backend",
      version: "0.1.0",
      endpoints: [
        { method: "GET", path: "/v1/healthz", auth: "none" },
        { method: "POST", path: "/v1/auth/login", auth: "none" },
        { method: "POST", path: "/v1/auth/logout", auth: "cookie (auth-token)" },
        { method: "GET", path: "/v1/auth/me", auth: "cookie (auth-token)" },
        { method: "GET", path: "/v1/orders", auth: "cookie (auth-token)" },
        { method: "POST", path: "/v1/orders", auth: "cookie (auth-token)" },
        {
          method: "POST",
          path: "/v1/orders/:id/complete",
          auth: "cookie (auth-token)"
        },
        { method: "GET", path: "/v1/transactions", auth: "cookie (auth-token)" }
      ]
    })
  })

  app.get("/v1/healthz", (_req, res) => res.json({ ok: true }))

  app.use("/v1/auth", authRouter)
  app.use("/v1", ordersRouter)

  app.use(errorMiddleware)

  return app
}

