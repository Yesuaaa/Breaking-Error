import { Router } from "express"
import ExcelJS from "exceljs"
import multer from "multer"
import { z } from "zod"
import { prisma } from "../lib/prisma.js"
import { requireAdmin } from "../middleware/admin.js"
import { requireAuth } from "../middleware/auth.js"
import {
  ProvisioningError,
  provisionAccount,
  provisionMembership,
  provisionSubject,
} from "../services/provisioning.js"

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter: (_request, file, callback) => {
    callback(null, file.originalname.toLowerCase().endsWith(".xlsx"))
  },
})

const roleValue = (value: unknown) =>
  typeof value === "string" ? value.trim().toUpperCase() : value

const subjectSchema = z.object({
  code: z.string().trim().min(2).max(20),
  name: z.string().trim().min(2).max(120),
  section: z.string().trim().min(1).max(60),
  term: z.string().trim().min(2).max(80),
})

const accountSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  name: z.string().trim().min(2).max(100),
  password: z.string().min(8).max(72),
  accountRole: z.preprocess(roleValue, z.enum(["USER", "ADMIN"]).default("USER")),
  subjectId: z.string().uuid().optional(),
  membershipRole: z.preprocess(roleValue, z.enum(["STUDENT", "PROFESSOR"]).optional()),
}).refine((value) => Boolean(value.subjectId) === Boolean(value.membershipRole), {
  message: "subjectId and membershipRole must be provided together",
})

const enrollmentSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  role: z.preprocess(roleValue, z.enum(["STUDENT", "PROFESSOR"])),
})

const importRowSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  name: z.string().trim().min(2).max(100),
  password: z.string().min(8).max(72),
  accountRole: z.preprocess(roleValue, z.enum(["USER", "ADMIN"]).default("USER")),
  subjectCode: z.string().trim().min(2).max(20),
  subjectName: z.string().trim().min(2).max(120),
  section: z.string().trim().min(1).max(60),
  term: z.string().trim().min(2).max(80),
  membershipRole: z.preprocess(roleValue, z.enum(["STUDENT", "PROFESSOR"])),
})

type ImportRow = z.infer<typeof importRowSchema>

export const adminRouter = Router()

adminRouter.use(requireAuth, requireAdmin)

adminRouter.get("/overview", async (_request, response) => {
  const [subjects, profiles] = await Promise.all([
    prisma.subject.findMany({
      orderBy: { code: "asc" },
      include: {
        memberships: {
          orderBy: { profile: { name: "asc" } },
          select: {
            role: true,
            profile: { select: { id: true, name: true, email: true } },
          },
        },
      },
    }),
    prisma.profile.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, email: true, accountRole: true },
    }),
  ])

  response.json({ subjects, profiles })
})

adminRouter.post("/subjects", async (request, response) => {
  const input = subjectSchema.parse(request.body)
  const result = await provisionSubject(input)
  response.status(result.created ? 201 : 200).json(result.subject)
})

adminRouter.post("/accounts", async (request, response) => {
  const input = accountSchema.parse(request.body)
  const result = await provisionAccount(input)

  if (input.subjectId && input.membershipRole) {
    await provisionMembership(result.profile.id, input.subjectId, input.membershipRole)
  }

  response.status(result.created ? 201 : 200).json(result.profile)
})

adminRouter.post("/subjects/:subjectId/members", async (request, response) => {
  const subjectId = z.string().uuid().parse(request.params.subjectId)
  const input = enrollmentSchema.parse(request.body)
  const profile = await prisma.profile.findUnique({ where: { email: input.email } })

  if (!profile) {
    response.status(404).json({ error: "Account not found" })
    return
  }

  const membership = await provisionMembership(profile.id, subjectId, input.role)
  response.status(201).json(membership)
})

adminRouter.get("/import-template", async (_request, response) => {
  const workbook = new ExcelJS.Workbook()
  const sheet = workbook.addWorksheet("Accounts and subjects")
  sheet.columns = [
    { header: "email", key: "email", width: 30 },
    { header: "name", key: "name", width: 24 },
    { header: "password", key: "password", width: 18 },
    { header: "accountRole", key: "accountRole", width: 16 },
    { header: "subjectCode", key: "subjectCode", width: 16 },
    { header: "subjectName", key: "subjectName", width: 34 },
    { header: "section", key: "section", width: 18 },
    { header: "term", key: "term", width: 24 },
    { header: "membershipRole", key: "membershipRole", width: 20 },
  ]
  sheet.addRows([
    {
      email: "professor@example.edu",
      name: "Dr. Maya Santos",
      password: "Professor123!",
      accountRole: "USER",
      subjectCode: "CS101",
      subjectName: "Introduction to Computer Science",
      section: "BSCS 1-A",
      term: "1st Semester 2026-2027",
      membershipRole: "PROFESSOR",
    },
    {
      email: "student@example.edu",
      name: "Alex Rivera",
      password: "Student123!",
      accountRole: "USER",
      subjectCode: "CS101",
      subjectName: "Introduction to Computer Science",
      section: "BSCS 1-A",
      term: "1st Semester 2026-2027",
      membershipRole: "STUDENT",
    },
  ])
  sheet.getRow(1).font = { bold: true }
  sheet.views = [{ state: "frozen", ySplit: 1 }]
  sheet.autoFilter = "A1:I1"

  const buffer = await workbook.xlsx.writeBuffer()
  response.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  )
  response.setHeader("Content-Disposition", 'attachment; filename="account-import-template.xlsx"')
  response.send(Buffer.from(buffer))
})

adminRouter.post("/import", upload.single("file"), async (request, response) => {
  if (!request.file) {
    response.status(400).json({ error: "Attach a valid .xlsx file in the file field" })
    return
  }

  const workbook = new ExcelJS.Workbook()
  await workbook.xlsx.load(request.file.buffer as never)
  const sheet = workbook.worksheets[0]
  if (!sheet) throw new ProvisioningError("The workbook does not contain a worksheet")

  const headers = new Map<string, number>()
  sheet.getRow(1).eachCell((cell, column) => {
    headers.set(cell.text.trim().toLowerCase(), column)
  })

  const requiredHeaders = [
    "email", "name", "password", "accountrole", "subjectcode",
    "subjectname", "section", "term", "membershiprole",
  ]
  const missingHeaders = requiredHeaders.filter((header) => !headers.has(header))
  if (missingHeaders.length) {
    throw new ProvisioningError(`Missing columns: ${missingHeaders.join(", ")}`)
  }

  const value = (row: ExcelJS.Row, header: string) =>
    row.getCell(headers.get(header)!).text.trim()
  const rows: ImportRow[] = []
  const rowErrors: string[] = []

  for (let rowNumber = 2; rowNumber <= sheet.rowCount; rowNumber += 1) {
    const row = sheet.getRow(rowNumber)
    if (!row.hasValues) continue
    const result = importRowSchema.safeParse({
      email: value(row, "email"),
      name: value(row, "name"),
      password: value(row, "password"),
      accountRole: value(row, "accountrole") || "USER",
      subjectCode: value(row, "subjectcode"),
      subjectName: value(row, "subjectname"),
      section: value(row, "section"),
      term: value(row, "term"),
      membershipRole: value(row, "membershiprole"),
    })
    if (result.success) rows.push(result.data)
    else rowErrors.push(`Row ${rowNumber}: ${result.error.issues.map((issue) => issue.message).join(", ")}`)
  }

  if (!rows.length) rowErrors.push("The workbook has no data rows")
  if (rowErrors.length) {
    response.status(400).json({ error: "Import validation failed", details: rowErrors })
    return
  }

  const createdAccounts = new Set<string>()
  const processedAccounts = new Set<string>()
  const createdSubjects = new Set<string>()

  for (const row of rows) {
    const account = await provisionAccount(row)
    const subject = await provisionSubject({
      code: row.subjectCode,
      name: row.subjectName,
      section: row.section,
      term: row.term,
    })
    await provisionMembership(account.profile.id, subject.subject.id, row.membershipRole)
    processedAccounts.add(account.profile.email)
    if (account.created) createdAccounts.add(account.profile.email)
    if (subject.created) createdSubjects.add(subject.subject.id)
  }

  response.json({
    rowsProcessed: rows.length,
    accountsProcessed: processedAccounts.size,
    accountsCreated: createdAccounts.size,
    subjectsCreated: createdSubjects.size,
    membershipsProcessed: rows.length,
  })
})
