/**
 * Vercel serverless entry: must default-export a function (or an Express app).
 * Do not use `app.ts` as the deployment entry — it only exports `createApp()`.
 *
 * Vercel runs this as a serverless function per request (not a long-lived TCP server).
 * For a traditional always-on Node server, use Railway, Render, Fly.io, etc.
 */
import type { Request, Response } from "express"
import { createApp } from "./app"
import { connectMongo } from "./db/mongoose"
import { ensureAdminUser } from "./modules/auth/auth.service"

let app: ReturnType<typeof createApp> | undefined
let dbReady = false

async function ensureDb() {
  if (dbReady) return
  await connectMongo()
  await ensureAdminUser()
  dbReady = true
}

/** Paths that must respond without MongoDB (ops, Swagger static, OpenAPI JSON). */
function skipsDatabase(pathname: string): boolean {
  if (pathname === "/health" || pathname === "/healthz") return true
  if (pathname === "/v1/healthz" || pathname === "/v1/openapi.json") return true
  if (pathname.startsWith("/v1/docs")) return true
  return false
}

function pathnameOf(req: Request): string {
  if (req.path) return req.path
  const u = req.url ?? "/"
  return u.split("?")[0] || "/"
}

export default async function handler(req: Request, res: Response) {
  if (!app) {
    app = createApp()
  }

  const path = pathnameOf(req)
  if (!skipsDatabase(path)) {
    try {
      await ensureDb()
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err)
      res.status(503).json({
        error:
          "Database unavailable. Set MONGODB_URI in Vercel env and allow Atlas access (Network Access → 0.0.0.0/0 or Vercel-friendly rules)."
      })
      return
    }
  }

  return app(req, res)
}
