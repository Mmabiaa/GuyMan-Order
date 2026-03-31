import { Router } from "express"
import { z } from "zod"
import { asyncHandler } from "../../shared/asyncHandler"
import { HttpError } from "../../shared/httpError"
import { requireAuth } from "./auth.middleware"
import { loginController, logoutController, meController } from "./auth.controller"

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1)
})

export const authRouter = Router()

authRouter.get("/me", requireAuth, meController)

authRouter.post(
  "/login",
  asyncHandler(async (req, res) => {
    const parsed = loginSchema.safeParse(req.body)
    if (!parsed.success) throw new HttpError(400, "Invalid payload")
    req.body = parsed.data
    return loginController(req, res)
  })
)

authRouter.post("/logout", logoutController)

