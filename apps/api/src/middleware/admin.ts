import type { NextFunction, Request, Response } from "express"
import { prisma } from "../lib/prisma.js"

export async function requireAdmin(request: Request, response: Response, next: NextFunction) {
  const profile = await prisma.profile.findUnique({
    where: { id: request.userId },
    select: { accountRole: true },
  })

  if (profile?.accountRole !== "ADMIN") {
    response.status(403).json({ error: "Administrator access required" })
    return
  }

  next()
}

