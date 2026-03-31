import { createApp } from "./app"
import { env } from "./config/env"
import { connectMongo } from "./db/mongoose"
import { ensureAdminUser } from "./modules/auth/auth.service"

async function main() {
  await connectMongo()
  await ensureAdminUser()

  const app = createApp()
  app.listen(env.port, () => {
    // eslint-disable-next-line no-console
    console.log(`Backend listening on http://localhost:${env.port}/v1`)
  })
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err)
  process.exit(1)
})

