import type { NextFunction, Request, Response } from "express"
import jwt from "jsonwebtoken"
import { env } from "../../config/env"
import { HttpError } from "../../shared/httpError"

export type AuthUser = {
  id: string
  role: string
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser
    }
  }
}

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const token = req.cookies?.["auth-token"]
  if (!token) throw new HttpError(401, "Unauthorized")

  try {
    const decoded = jwt.verify(token, env.jwtSecret) as jwt.JwtPayload
    if (!decoded?.sub) throw new Error("Missing sub")

    req.user = {
      id: String(decoded.sub),
      role: String(decoded.role ?? "admin")
    }

    return next()
  } catch {
    throw new HttpError(401, "Unauthorized")
  }
}

