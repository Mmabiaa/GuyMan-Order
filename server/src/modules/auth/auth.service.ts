import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { env } from "../../config/env"
import { HttpError } from "../../shared/httpError"
import { UserModel, type UserDoc } from "./user.model"

async function findByUsername(username: string) {
  return UserModel.findOne({ username }).exec()
}

export async function ensureAdminUser(): Promise<void> {
  const existing = await findByUsername(env.adminUsername)
  if (existing) return

  const passwordHash = await bcrypt.hash(env.adminPassword, 12)
  await UserModel.create({
    username: env.adminUsername,
    passwordHash,
    role: "admin"
  })
}

export async function validateLogin(username: string, password: string) {
  const user = await findByUsername(username)
  if (!user) throw new HttpError(401, "Invalid username or password")

  const ok = await bcrypt.compare(password, user.passwordHash)
  if (!ok) throw new HttpError(401, "Invalid username or password")

  return user
}

export function issueJwt(user: UserDoc) {
  const payload = {
    sub: user._id.toString(),
    role: user.role
  }

  // jsonwebtoken's TS types are a bit strict about `secret` and `expiresIn`.
  return jwt.sign(payload, env.jwtSecret as jwt.Secret, {
    expiresIn: env.jwtExpiresIn as jwt.SignOptions["expiresIn"]
  })
}

