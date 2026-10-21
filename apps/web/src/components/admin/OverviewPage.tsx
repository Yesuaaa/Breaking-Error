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
          <div className="flex items-center justify-between border-b border-[#eee7df] px-5 py-4">
            <div><h2 className="font-bold text-[#800000]">Current subject chats</h2><p className="text-sm text-[#78716c]">Recently configured subject conversations</p></div>
            <button type="button" onClick={() => onNavigate("subjects")} className="flex items-center gap-1 text-sm font-semibold text-[#800000] hover:text-[#DAA520]">View all <ArrowRight className="size-4" /></button>
          </div>
          <div className="divide-y divide-[#eee7df]">
            {overview.subjects.slice(0, 5).map((subject) => (
              <div key={subject.id} className="flex items-center gap-3 px-5 py-4">
                <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-[#800000]/10 text-xs font-bold text-[#800000]">{subject.code.slice(0, 3)}</div>
                <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-[#292524]">{subject.code} · {subject.name}</p><p className="truncate text-xs text-[#78716c]">{subject.section} · {subject.term}</p></div>
                <span className="shrink-0 text-xs text-[#78716c]">{subject.memberships.length} members</span>
              </div>
            ))}
            {!overview.subjects.length && <p className="px-5 py-10 text-center text-sm text-[#78716c]">No subject chats created yet.</p>}
          </div>
        </div>

        <div className={`${panelClass} p-5`}>
          <h2 className="font-bold text-[#800000]">Quick actions</h2>
          <p className="mt-1 text-sm text-[#78716c]">Open a management page.</p>
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
  return <div className={`${panelClass} p-5`}><div className="grid size-9 place-items-center rounded-lg bg-[#800000]/10"><Icon className="size-5 text-[#800000]" /></div><p className="mt-4 text-3xl font-bold text-[#800000]">{value}</p><p className="text-sm text-[#78716c]">{label}</p></div>
}

function QuickAction({ icon: Icon, label, onClick }: { icon: ComponentType<{ className?: string }>; label: string; onClick: () => void }) {
  return <button type="button" onClick={onClick} className="flex w-full items-center gap-3 rounded-lg border border-[#e7e0d8] px-3 py-3 text-left text-sm text-[#44403c] transition-colors hover:border-[#DAA520] hover:bg-[#fffdf0] hover:text-[#800000]"><Icon className="size-4 text-[#DAA520]" /><span className="flex-1 font-semibold">{label}</span><ArrowRight className="size-4 text-[#800000]" /></button>
}
