import type { FormEvent } from "react"
import { useState } from "react"
import { BookOpen, GraduationCap, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { actionClass, fieldClass, panelClass, SearchField, SectionHeading } from "@/components/admin/shared"
import { api, type AdminOverview } from "@/lib/api"

type Props = { overview: AdminOverview; onChanged: () => Promise<void>; onSuccess: (message: string) => void; onError: (message: string) => void }

export function SubjectsPage({ overview, onChanged, onSuccess, onError }: Props) {
  const [query, setQuery] = useState("")
  const [busy, setBusy] = useState(false)
  const filtered = overview.subjects.filter((subject) => `${subject.code} ${subject.name} ${subject.section} ${subject.term}`.toLowerCase().includes(query.trim().toLowerCase()))

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)
    setBusy(true)
    try {
      await api.createSubject({ code: String(data.get("code")), name: String(data.get("name")), section: String(data.get("section")), term: String(data.get("term")) })
      form.reset()
      onSuccess("Subject chat created.")
      await onChanged()
    } catch (cause) {
      onError(cause instanceof Error ? cause.message : "Could not create subject")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={submit} className={panelClass}>
        <SectionHeading title="Create a subject chat" description="Create one group conversation for a subject, section, and term." />
        <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4">
          <label className="text-sm font-medium text-[#800000]">Subject code<input className={fieldClass} name="code" placeholder="CS101" required /></label>
          <label className="text-sm font-medium text-[#800000] lg:col-span-2">Subject name<input className={fieldClass} name="name" placeholder="Introduction to Computer Science" required /></label>
          <label className="text-sm font-medium text-[#800000]">Section<input className={fieldClass} name="section" placeholder="BSCS 1-A" required /></label>
          <label className="text-sm font-medium text-[#800000] sm:col-span-2 lg:col-span-4">Term<input className={fieldClass} name="term" placeholder="1st Semester 2026-2027" required /></label>
        </div>
        <div className="border-t border-[#800000]/10 px-5 py-4"><Button className={actionClass} type="submit" disabled={busy}><GraduationCap className="size-4" /> {busy ? "Creating…" : "Create subject chat"}</Button></div>
      </form>

      <section className={`${panelClass} overflow-hidden`}>
        <SectionHeading title="All subject chats" description={`${overview.subjects.length} conversations`} action={<SearchField value={query} onChange={setQuery} placeholder="Search subjects" />} />
        <div className="grid gap-4 p-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((subject) => (
            <article key={subject.id} className="rounded-lg border border-[#800000]/15 p-4 transition-colors hover:bg-[#DAA520]/5">
              <div className="flex items-start gap-3"><div className="grid size-10 shrink-0 place-items-center rounded-lg bg-[#DAA520]/15 text-[#800000]"><BookOpen className="size-5" /></div><div className="min-w-0"><p className="font-semibold text-[#800000]">{subject.code}</p><p className="truncate text-sm text-[#800000]/60">{subject.name}</p></div></div>
              <dl className="mt-4 grid grid-cols-2 gap-3 rounded-md bg-[#DAA520]/10 p-3 text-xs"><div><dt className="text-[#800000]/55">Section</dt><dd className="mt-1 font-medium text-[#800000]">{subject.section}</dd></div><div><dt className="text-[#800000]/55">Term</dt><dd className="mt-1 truncate font-medium text-[#800000]">{subject.term}</dd></div></dl>
              <p className="mt-4 flex items-center gap-1.5 text-sm text-[#800000]/60"><Users className="size-4" /> {subject.memberships.length} members</p>
            </article>
          ))}
        </div>
        {!filtered.length && <p className="px-5 py-10 text-center text-sm text-[#800000]/55">No subject chats match your search.</p>}
      </section>
    </div>
  )
}
