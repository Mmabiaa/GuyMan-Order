/**
 * Vercel serverless entry: must default-export a function (or an Express app).
 * Do not use `app.ts` as the deployment entry — it only exports `createApp()`.
 */
import type { Request, Response } from "express"
import { createApp } from "./app"
import { connectMongo } from "./db/mongoose"
import { ensureAdminUser } from "./modules/auth/auth.service"

let app: ReturnType<typeof createApp> | undefined

export default async function handler(req: Request, res: Response) {
  if (!app) {
    await connectMongo()
    await ensureAdminUser()
    app = createApp()
  }
  return app(req, res)
}
