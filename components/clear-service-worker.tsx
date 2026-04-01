"use client"

import { useEffect } from "react"

/**
 * One-time cleanup for users who still have a legacy service worker from older deploys.
 * Unregisters all SWs and clears Cache Storage so fresh JS (fetch login, no server actions) loads.
 */
export function ClearStaleServiceWorker() {
  useEffect(() => {
    if (typeof window === "undefined") return
    if (!("serviceWorker" in navigator)) return

    void navigator.serviceWorker.getRegistrations().then((regs) =>
      Promise.all(regs.map((r) => r.unregister()))
    )

    if ("caches" in window) {
      void caches.keys().then((keys) =>
        Promise.all(keys.map((k) => caches.delete(k)))
      )
    }
  }, [])

  return null
}
