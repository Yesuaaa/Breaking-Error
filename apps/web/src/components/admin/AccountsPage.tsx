import type { FormEvent } from "react"
import { useMemo, useState } from "react"
import { ShieldCheck, UserPlus, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { actionClass, fieldClass, panelClass, SearchField, SectionHeading } from "@/components/admin/shared"
import { api, type AdminOverview } from "@/lib/api"

type Props = { overview: AdminOverview; onChanged: () => Promise<void>; onSuccess: (message: string) => void; onError: (message: string) => void }

export function AccountsPage({ overview, onChanged, onSuccess, onError }: Props) {
  const [query, setQuery] = useState("")
  const [busy, setBusy] = useState(false)
  const enrollments = useMemo(() => {
    const result = new Map<string, number>()
    overview.subjects.forEach((subject) => subject.memberships.forEach(({ profile }) => result.set(profile.id, (result.get(profile.id) ?? 0) + 1)))
    return result
  }, [overview.subjects])
  const filtered = overview.profiles.filter((profile) => `${profile.name ?? ""} ${profile.email} ${profile.accountRole}`.toLowerCase().includes(query.trim().toLowerCase()))

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)
    const subjectId = String(data.get("subjectId") ?? "")
    setBusy(true)
    try {
      await api.createAccount({
        email: String(data.get("email")), name: String(data.get("name")), password: String(data.get("password")), accountRole: String(data.get("accountRole")) as "USER" | "ADMIN",
        ...(subjectId ? { subjectId, membershipRole: String(data.get("membershipRole")) as "STUDENT" | "PROFESSOR" } : {}),
      })
      form.reset()
      onSuccess("Account created and enrollment saved.")
      await onChanged()
    } catch (cause) {
      onError(cause instanceof Error ? cause.message : "Could not create account")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={submit} className={panelClass}>
        <SectionHeading title="Create an account" description="Set login details and optionally enroll the user in a subject." />
        <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3">
          <label className="text-sm font-medium text-[#800000]">Full name<input className={fieldClass} name="name" required /></label>
          <label className="text-sm font-medium text-[#800000]">Email<input className={fieldClass} name="email" type="email" required /></label>
          <label className="text-sm font-medium text-[#800000]">Temporary password<input className={fieldClass} name="password" type="password" minLength={8} required /></label>
          <label className="text-sm font-medium text-[#800000]">Account type<select className={fieldClass} name="accountRole"><option value="USER">Classroom user</option><option value="ADMIN">Administrator</option></select></label>
          <label className="text-sm font-medium text-[#800000]">Enroll in subject<select className={fieldClass} name="subjectId"><option value="">No subject</option>{overview.subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.code} — {subject.section}</option>)}</select></label>
          <label className="text-sm font-medium text-[#800000]">Classroom role<select className={fieldClass} name="membershipRole"><option value="STUDENT">Student</option><option value="PROFESSOR">Professor</option></select></label>
        </div>
        <div className="border-t border-[#800000]/10 px-5 py-4"><Button className={actionClass} type="submit" disabled={busy}><UserPlus className="size-4" /> {busy ? "Creating…" : "Create account"}</Button></div>
      </form>

      <section className={`${panelClass} overflow-hidden`}>
        <SectionHeading title="All accounts" description={`${overview.profiles.length} accounts in the system`} action={<SearchField value={query} onChange={setQuery} placeholder="Search accounts" />} />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead className="bg-[#DAA520]/10 text-xs uppercase tracking-wide text-[#800000]/60"><tr><th className="px-5 py-3 font-medium">Account</th><th className="px-5 py-3 font-medium">Type</th><th className="px-5 py-3 font-medium">Enrollments</th><th className="px-5 py-3 font-medium">Status</th></tr></thead>
            <tbody className="divide-y divide-[#800000]/10">
              {filtered.map((profile) => <tr key={profile.id} className="hover:bg-[#DAA520]/5"><td className="px-5 py-4"><p className="font-medium text-[#800000]">{profile.name ?? "Unnamed account"}</p><p className="text-xs text-[#800000]/55">{profile.email}</p></td><td className="px-5 py-4"><span className="inline-flex items-center gap-1.5 rounded-full bg-[#DAA520]/15 px-2.5 py-1 text-xs font-medium text-[#800000]">{profile.accountRole === "ADMIN" ? <ShieldCheck className="size-3.5" /> : <Users className="size-3.5" />}{profile.accountRole === "ADMIN" ? "Administrator" : "Classroom user"}</span></td><td className="px-5 py-4 text-[#800000]/60">{enrollments.get(profile.id) ?? 0} subjects</td><td className="px-5 py-4 text-xs font-medium text-[#800000]"><span className="mr-1.5 inline-block size-1.5 rounded-full bg-[#DAA520]" />Active</td></tr>)}
            </tbody>
          </table>
          {!filtered.length && <p className="px-5 py-10 text-center text-sm text-[#800000]/55">No accounts match your search.</p>}
        </div>
      </section>
    </div>
  )
}
