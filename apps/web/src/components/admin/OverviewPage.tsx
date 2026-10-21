import type { ComponentType } from "react"
import { ArrowRight, BookOpen, FileSpreadsheet, ShieldCheck, UserPlus, Users } from "lucide-react"
import type { AdminPage } from "@/components/admin/AdminShell"
import { panelClass } from "@/components/admin/shared"
import type { AdminOverview } from "@/lib/api"

export function OverviewPage({ overview, onNavigate }: { overview: AdminOverview; onNavigate: (page: AdminPage) => void }) {
  const classroomUsers = overview.profiles.filter((profile) => profile.accountRole === "USER").length
  const administrators = overview.profiles.filter((profile) => profile.accountRole === "ADMIN").length
  const enrollments = overview.subjects.reduce((total, subject) => total + subject.memberships.length, 0)

  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Metric icon={BookOpen} value={overview.subjects.length} label="Subject chats" />
        <Metric icon={Users} value={classroomUsers} label="Classroom users" />
        <Metric icon={UserPlus} value={enrollments} label="Enrollments" />
        <Metric icon={ShieldCheck} value={administrators} label="Administrators" />
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
        <div className={`${panelClass} overflow-hidden`}>
          <div className="flex items-center justify-between border-b px-5 py-4">
            <div><h2 className="font-semibold">Current subject chats</h2><p className="text-sm text-muted-foreground">Recently configured subject conversations</p></div>
            <button type="button" onClick={() => onNavigate("subjects")} className="flex items-center gap-1 text-sm font-medium hover:underline">View all <ArrowRight className="size-4" /></button>
          </div>
          <div className="divide-y">
            {overview.subjects.slice(0, 5).map((subject) => (
              <div key={subject.id} className="flex items-center gap-3 px-5 py-4">
                <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-muted text-xs font-bold">{subject.code.slice(0, 3)}</div>
                <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{subject.code} · {subject.name}</p><p className="truncate text-xs text-muted-foreground">{subject.section} · {subject.term}</p></div>
                <span className="shrink-0 text-xs text-muted-foreground">{subject.memberships.length} members</span>
              </div>
            ))}
            {!overview.subjects.length && <p className="px-5 py-10 text-center text-sm text-muted-foreground">No subject chats created yet.</p>}
          </div>
        </div>

        <div className={`${panelClass} p-5`}>
          <h2 className="font-semibold">Quick actions</h2>
          <p className="mt-1 text-sm text-muted-foreground">Open a management page.</p>
          <div className="mt-5 space-y-2">
            <QuickAction icon={UserPlus} label="Create an account" onClick={() => onNavigate("accounts")} />
            <QuickAction icon={BookOpen} label="Create a subject chat" onClick={() => onNavigate("subjects")} />
            <QuickAction icon={FileSpreadsheet} label="Import a workbook" onClick={() => onNavigate("import")} />
          </div>
        </div>
      </section>
    </div>
  )
}

function Metric({ icon: Icon, value, label }: { icon: ComponentType<{ className?: string }>; value: number; label: string }) {
  return <div className={`${panelClass} p-5`}><Icon className="size-5 text-muted-foreground" /><p className="mt-4 text-3xl font-semibold">{value}</p><p className="text-sm text-muted-foreground">{label}</p></div>
}

function QuickAction({ icon: Icon, label, onClick }: { icon: ComponentType<{ className?: string }>; label: string; onClick: () => void }) {
  return <button type="button" onClick={onClick} className="flex w-full items-center gap-3 rounded-lg border px-3 py-3 text-left text-sm transition-colors hover:bg-muted"><Icon className="size-4" /><span className="flex-1 font-medium">{label}</span><ArrowRight className="size-4" /></button>
}
