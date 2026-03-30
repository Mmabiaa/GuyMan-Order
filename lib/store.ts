// Food packages with predefined prices
export const FOOD_PACKAGES = [
  { id: "banku-tilapia-small", name: "Banku and Tilapia", size: "Small", price: 50 },
  { id: "banku-tilapia-medium", name: "Banku and Tilapia", size: "Medium", price: 60 },
  { id: "banku-tilapia-large", name: "Banku and Tilapia", size: "Large", price: 70 },
] as const

export type FoodPackage = (typeof FOOD_PACKAGES)[number]

export interface Order {
  id: string
  customerName: string
  phoneNumber: string
  foodItem: string
  size: string
  amount: number
  createdAt: string
  completed: boolean
}

const ORDERS_KEY = "food_delivery_orders"
const TRANSACTIONS_KEY = "food_delivery_transactions"

// Get active orders from localStorage
export function getOrders(): Order[] {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem(ORDERS_KEY)
  return data ? JSON.parse(data) : []
}

// Save orders to localStorage
export function saveOrders(orders: Order[]): void {
  if (typeof window === "undefined") return
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders))
}

// Get completed transactions from localStorage
export function getTransactions(): Order[] {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem(TRANSACTIONS_KEY)
  return data ? JSON.parse(data) : []
}

// Save transactions to localStorage
export function saveTransactions(transactions: Order[]): void {
  if (typeof window === "undefined") return
  localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions))
}

// Add new order
export function addOrder(orderData: Omit<Order, "id" | "createdAt" | "completed">): Order {
  const orders = getOrders()
  const newOrder: Order = {
    id: crypto.randomUUID(),
    ...orderData,
    createdAt: new Date().toISOString(),
    completed: false,
  }
  orders.push(newOrder)
  saveOrders(orders)
  return newOrder
}

// Mark order as completed and move to transactions
export function completeOrder(id: string): void {
  const orders = getOrders()
  const orderIndex = orders.findIndex((o) => o.id === id)

  if (orderIndex !== -1) {
    const completedOrder = { ...orders[orderIndex], completed: true }

    // Remove from active orders
    orders.splice(orderIndex, 1)
    saveOrders(orders)

    // Add to transactions
    const transactions = getTransactions()
    transactions.push(completedOrder)
    saveTransactions(transactions)
  }
}

// Toggle order completion status (for undo)
export function toggleOrderCompletion(id: string): void {
  const orders = getOrders()
  const order = orders.find((o) => o.id === id)
  if (order) {
    order.completed = !order.completed
    saveOrders(orders)
  }
}
