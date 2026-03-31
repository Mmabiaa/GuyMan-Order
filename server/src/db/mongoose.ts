import mongoose from "mongoose"
import { env } from "../config/env"

let isConnected = false

export async function connectMongo(): Promise<void> {
  if (isConnected) return

  mongoose.set("strictQuery", true)

  await mongoose.connect(env.mongodbUri)
  isConnected = true
}

