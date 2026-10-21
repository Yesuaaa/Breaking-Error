import { Router } from "express"
import { z } from "zod"
import { prisma } from "../lib/prisma.js"
import { requireAuth } from "../middleware/auth.js"

const createMessageSchema = z.object({
  content: z.string().trim().min(1).max(4000),
})

const createTaskSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().max(4000).optional(),
  dueAt: z.string().datetime().nullable().optional(),
  points: z.number().int().min(0).max(10000).nullable().optional(),
})

const createMaterialSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().max(4000).optional(),
  url: z.string().trim().url().max(2048).refine(
    (url) => ["http:", "https:"].includes(new URL(url).protocol),
    "Only HTTP and HTTPS links are supported",
  ),
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

subjectsRouter.get("/:subjectId/tasks", async (request, response) => {
  const { userId } = request
  const subjectId = z.string().uuid().parse(request.params.subjectId)
  const membership = await prisma.membership.findUnique({
    where: { profileId_subjectId: { profileId: userId, subjectId } },
  })

  if (!membership) {
    response.status(403).json({ error: "You are not enrolled in this subject" })
    return
  }

  const tasks = await prisma.task.findMany({
    where: { subjectId },
    orderBy: [{ dueAt: { sort: "asc", nulls: "last" } }, { createdAt: "desc" }],
    select: {
      id: true,
      title: true,
      description: true,
      dueAt: true,
      points: true,
      createdAt: true,
      creator: { select: { id: true, name: true } },
    },
  })

  response.json(tasks)
})

subjectsRouter.post("/:subjectId/tasks", async (request, response) => {
  const { userId } = request
  const subjectId = z.string().uuid().parse(request.params.subjectId)
  const input = createTaskSchema.parse(request.body)
  const membership = await prisma.membership.findUnique({
    where: { profileId_subjectId: { profileId: userId, subjectId } },
  })

  if (membership?.role !== "PROFESSOR") {
    response.status(403).json({ error: "Only a professor assigned to this subject can add tasks" })
    return
  }

  const task = await prisma.task.create({
    data: {
      title: input.title,
      description: input.description || null,
      dueAt: input.dueAt ? new Date(input.dueAt) : null,
      points: input.points ?? null,
      subjectId,
      creatorId: userId,
    },
    select: {
      id: true,
      title: true,
      description: true,
      dueAt: true,
      points: true,
      createdAt: true,
      creator: { select: { id: true, name: true } },
    },
  })

  response.status(201).json(task)
})

subjectsRouter.delete("/:subjectId/tasks/:taskId", async (request, response) => {
  const { userId } = request
  const subjectId = z.string().uuid().parse(request.params.subjectId)
  const taskId = z.string().uuid().parse(request.params.taskId)
  const membership = await prisma.membership.findUnique({
    where: { profileId_subjectId: { profileId: userId, subjectId } },
  })

  if (membership?.role !== "PROFESSOR") {
    response.status(403).json({ error: "Only a professor assigned to this subject can delete tasks" })
    return
  }

  const result = await prisma.task.deleteMany({ where: { id: taskId, subjectId } })
  if (result.count === 0) {
    response.status(404).json({ error: "Task not found" })
    return
  }

  response.json({ id: taskId })
})

subjectsRouter.get("/:subjectId/materials", async (request, response) => {
  const { userId } = request
  const subjectId = z.string().uuid().parse(request.params.subjectId)
  const membership = await prisma.membership.findUnique({
    where: { profileId_subjectId: { profileId: userId, subjectId } },
  })

  if (!membership) {
    response.status(403).json({ error: "You are not enrolled in this subject" })
    return
  }

  const materials = await prisma.learningMaterial.findMany({
    where: { subjectId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      description: true,
      url: true,
      createdAt: true,
      creator: { select: { id: true, name: true } },
    },
  })

  response.json(materials)
})

subjectsRouter.post("/:subjectId/materials", async (request, response) => {
  const { userId } = request
  const subjectId = z.string().uuid().parse(request.params.subjectId)
  const input = createMaterialSchema.parse(request.body)
  const membership = await prisma.membership.findUnique({
    where: { profileId_subjectId: { profileId: userId, subjectId } },
  })

  if (membership?.role !== "PROFESSOR") {
    response.status(403).json({ error: "Only a professor assigned to this subject can add materials" })
    return
  }

  const material = await prisma.learningMaterial.create({
    data: {
      title: input.title,
      description: input.description || null,
      url: input.url,
      subjectId,
      creatorId: userId,
    },
    select: {
      id: true,
      title: true,
      description: true,
      url: true,
      createdAt: true,
      creator: { select: { id: true, name: true } },
    },
  })

  response.status(201).json(material)
})

subjectsRouter.delete("/:subjectId/materials/:materialId", async (request, response) => {
  const { userId } = request
  const subjectId = z.string().uuid().parse(request.params.subjectId)
  const materialId = z.string().uuid().parse(request.params.materialId)
  const membership = await prisma.membership.findUnique({
    where: { profileId_subjectId: { profileId: userId, subjectId } },
  })

  if (membership?.role !== "PROFESSOR") {
    response.status(403).json({ error: "Only a professor assigned to this subject can delete materials" })
    return
  }

  const result = await prisma.learningMaterial.deleteMany({ where: { id: materialId, subjectId } })
  if (result.count === 0) {
    response.status(404).json({ error: "Learning material not found" })
    return
  }

  response.json({ id: materialId })
})
