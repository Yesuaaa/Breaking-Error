import type { FormEvent } from "react"
import { useEffect, useState } from "react"
import type { Session } from "@supabase/supabase-js"
import {
  BookOpen,
  Download,
  FileSpreadsheet,
  GraduationCap,
  LogOut,
  RefreshCw,
  ShieldCheck,
  UserPlus,
  Users,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { api, type AdminOverview, type ImportResult } from "@/lib/api"
import { supabase } from "@/lib/supabase"

const fieldClass =
  "mt-1.5 h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"

export function AdminDashboard({ session }: { session: Session }) {
  const [overview, setOverview] = useState<AdminOverview | null>(null)
  const [error, setError] = useState("")
  const [notice, setNotice] = useState("")
  const [busy, setBusy] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [importResult, setImportResult] = useState<ImportResult | null>(null)

  async function refresh() {
    try {
      setOverview(await api.adminOverview())
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not load admin data")
    }
  }

  useEffect(() => {
    void refresh()
  }, [])

  async function createSubject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)
    setBusy(true)
    setError("")
    try {
      await api.createSubject({
        code: String(data.get("code")),
        name: String(data.get("name")),
        section: String(data.get("section")),
        term: String(data.get("term")),
      })
      form.reset()
      setNotice("Subject chat created.")
      await refresh()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not create subject")
    } finally {
      setBusy(false)
    }
  }

  async function createAccount(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)
    const subjectId = String(data.get("subjectId") ?? "")
    setBusy(true)
    setError("")
    try {
      await api.createAccount({
        email: String(data.get("email")),
        name: String(data.get("name")),
        password: String(data.get("password")),
        accountRole: String(data.get("accountRole")) as "USER" | "ADMIN",
        ...(subjectId
          ? {
              subjectId,
              membershipRole: String(data.get("membershipRole")) as "STUDENT" | "PROFESSOR",
            }
          : {}),
      })
      form.reset()
      setNotice("Account created and enrollment saved.")
      await refresh()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not create account")
    } finally {
      setBusy(false)
    }
  }

  async function importWorkbook(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!file) return
    setBusy(true)
    setError("")
    setImportResult(null)
    try {
      const result = await api.importWorkbook(file)
      setImportResult(result)
      setNotice("Workbook imported successfully.")
      setFile(null)
      await refresh()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not import workbook")
    } finally {
      setBusy(false)
    }
  }

  async function downloadTemplate() {
    setError("")
    try {
      const blob = await api.downloadImportTemplate()
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement("a")
      anchor.href = url
      anchor.download = "account-import-template.xlsx"
      anchor.click()
      URL.revokeObjectURL(url)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not download template")
    }
  }

  return (
    <main className="min-h-svh bg-muted/30 text-foreground">
      <header className="border-b bg-background">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 md:px-6">
          <div className="grid size-9 place-items-center rounded-lg bg-primary text-primary-foreground">
            <ShieldCheck className="size-5" />
          </div>
          <div>
            <p className="font-semibold leading-tight">Classroom Admin</p>
            <p className="text-xs text-muted-foreground">Account and subject provisioning</p>
          </div>
          <div className="ml-auto hidden text-right sm:block">
            <p className="text-sm font-medium">System Administrator</p>
            <p className="text-xs text-muted-foreground">{session.user.email}</p>
          </div>
          <Button variant="ghost" size="icon" aria-label="Sign out" onClick={() => void supabase.auth.signOut()}>
            <LogOut className="size-4" />
          </Button>
        </div>
      </header>

      <div className="mx-auto max-w-7xl space-y-6 p-4 md:p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Prototype administration</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight">Manage the classroom</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Create subject chats and provision professor or student accounts.
            </p>
          </div>
          <Button variant="outline" onClick={() => void refresh()}>
            <RefreshCw className="size-4" /> Refresh
          </Button>
        </div>

        {(error || notice) && (
          <div className={`rounded-lg border px-4 py-3 text-sm ${error ? "border-destructive/40 bg-destructive/10 text-destructive" : "bg-card"}`}>
            {error || notice}
          </div>
        )}

        <section className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border bg-card p-5">
            <BookOpen className="size-5 text-muted-foreground" />
            <p className="mt-4 text-3xl font-semibold">{overview?.subjects.length ?? 0}</p>
            <p className="text-sm text-muted-foreground">Subject chats</p>
          </div>
          <div className="rounded-xl border bg-card p-5">
            <Users className="size-5 text-muted-foreground" />
            <p className="mt-4 text-3xl font-semibold">{overview?.profiles.filter((profile) => profile.accountRole === "USER").length ?? 0}</p>
            <p className="text-sm text-muted-foreground">Professor and student accounts</p>
          </div>
          <div className="rounded-xl border bg-card p-5">
            <ShieldCheck className="size-5 text-muted-foreground" />
            <p className="mt-4 text-3xl font-semibold">{overview?.profiles.filter((profile) => profile.accountRole === "ADMIN").length ?? 0}</p>
            <p className="text-sm text-muted-foreground">Administrators</p>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <form onSubmit={createSubject} className="rounded-xl border bg-card p-5 md:p-6">
            <div className="flex items-center gap-3">
              <div className="grid size-10 place-items-center rounded-lg bg-muted"><GraduationCap className="size-5" /></div>
              <div><h2 className="font-semibold">Create subject chat</h2><p className="text-sm text-muted-foreground">One group conversation is created per subject.</p></div>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-medium">Subject code<input className={fieldClass} name="code" placeholder="CS101" required /></label>
              <label className="text-sm font-medium">Section<input className={fieldClass} name="section" placeholder="BSCS 1-A" required /></label>
              <label className="text-sm font-medium sm:col-span-2">Subject name<input className={fieldClass} name="name" placeholder="Introduction to Computer Science" required /></label>
              <label className="text-sm font-medium sm:col-span-2">Term<input className={fieldClass} name="term" placeholder="1st Semester 2026-2027" required /></label>
            </div>
            <Button className="mt-5" type="submit" disabled={busy}>Create subject</Button>
          </form>

          <form onSubmit={createAccount} className="rounded-xl border bg-card p-5 md:p-6">
            <div className="flex items-center gap-3">
              <div className="grid size-10 place-items-center rounded-lg bg-muted"><UserPlus className="size-5" /></div>
              <div><h2 className="font-semibold">Create account</h2><p className="text-sm text-muted-foreground">Optionally enroll the account immediately.</p></div>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-medium">Full name<input className={fieldClass} name="name" required /></label>
              <label className="text-sm font-medium">Email<input className={fieldClass} name="email" type="email" required /></label>
              <label className="text-sm font-medium">Temporary password<input className={fieldClass} name="password" type="password" minLength={8} required /></label>
              <label className="text-sm font-medium">Account type<select className={fieldClass} name="accountRole"><option value="USER">Classroom user</option><option value="ADMIN">Administrator</option></select></label>
              <label className="text-sm font-medium">Enroll in subject<select className={fieldClass} name="subjectId"><option value="">No subject</option>{overview?.subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.code} — {subject.name}</option>)}</select></label>
              <label className="text-sm font-medium">Classroom role<select className={fieldClass} name="membershipRole"><option value="STUDENT">Student</option><option value="PROFESSOR">Professor</option></select></label>
            </div>
            <Button className="mt-5" type="submit" disabled={busy}>Create account</Button>
          </form>
        </section>

        <section className="rounded-xl border bg-card p-5 md:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="grid size-10 place-items-center rounded-lg bg-emerald-500/10 text-emerald-700"><FileSpreadsheet className="size-5" /></div>
              <div><h2 className="font-semibold">Import from Excel</h2><p className="text-sm text-muted-foreground">Each row creates or updates an account, subject, and enrollment.</p></div>
            </div>
            <Button variant="outline" type="button" onClick={() => void downloadTemplate()}><Download className="size-4" /> Download template</Button>
          </div>
          <form onSubmit={importWorkbook} className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-end">
            <label className="flex-1 text-sm font-medium">Excel workbook (.xlsx)<input className={`${fieldClass} pt-2`} type="file" accept=".xlsx" required onChange={(event) => setFile(event.target.files?.[0] ?? null)} /></label>
            <Button type="submit" disabled={!file || busy}>Import workbook</Button>
          </form>
          {importResult && (
            <p className="mt-4 rounded-lg bg-muted px-4 py-3 text-sm">
              Processed {importResult.rowsProcessed} rows, {importResult.accountsProcessed} accounts, and {importResult.membershipsProcessed} enrollments. Created {importResult.accountsCreated} new accounts and {importResult.subjectsCreated} new subjects.
            </p>
          )}
        </section>

        <section className="rounded-xl border bg-card">
          <div className="border-b px-5 py-4"><h2 className="font-semibold">Current subject chats</h2></div>
          <div className="divide-y">
            {overview?.subjects.map((subject) => (
              <div key={subject.id} className="p-5">
                <div className="flex flex-wrap justify-between gap-2">
                  <div><p className="font-semibold">{subject.code} · {subject.name}</p><p className="text-sm text-muted-foreground">{subject.section} · {subject.term}</p></div>
                  <span className="text-sm text-muted-foreground">{subject.memberships.length} members</span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {subject.memberships.map(({ profile, role }) => (
                    <span key={profile.id} className="rounded-full bg-muted px-3 py-1 text-xs">{profile.name ?? profile.email} · {role.toLowerCase()}</span>
                  ))}
                  {!subject.memberships.length && <span className="text-sm text-muted-foreground">No members assigned.</span>}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}
