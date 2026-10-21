import "dotenv/config"
import { PrismaClient, type MembershipRole } from "@prisma/client"
import { createClient, type User } from "@supabase/supabase-js"

if (process.env.NODE_ENV === "production") {
  throw new Error("Demo data cannot be seeded in production")
}

const databaseUrl = process.env.DATABASE_URL
const directUrl = process.env.DIRECT_URL
const supabaseUrl = process.env.SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!databaseUrl || !directUrl || !supabaseUrl || !serviceRoleKey) {
  throw new Error("DATABASE_URL, DIRECT_URL, SUPABASE_URL, and SUPABASE_SERVICE_ROLE_KEY are required")
}

// Administrative jobs should bypass the transaction pooler. It does not
// preserve prepared statements across concurrent Prisma queries.
const prisma = new PrismaClient({ datasourceUrl: directUrl })
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const professorEmail = process.env.SEED_PROFESSOR_EMAIL ?? "professor@example.edu"
const professorPassword = process.env.SEED_PROFESSOR_PASSWORD ?? "Professor123!"
const studentPassword = process.env.SEED_STUDENT_PASSWORD ?? "Student123!"
const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@example.edu"
const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "Admin123!"

const demoUsers = [
  { email: adminEmail, password: adminPassword, name: "System Administrator", accountRole: "ADMIN" as const },
  { email: professorEmail, password: professorPassword, name: "Dr. Maya Santos", accountRole: "USER" as const },
  { email: "alex.student@example.edu", password: studentPassword, name: "Alex Rivera", accountRole: "USER" as const },
  { email: "sam.student@example.edu", password: studentPassword, name: "Sam Lee", accountRole: "USER" as const },
]

async function findUser(email: string): Promise<User | undefined> {
  let page = 1
  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 100 })
    if (error) throw error
    const match = data.users.find((user) => user.email?.toLowerCase() === email.toLowerCase())
    if (match) return match
    if (data.users.length < 100) return undefined
    page += 1
  }
}

async function ensureUser(user: (typeof demoUsers)[number]) {
  const existing = await findUser(user.email)
  if (existing) return existing

  const { data, error } = await supabase.auth.admin.createUser({
    email: user.email,
    password: user.password,
    email_confirm: true,
    user_metadata: { full_name: user.name },
  })
  if (error) throw error
  return data.user
}

async function enroll(profileId: string, subjectId: string, role: MembershipRole) {
  await prisma.membership.upsert({
    where: { profileId_subjectId: { profileId, subjectId } },
    update: { role },
    create: { profileId, subjectId, role },
  })
}

async function main() {
  const authUsers = await Promise.all(demoUsers.map(ensureUser))

  for (const [index, authUser] of authUsers.entries()) {
    const demoUser = demoUsers[index]
    if (!demoUser) continue
    await prisma.profile.upsert({
      where: { id: authUser.id },
      update: { email: demoUser.email, name: demoUser.name, accountRole: demoUser.accountRole },
      create: { id: authUser.id, email: demoUser.email, name: demoUser.name, accountRole: demoUser.accountRole },
    })
  }

  const subjects = await Promise.all([
    prisma.subject.upsert({
      where: { code_section_term: { code: "CS101", section: "BSCS 1-A", term: "1st Semester 2026–2027" } },
      update: { name: "Introduction to Computer Science" },
      create: { code: "CS101", name: "Introduction to Computer Science", section: "BSCS 1-A", term: "1st Semester 2026–2027" },
    }),
    prisma.subject.upsert({
      where: { code_section_term: { code: "MATH204", section: "BSCS 1-A", term: "1st Semester 2026–2027" } },
      update: { name: "Discrete Mathematics" },
      create: { code: "MATH204", name: "Discrete Mathematics", section: "BSCS 1-A", term: "1st Semester 2026–2027" },
    }),
    prisma.subject.upsert({
      where: { code_section_term: { code: "ENG112", section: "BSCS 1-A", term: "1st Semester 2026–2027" } },
      update: { name: "Academic Communication" },
      create: { code: "ENG112", name: "Academic Communication", section: "BSCS 1-A", term: "1st Semester 2026–2027" },
    }),
  ])

  const [, professor, alex, sam] = authUsers
  const [computerScience, mathematics, communication] = subjects
  if (!professor || !alex || !sam || !computerScience || !mathematics || !communication) {
    throw new Error("Failed to create demo records")
  }

  await Promise.all([
    enroll(professor.id, computerScience.id, "PROFESSOR"),
    enroll(professor.id, mathematics.id, "PROFESSOR"),
    enroll(professor.id, communication.id, "PROFESSOR"),
    enroll(alex.id, computerScience.id, "STUDENT"),
    enroll(alex.id, mathematics.id, "STUDENT"),
    enroll(alex.id, communication.id, "STUDENT"),
    enroll(sam.id, computerScience.id, "STUDENT"),
    enroll(sam.id, communication.id, "STUDENT"),
  ])

  const messageCount = await prisma.message.count()
  if (messageCount === 0) {
    await prisma.message.createMany({
      data: [
        {
          subjectId: computerScience.id,
          authorId: professor.id,
          content: "Welcome to CS101! Use this space for class questions and announcements.",
        },
        {
          subjectId: computerScience.id,
          authorId: alex.id,
          content: "Good morning, Professor! Will the lecture slides be posted here?",
        },
        {
          subjectId: computerScience.id,
          authorId: professor.id,
          content: "Yes, I’ll share them after each class.",
        },
        {
          subjectId: mathematics.id,
          authorId: professor.id,
          content: "Our first problem set is due next Friday. Feel free to discuss approaches here.",
        },
        {
          subjectId: communication.id,
          authorId: sam.id,
          content: "Does anyone want to form a study group for the presentation exercise?",
        },
      ],
    })
  }

  const taskCount = await prisma.task.count()
  if (taskCount === 0) {
    const oneWeekFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    await prisma.task.createMany({
      data: [
        {
          subjectId: computerScience.id,
          creatorId: professor.id,
          title: "Programming fundamentals exercise",
          description: "Complete the variables, conditionals, and loops exercises discussed in class.",
          dueAt: oneWeekFromNow,
          points: 50,
        },
        {
          subjectId: mathematics.id,
          creatorId: professor.id,
          title: "Problem Set 1",
          description: "Answer the assigned logic and set theory problems. Show your solution process.",
          dueAt: oneWeekFromNow,
          points: 100,
        },
        {
          subjectId: communication.id,
          creatorId: professor.id,
          title: "Presentation outline",
          description: "Prepare a one-page outline for your individual academic presentation.",
          dueAt: oneWeekFromNow,
          points: 25,
        },
      ],
    })
  }

  const materialCount = await prisma.learningMaterial.count()
  if (materialCount === 0) {
    await prisma.learningMaterial.createMany({
      data: [
        {
          subjectId: computerScience.id,
          creatorId: professor.id,
          title: "JavaScript learning guide",
          description: "Supplementary lessons and examples for our programming fundamentals topics.",
          url: "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting",
        },
        {
          subjectId: mathematics.id,
          creatorId: professor.id,
          title: "Discrete mathematics reference",
          description: "Use this as an additional reference for definitions and worked examples.",
          url: "https://mathworld.wolfram.com/DiscreteMathematics.html",
        },
        {
          subjectId: communication.id,
          creatorId: professor.id,
          title: "Academic writing resources",
          description: "Writing guidance and citation resources for your course outputs.",
          url: "https://owl.purdue.edu/owl/general_writing/academic_writing/index.html",
        },
      ],
    })
  }

  console.log("Demo data seeded successfully.")
  console.log(`Admin: ${adminEmail} / ${adminPassword}`)
  console.log(`Professor: ${professorEmail} / ${professorPassword}`)
  console.log(`Student: alex.student@example.edu / ${studentPassword}`)
  console.log(`Student: sam.student@example.edu / ${studentPassword}`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
