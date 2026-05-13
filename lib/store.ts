// Food packages with predefined prices (UI defaults; amounts still validated by the API)
export const FOOD_PACKAGES = [
  { id: "banku-tilapia-small", name: "Banku and Tilapia", size: "Small", price: 50 },
  { id: "banku-tilapia-medium", name: "Banku and Tilapia", size: "Medium", price: 60 },
  { id: "banku-tilapia-large", name: "Banku and Tilapia", size: "Large", price: 70 },
] as const

export const EXTRA_ITEMS = [
  { id: "banku-ball-small", name: "Banku Ball", size: "Small", price: 5 },
  { id: "banku-ball-large", name: "Banku Ball", size: "Large", price: 8 },
] as const

export type FoodPackage = (typeof FOOD_PACKAGES)[number]
export type ExtraItem = (typeof EXTRA_ITEMS)[number]

export interface OrderItem {
  foodItem: string
  size: string
  price: number
  quantity: number
}

export interface ExtraOrderItem {
  name: string
  size: string
  price: number
  quantity: number
}

/** Order shape returned by the API and shown in tables */
export interface Order {
  id: string
  customerName: string
  phoneNumber: string
  foodItem: string // For backward compatibility / display
  size: string     // For backward compatibility / display
  items?: OrderItem[]
  extras?: ExtraOrderItem[]
  amount: number
  createdAt: string
  completed: boolean
  paymentStatus: "UNPAID" | "PENDING" | "PAID"
  paidAt?: string | null
}
