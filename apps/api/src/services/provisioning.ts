import type { AccountRole, MembershipRole } from "@prisma/client"
import type { User } from "@supabase/supabase-js"
import { prisma } from "../lib/prisma.js"
import { supabaseAdmin } from "../lib/supabase.js"

export type AccountInput = {
  email: string
  name: string
  password: string
  accountRole?: AccountRole
}

export class ProvisioningError extends Error {}

async function findAuthUser(email: string): Promise<User | undefined> {
  if (!supabaseAdmin) throw new Error("Supabase is not configured")

  let page = 1
  while (true) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage: 100 })
    if (error) throw error
    const user = data.users.find((item) => item.email?.toLowerCase() === email.toLowerCase())
    if (user) return user
    if (data.users.length < 100) return undefined
    page += 1
  }
}

export async function provisionAccount(input: AccountInput) {
  if (!supabaseAdmin) throw new Error("Supabase is not configured")

  let authUser = await findAuthUser(input.email)
  let created = false

  if (!authUser) {
    const result = await supabaseAdmin.auth.admin.createUser({
      email: input.email,
      password: input.password,
      email_confirm: true,
      user_metadata: { full_name: input.name },
    })
    if (result.error) throw result.error
    authUser = result.data.user
    created = true
  }

  const profile = await prisma.profile.upsert({
    where: { id: authUser.id },
    update: { email: input.email, name: input.name, accountRole: input.accountRole ?? "USER" },
    create: {
      id: authUser.id,
      email: input.email,
      name: input.name,
      accountRole: input.accountRole ?? "USER",
    },
  })

  return { profile, created }
}

export async function provisionSubject(input: { code: string; name: string; section: string; term: string }) {
  const code = input.code.trim().toUpperCase()
  const existing = await prisma.subject.findUnique({
    where: { code_section_term: { code, section: input.section, term: input.term } },
  })
  if (existing) return { subject: existing, created: false }

  const subject = await prisma.subject.create({
    data: { code, name: input.name, section: input.section, term: input.term },
  })
  return { subject, created: true }
}

export async function provisionMembership(
  profileId: string,
  subjectId: string,
  role: MembershipRole,
) {
  return prisma.membership.upsert({
    where: { profileId_subjectId: { profileId, subjectId } },
    update: { role },
    create: { profileId, subjectId, role },
  })
}
