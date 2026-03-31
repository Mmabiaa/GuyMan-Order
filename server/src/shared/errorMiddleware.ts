import type { NextFunction, Request, Response } from "express"
import { HttpError } from "./httpError"

export function errorMiddleware(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (err instanceof HttpError) {
    return res.status(err.statusCode).json({ error: err.message })
  }

  // Avoid leaking internals in production.
  const message =
    process.env.NODE_ENV === "production"
      ? "Internal server error"
      : err instanceof Error
        ? err.message
        : "Internal server error"

  // eslint-disable-next-line no-console
  console.error(err)
  return res.status(500).json({ error: message })
}

