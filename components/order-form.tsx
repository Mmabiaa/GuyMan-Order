"use client"

import { useState, useMemo, useEffect } from "react"
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
import { Plus, Trash2, ShoppingBasket, Sparkles } from "lucide-react"
import { FOOD_PACKAGES, EXTRA_ITEMS, type OrderItem, type ExtraOrderItem } from "@/lib/store"
import { cn } from "@/lib/utils"

interface OrderFormProps {
  onAddOrder: (order: {
    customerName: string
    phoneNumber: string
    items: OrderItem[]
    extras: ExtraOrderItem[]
    amount: number
  }) => void
}

export function OrderForm({ onAddOrder }: OrderFormProps) {
  const [customerName, setCustomerName] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")

  const [items, setItems] = useState<OrderItem[]>([])
  const [extras, setExtras] = useState<ExtraOrderItem[]>([])

  // Get unique food items
  const foodNames = useMemo(() => {
    return [...new Set(FOOD_PACKAGES.map((p) => p.name))]
  }, [])

  // Get unique extra names
  const extraNames = useMemo(() => {
    return [...new Set(EXTRA_ITEMS.map((e) => e.name))]
  }, [])

  const addItem = () => {
    const firstFood = foodNames[0]
    const defaultPKG = FOOD_PACKAGES.find(p => p.name === firstFood)!
    setItems([...items, { foodItem: firstFood, size: defaultPKG.size, price: defaultPKG.price, quantity: 1 }])
  }

  const addExtra = () => {
    const firstExtra = extraNames[0]
    const defaultExtra = EXTRA_ITEMS.find(e => e.name === firstExtra)!
    setExtras([...extras, { name: firstExtra, size: defaultExtra.size, price: defaultExtra.price, quantity: 1 }])
  }

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const removeExtra = (index: number) => {
    setExtras(extras.filter((_, i) => i !== index))
  }

  const updateItem = (index: number, updates: Partial<OrderItem>) => {
    const newItems = [...items]
    const item = { ...newItems[index], ...updates }

    // If foodItem or size changed, update price
    if (updates.foodItem || updates.size) {
      const pkg = FOOD_PACKAGES.find(p => p.name === item.foodItem && p.size === item.size)
      if (pkg) item.price = pkg.price
    }

    newItems[index] = item
    setItems(newItems)
  }

  const updateExtra = (index: number, updates: Partial<ExtraOrderItem>) => {
    const newExtras = [...extras]
    const extra = { ...newExtras[index], ...updates }

    // If name or size changed, update price
    if (updates.name || updates.size) {
      const eInfo = EXTRA_ITEMS.find(e => e.name === extra.name && e.size === extra.size)
      if (eInfo) extra.price = eInfo.price
    }

    newExtras[index] = extra
    setExtras(newExtras)
  }

  const totalAmount = useMemo(() => {
    const itemsTotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    const extrasTotal = extras.reduce((sum, extra) => sum + (extra.price * extra.quantity), 0)
    return itemsTotal + extrasTotal
  }, [items, extras])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!customerName || !phoneNumber || (items.length === 0 && extras.length === 0)) return

    onAddOrder({
      customerName,
      phoneNumber,
      items,
      extras,
      amount: totalAmount,
    })

    setCustomerName("")
    setPhoneNumber("")
    setItems([])
    setExtras([])
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-xl border border-border bg-card p-5 shadow-sm transition-all hover:shadow-md sm:p-8"
    >
      <div className="flex items-center gap-3 border-b border-border pb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">Place New Order</h2>
          <p className="text-sm text-muted-foreground">Add customer details and list order items</p>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field>
          <FieldLabel className="text-foreground/80">Customer Name</FieldLabel>
          <Input
            placeholder="e.g. John Doe"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="h-11 bg-input/50 focus:bg-input"
          />
        </Field>
        <Field>
          <FieldLabel className="text-foreground/80">Phone Number</FieldLabel>
          <Input
            placeholder="e.g. +233 XX XXX XXXX"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="h-11 bg-input/50 focus:bg-input"
          />
        </Field>
      </div>

      {/* Food Packages Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            <ShoppingBasket className="h-4 w-4" />
            Food Packages
          </h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addItem}
            className="h-8 border-dashed hover:border-solid hover:bg-secondary/50"
          >
            <Plus className="mr-1 h-3.5 w-3.5" /> Add Package
          </Button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border py-8 text-center bg-muted/20">
            <p className="text-sm text-muted-foreground">No food packages added yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item, idx) => (
              <div key={idx} className="group relative grid gap-3 rounded-lg border border-border bg-muted/30 p-4 transition-colors hover:bg-muted/50 sm:grid-cols-12 sm:items-end">
                <div className="sm:col-span-5">
                  <FieldLabel className="mb-1.5 text-xs">Food Package</FieldLabel>
                  <Select value={item.foodItem} onValueChange={(val) => updateItem(idx, { foodItem: val })}>
                    <SelectTrigger className="h-10 bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {foodNames.map(n => <SelectItem key={n} value={n}>{n}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="sm:col-span-3">
                  <FieldLabel className="mb-1.5 text-xs">Size</FieldLabel>
                  <Select value={item.size} onValueChange={(val) => updateItem(idx, { size: val })}>
                    <SelectTrigger className="h-10 bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FOOD_PACKAGES.filter(p => p.name === item.foodItem).map(p => (
                        <SelectItem key={p.id} value={p.size}>{p.size} ({p.price} GHS)</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="sm:col-span-2">
                  <FieldLabel className="mb-1.5 text-xs">Qty</FieldLabel>
                  <Input
                    type="number"
                    min="1"
                    value={item.quantity || ""}
                    onChange={e => {
                      const val = e.target.value
                      updateItem(idx, { quantity: val === "" ? 0 : parseInt(val) })
                    }}
                    onBlur={() => {
                      if (item.quantity === 0) updateItem(idx, { quantity: 1 })
                    }}
                    className="h-10 bg-background"
                  />
                </div>
                <div className="sm:col-span-2 flex items-center justify-between gap-2">
                  <div className="text-right flex-1">
                    <p className="text-xs text-muted-foreground mb-0.5">Subtotal</p>
                    <p className="font-medium">{item.price * item.quantity} GHS</p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeItem(idx)}
                    className="h-9 w-9 text-destructive hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Extras Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            <Plus className="h-4 w-4" />
            Extras (e.g. Banku Balls)
          </h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addExtra}
            className="h-8 border-dashed hover:border-solid hover:bg-secondary/50"
          >
            <Plus className="mr-1 h-3.5 w-3.5" /> Add Extra
          </Button>
        </div>

        {extras.map((extra, idx) => (
          <div key={`extra-${idx}`} className="group relative grid gap-3 rounded-lg border border-border bg-muted/10 p-4 transition-colors hover:bg-muted/20 sm:grid-cols-12 sm:items-end">
            <div className="sm:col-span-5">
              <FieldLabel className="mb-1.5 text-xs">Extra Item</FieldLabel>
              <Select value={extra.name} onValueChange={(val) => updateExtra(idx, { name: val })}>
                <SelectTrigger className="h-10 bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {extraNames.map(n => <SelectItem key={n} value={n}>{n}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="sm:col-span-3">
              <FieldLabel className="mb-1.5 text-xs">Size</FieldLabel>
              <Select value={extra.size} onValueChange={(val) => updateExtra(idx, { size: val })}>
                <SelectTrigger className="h-10 bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EXTRA_ITEMS.filter(e => e.name === extra.name).map(e => (
                    <SelectItem key={e.id} value={e.size}>{e.size} ({e.price} GHS)</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="sm:col-span-2">
              <FieldLabel className="mb-1.5 text-xs">Qty</FieldLabel>
              <Input
                type="number"
                min="1"
                value={extra.quantity || ""}
                onChange={e => {
                  const val = e.target.value
                  updateExtra(idx, { quantity: val === "" ? 0 : parseInt(val) })
                }}
                onBlur={() => {
                  if (extra.quantity === 0) updateExtra(idx, { quantity: 1 })
                }}
                className="h-10 bg-background"
              />
            </div>
            <div className="sm:col-span-2 flex items-center justify-between gap-2">
              <div className="text-right flex-1">
                <p className="text-xs text-muted-foreground mb-0.5">Subtotal</p>
                <p className="font-medium">{extra.price * extra.quantity} GHS</p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeExtra(idx)}
                className="h-9 w-9 text-destructive hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-border pt-6 sm:flex-row">
        <div className="flex flex-col text-center sm:text-left">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-tight">Order Total</p>
          <p className="text-3xl font-extrabold text-foreground">{totalAmount} <span className="text-lg font-bold text-muted-foreground">GHS</span></p>
        </div>
        <Button
          type="submit"
          size="lg"
          className="h-12 w-full px-12 text-base font-bold shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98] sm:w-auto"
          disabled={!customerName || !phoneNumber || (items.length === 0 && extras.length === 0)}
        >
          <Plus className="mr-2 h-5 w-5" /> Confirm & Place Order
        </Button>
      </div>
    </form>
  )
}
