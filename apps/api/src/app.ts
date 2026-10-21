import cors from "cors"
import express, { type NextFunction, type Request, type Response } from "express"
import helmet from "helmet"
import { ZodError } from "zod"
import { env } from "./config/env.js"
import { prisma } from "./lib/prisma.js"
import { requireAuth } from "./middleware/auth.js"
import { adminRouter } from "./routes/admin.js"
import { subjectsRouter } from "./routes/subjects.js"
import { ProvisioningError } from "./services/provisioning.js"

export const app = express()

app.disable("x-powered-by")
app.use(helmet())
app.use(cors({ origin: env.WEB_ORIGIN, credentials: true }))
app.use(express.json({ limit: "1mb" }))

app.get("/api/health", (_request, response) => {
  response.json({ status: "ok", timestamp: new Date().toISOString() })
})

app.get("/api/me", requireAuth, async (request, response) => {
  const profile = await prisma.profile.findUniqueOrThrow({
    where: { id: request.userId },
    select: { id: true, email: true, name: true, accountRole: true },
  })
  response.json(profile)
})

app.use("/api/subjects", subjectsRouter)
app.use("/api/admin", adminRouter)

app.use((_request, response) => {
  response.status(404).json({ error: "Not found" })
})

app.use((error: unknown, _request: Request, response: Response, _next: NextFunction) => {
  void _next
  if (error instanceof ZodError) {
    response.status(400).json({ error: "Invalid request", details: error.flatten().fieldErrors })
    return
  }

  if (error instanceof ProvisioningError) {
    response.status(400).json({ error: error.message })
    return
  }

  console.error(error)
  response.status(500).json({ error: "Internal server error" })
})
