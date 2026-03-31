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

  app.get("/v1/healthz", (_req, res) => res.json({ ok: true }))

  app.use("/v1/auth", authRouter)
  app.use("/v1", ordersRouter)

  app.use(errorMiddleware)

  return app
}

