import type { NextFunction, Request, Response } from "express"
import { prisma } from "../lib/prisma.js"
import { supabaseAdmin } from "../lib/supabase.js"

export async function requireAuth(request: Request, response: Response, next: NextFunction) {
  if (!supabaseAdmin) {
    response.status(503).json({ error: "Supabase is not configured" })
    return
  }

  const [scheme, token] = request.headers.authorization?.split(" ") ?? []

  if (scheme !== "Bearer" || !token) {
    response.status(401).json({ error: "Missing bearer token" })
    return
  }

  const { data, error } = await supabaseAdmin.auth.getUser(token)

  if (error || !data.user.email) {
    response.status(401).json({ error: "Invalid or expired session" })
    return
  }

  const displayName =
    typeof data.user.user_metadata.full_name === "string"
      ? data.user.user_metadata.full_name
      : data.user.email.split("@")[0]

  await prisma.profile.upsert({
    where: { id: data.user.id },
    update: { email: data.user.email, name: displayName },
    create: { id: data.user.id, email: data.user.email, name: displayName },
  })

  request.userId = data.user.id
  next()
}
