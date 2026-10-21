import { supabase } from "@/lib/supabase"

const apiUrl = import.meta.env.VITE_API_URL ?? "/api"

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const { data } = await supabase.auth.getSession()
  const isFormData = init?.body instanceof FormData
  const response = await fetch(`${apiUrl}${path}`, {
    ...init,
    headers: {
      ...(!isFormData ? { "Content-Type": "application/json" } : {}),
      ...init?.headers,
      ...(data.session?.access_token
        ? { Authorization: `Bearer ${data.session.access_token}` }
        : {}),
    },
  })

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { error?: string } | null
    throw new Error(body?.error ?? `Request failed with status ${response.status}`)
  }

  return response.json() as Promise<T>
}

export type Subject = {
  id: string
  code: string
  name: string
  section: string
  term: string
  role: "STUDENT" | "PROFESSOR"
  memberCount: number
}

export type Message = {
  id: string
  content: string
  authorId: string
  createdAt: string
  author: { id: string; name: string | null }
}

export type SubjectTask = {
  id: string
  title: string
  description: string | null
  dueAt: string | null
  points: number | null
  createdAt: string
  creator: { id: string; name: string | null }
}

export type LearningMaterial = {
  id: string
  title: string
  description: string | null
  url: string
  createdAt: string
  creator: { id: string; name: string | null }
}

export type Profile = {
  id: string
  email: string
  name: string | null
  accountRole: "USER" | "ADMIN"
}

export type AdminSubject = {
  id: string
  code: string
  name: string
  section: string
  term: string
  memberships: Array<{
    role: "STUDENT" | "PROFESSOR"
    profile: Pick<Profile, "id" | "email" | "name">
  }>
}

export type AdminOverview = {
  subjects: AdminSubject[]
  profiles: Profile[]
}

export type ImportResult = {
  rowsProcessed: number
  accountsProcessed: number
  accountsCreated: number
  subjectsCreated: number
  membershipsProcessed: number
}

export const api = {
  me: () => request<Profile>("/me"),
  subjects: () => request<Subject[]>("/subjects"),
  messages: (subjectId: string) =>
    request<Message[]>(`/subjects/${subjectId}/messages`),
  sendMessage: (subjectId: string, content: string) =>
    request<Message>(`/subjects/${subjectId}/messages`, {
      method: "POST",
      body: JSON.stringify({ content }),
    }),
  tasks: (subjectId: string) =>
    request<SubjectTask[]>(`/subjects/${subjectId}/tasks`),
  createTask: (subjectId: string, input: {
    title: string
    description?: string
    dueAt?: string | null
    points?: number | null
  }) => request<SubjectTask>(`/subjects/${subjectId}/tasks`, {
    method: "POST",
    body: JSON.stringify(input),
  }),
  deleteTask: (subjectId: string, taskId: string) =>
    request<{ id: string }>(`/subjects/${subjectId}/tasks/${taskId}`, { method: "DELETE" }),
  materials: (subjectId: string) =>
    request<LearningMaterial[]>(`/subjects/${subjectId}/materials`),
  createMaterial: (subjectId: string, input: {
    title: string
    description?: string
    url: string
  }) => request<LearningMaterial>(`/subjects/${subjectId}/materials`, {
    method: "POST",
    body: JSON.stringify(input),
  }),
  deleteMaterial: (subjectId: string, materialId: string) =>
    request<{ id: string }>(`/subjects/${subjectId}/materials/${materialId}`, { method: "DELETE" }),
  adminOverview: () => request<AdminOverview>("/admin/overview"),
  createSubject: (input: { code: string; name: string; section: string; term: string }) =>
    request<AdminSubject>("/admin/subjects", { method: "POST", body: JSON.stringify(input) }),
  createAccount: (input: {
    email: string
    name: string
    password: string
    accountRole: "USER" | "ADMIN"
    subjectId?: string
    membershipRole?: "STUDENT" | "PROFESSOR"
  }) => request<Profile>("/admin/accounts", { method: "POST", body: JSON.stringify(input) }),
  importWorkbook: (file: File) => {
    const body = new FormData()
    body.append("file", file)
    return request<ImportResult>("/admin/import", { method: "POST", body })
  },
  downloadImportTemplate: async () => {
    const { data } = await supabase.auth.getSession()
    const response = await fetch(`${apiUrl}/admin/import-template`, {
      headers: data.session?.access_token
        ? { Authorization: `Bearer ${data.session.access_token}` }
        : {},
    })
    if (!response.ok) throw new Error("Could not download the import template")
    return response.blob()
  },
}
