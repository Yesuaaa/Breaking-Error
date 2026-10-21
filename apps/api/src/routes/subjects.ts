import { Router } from "express"
import { z } from "zod"
import { prisma } from "../lib/prisma.js"
import { requireAuth } from "../middleware/auth.js"

const createMessageSchema = z.object({
  content: z.string().trim().min(1).max(4000),
})

export const subjectsRouter = Router()

subjectsRouter.use(requireAuth)

subjectsRouter.get("/", async (request, response) => {
  const { userId } = request
  const memberships = await prisma.membership.findMany({
    where: { profileId: userId },
    orderBy: { subject: { code: "asc" } },
    select: {
      role: true,
      subject: {
        select: {
          id: true,
          code: true,
          name: true,
          section: true,
          term: true,
          _count: { select: { memberships: true } },
        },
      },
    },
  })

  response.json(
    memberships.map(({ role, subject }) => ({
      ...subject,
      role,
      memberCount: subject._count.memberships,
      _count: undefined,
    })),
  )
})

subjectsRouter.get("/:subjectId/messages", async (request, response) => {
  const { userId } = request
  const subjectId = z.string().uuid().parse(request.params.subjectId)
  const membership = await prisma.membership.findUnique({
    where: { profileId_subjectId: { profileId: userId, subjectId } },
  })

  if (!membership) {
    response.status(403).json({ error: "You are not enrolled in this subject" })
    return
  }

  const messages = await prisma.message.findMany({
    where: { subjectId },
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true,
      content: true,
      authorId: true,
      createdAt: true,
      author: { select: { id: true, name: true } },
    },
  })

  response.json(messages.reverse())
})

subjectsRouter.post("/:subjectId/messages", async (request, response) => {
  const { userId } = request
  const subjectId = z.string().uuid().parse(request.params.subjectId)
  const { content } = createMessageSchema.parse(request.body)
  const membership = await prisma.membership.findUnique({
    where: { profileId_subjectId: { profileId: userId, subjectId } },
  })

  if (!membership) {
    response.status(403).json({ error: "You are not enrolled in this subject" })
    return
  }

  const message = await prisma.message.create({
    data: { content, subjectId, authorId: userId },
    select: {
      id: true,
      content: true,
      authorId: true,
      createdAt: true,
      author: { select: { id: true, name: true } },
    },
  })

  response.status(201).json(message)
})
