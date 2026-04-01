// Food packages with predefined prices (UI defaults; amounts still validated by the API)
export const FOOD_PACKAGES = [
  { id: "banku-tilapia-small", name: "Banku and Tilapia", size: "Small", price: 50 },
  { id: "banku-tilapia-medium", name: "Banku and Tilapia", size: "Medium", price: 60 },
  { id: "banku-tilapia-large", name: "Banku and Tilapia", size: "Large", price: 70 },
] as const

export type FoodPackage = (typeof FOOD_PACKAGES)[number]

/** Order shape returned by the API and shown in tables */
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
