import type { Request, Response } from "express"
import { env } from "../../config/env"
import { issueJwt, validateLogin } from "./auth.service"
import { UserModel } from "./user.model"

export async function loginController(req: Request, res: Response) {
  const { username, password } = req.body as {
    username?: string
    password?: string
  }

  if (!username || !password) return res.status(400).json({ error: "Missing credentials" })

  const user = await validateLogin(username, password)
  const token = issueJwt(user)

  res.cookie("auth-token", token, {
    httpOnly: true,
    secure: env.nodeEnv === "production",
    sameSite: "lax",
    path: "/"
  })

  return res.json({ ok: true })
}

export function logoutController(_req: Request, res: Response) {
  res.clearCookie("auth-token", {
    httpOnly: true,
    sameSite: "lax",
    path: "/"
  })
  return res.json({ ok: true })
}

export function meController(req: Request, res: Response) {
  if (!req.user) return res.status(401).json({ error: "Unauthorized" })
  return UserModel.findById(req.user.id)
    .select({ username: 1, role: 1 })
    .lean()
    .then((user) => {
      if (!user) return res.status(401).json({ error: "Unauthorized" })
      return res.json({ id: req.user!.id, username: user.username, role: user.role })
    })
}

