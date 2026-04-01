"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus } from "lucide-react"
import { FOOD_PACKAGES } from "@/lib/store"

interface OrderFormProps {
  onAddOrder: (order: {
    customerName: string
    phoneNumber: string
    foodItem: string
    size: string
    amount: number
  }) => void
}

export function OrderForm({ onAddOrder }: OrderFormProps) {
  const [customerName, setCustomerName] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [selectedFood, setSelectedFood] = useState("")
  const [selectedSize, setSelectedSize] = useState("")

  // Get unique food items
  const foodItems = useMemo(() => {
    const unique = [...new Set(FOOD_PACKAGES.map((p) => p.name))]
    return unique
  }, [])

  // Get available sizes for selected food
  const availableSizes = useMemo(() => {
    if (!selectedFood) return []
    return FOOD_PACKAGES.filter((p) => p.name === selectedFood)
  }, [selectedFood])

  // Get price for selected food and size
  const selectedPrice = useMemo(() => {
    if (!selectedFood || !selectedSize) return 0
    const pkg = FOOD_PACKAGES.find(
      (p) => p.name === selectedFood && p.size === selectedSize
    )
    return pkg?.price ?? 0
  }, [selectedFood, selectedSize])

  const handleFoodChange = (value: string) => {
    setSelectedFood(value)
    setSelectedSize("")
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!customerName || !phoneNumber || !selectedFood || !selectedSize) return

    onAddOrder({
      customerName,
      phoneNumber,
      foodItem: selectedFood,
      size: selectedSize,
      amount: selectedPrice,
    })

    setCustomerName("")
    setPhoneNumber("")
    setSelectedFood("")
    setSelectedSize("")
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-lg border border-border bg-card p-4 sm:p-6"
    >
      <h2 className="mb-4 text-lg font-medium text-foreground sm:mb-6">
        New Order
      </h2>
      <FieldGroup className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Field>
          <FieldLabel>Customer Name</FieldLabel>
          <Input
            placeholder="John Doe"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="bg-input"
          />
        </Field>
        <Field>
          <FieldLabel>Phone Number</FieldLabel>
          <Input
            placeholder="+233 XX XXX XXXX"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="bg-input"
          />
        </Field>
        <Field>
          <FieldLabel>Food Package</FieldLabel>
          <Select value={selectedFood} onValueChange={handleFoodChange}>
            <SelectTrigger className="bg-input">
              <SelectValue placeholder="Select food" />
            </SelectTrigger>
            <SelectContent>
              {foodItems.map((item) => (
                <SelectItem key={item} value={item}>
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field>
          <FieldLabel>Size</FieldLabel>
          <Select
            value={selectedSize}
            onValueChange={setSelectedSize}
            disabled={!selectedFood}
          >
            <SelectTrigger className="bg-input">
              <SelectValue placeholder="Select size" />
            </SelectTrigger>
            <SelectContent>
              {availableSizes.map((pkg) => (
                <SelectItem key={pkg.id} value={pkg.size}>
                  {pkg.size} - {pkg.price} GHS
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field>
          <FieldLabel>Amount</FieldLabel>
          <div className="flex h-9 items-center rounded-md border border-border bg-input px-3 text-foreground">
            {selectedPrice > 0 ? `${selectedPrice} GHS` : "—"}
          </div>
        </Field>
      </FieldGroup>
      <div className="mt-6 flex justify-stretch sm:justify-end">
        <Button type="submit" className="min-h-10 w-full gap-2 sm:w-auto">
          <Plus className="h-4 w-4" />
          Add Order
        </Button>
      </div>
    </form>
  )
}
