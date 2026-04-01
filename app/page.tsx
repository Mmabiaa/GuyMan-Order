import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { Dashboard } from "@/components/dashboard"
import { loadDashboardInitialData } from "@/lib/server/backend-data"

export default async function Page() {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth-token")?.value
  if (!token) {
    redirect("/login")
  }

  let data: Awaited<ReturnType<typeof loadDashboardInitialData>>
  try {
    data = await loadDashboardInitialData(token)
  } catch {
    cookieStore.delete("auth-token")
    redirect("/login")
  }

  if (data === "unauthorized") {
    cookieStore.delete("auth-token")
    redirect("/login")
  }

  return (
    <Dashboard
      initialOrders={data.orders}
      initialTransactions={data.transactions}
    />
  )
}
