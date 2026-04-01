import { NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

function backendBase(): string {
  const raw =
    process.env.BACKEND_URL ??
    process.env.NEXT_PUBLIC_BACKEND_URL ??
    "http://localhost:4000"
  return raw.replace(/\/$/, "")
}

async function proxy(req: NextRequest, segments: string[]) {
  const path = segments.length ? segments.join("/") : ""
  const target = `${backendBase()}/${path}${req.nextUrl.search}`

  const token = req.cookies.get("auth-token")?.value

  const forwardHeaders = new Headers()
  const contentType = req.headers.get("content-type")
  if (contentType) forwardHeaders.set("content-type", contentType)
  const accept = req.headers.get("accept")
  if (accept) forwardHeaders.set("accept", accept)
  if (token) {
    forwardHeaders.set("cookie", `auth-token=${token}`)
  }

  let body: ArrayBuffer | undefined
  if (req.method !== "GET" && req.method !== "HEAD") {
    body = await req.arrayBuffer()
  }

  const res = await fetch(target, {
    method: req.method,
    headers: forwardHeaders,
    body: body && body.byteLength ? body : undefined,
    cache: "no-store"
  })

  const buf = await res.arrayBuffer()
  const out = new NextResponse(buf, { status: res.status })

  const ct = res.headers.get("content-type")
  if (ct) out.headers.set("content-type", ct)

  // Let the browser store cookies on the Next.js host (strip API Domain=… if present).
  const setCookies =
    typeof res.headers.getSetCookie === "function"
      ? res.headers.getSetCookie()
      : res.headers.get("set-cookie")
        ? [res.headers.get("set-cookie") as string]
        : []
  for (const c of setCookies) {
    if (c?.trim()) {
      out.headers.append("set-cookie", stripSetCookieDomain(c))
    }
  }

  return out
}

/** Remove Domain so Set-Cookie applies to the site serving this proxy (same-origin). */
function stripSetCookieDomain(header: string): string {
  return header
    .split(";")
    .map((p) => p.trim())
    .filter((p) => p.length > 0 && !/^domain=/i.test(p))
    .join("; ")
}

type RouteCtx = { params: Promise<{ path?: string[] }> }

async function handle(req: NextRequest, ctx: RouteCtx) {
  const { path = [] } = await ctx.params
  return proxy(req, path)
}

export const GET = handle
export const POST = handle
export const PUT = handle
export const PATCH = handle
export const DELETE = handle
export const OPTIONS = handle
