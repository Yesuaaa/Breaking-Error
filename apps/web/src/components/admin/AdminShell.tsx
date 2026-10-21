import type { MouseEvent, ReactNode } from "react"
import type { Session } from "@supabase/supabase-js"
import { BookOpen, FileSpreadsheet, LayoutDashboard, LogOut, ShieldCheck, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { cn } from "@/lib/utils"

export type AdminPage = "overview" | "accounts" | "subjects" | "import"

const items = [
  { page: "overview" as const, label: "Overview", path: "/admin", icon: LayoutDashboard },
  { page: "accounts" as const, label: "Accounts", path: "/admin/accounts", icon: Users },
  { page: "subjects" as const, label: "Subject chats", path: "/admin/subjects", icon: BookOpen },
  { page: "import" as const, label: "Excel import", path: "/admin/import", icon: FileSpreadsheet },
]

const pageDetails: Record<AdminPage, { title: string; description: string }> = {
  overview: { title: "Overview", description: "A quick look at your classroom workspace." },
  accounts: { title: "Accounts", description: "Create and review school accounts." },
  subjects: { title: "Subject chats", description: "Create conversations and review their members." },
  import: { title: "Excel import", description: "Create accounts and subject enrollments in bulk." },
}

type Props = {
  session: Session
  page: AdminPage
  onNavigate: (page: AdminPage) => void
  children: ReactNode
}

export function AdminShell({ session, page, onNavigate, children }: Props) {
  const details = pageDetails[page]

  function follow(event: MouseEvent<HTMLAnchorElement>, destination: AdminPage) {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return
    event.preventDefault()
    onNavigate(destination)
  }

  async function signOut() {
    await supabase.auth.signOut()
    window.history.replaceState({}, "", "/")
  }

  return (
    <main className="h-svh bg-[#fbf9f6] text-[#1c1917] md:grid md:grid-cols-[280px_1fr]">
      <aside className="hidden min-h-0 border-r border-[#e7e0d8] bg-[#fffdfa] md:flex md:flex-col">
        <div className="flex h-16 items-center gap-3 border-b border-[#e7e0d8] px-5">
          <div className="grid size-9 place-items-center rounded-lg bg-gradient-to-br from-[#800000] to-[#550000] text-[#FFDF00] shadow-sm ring-1 ring-[#DAA520]/40">
            <ShieldCheck className="size-5" />
          </div>
          <div>
            <p className="font-bold leading-tight text-[#800000]">Syncademia</p>
            <p className="text-xs text-[#78716c]">Administration</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3" aria-label="Admin pages">
          <p className="px-2 pb-2 pt-1 text-xs font-bold uppercase tracking-wider text-[#800000]/65">Manage</p>
          {items.map((item) => {
            const Icon = item.icon
            const active = item.page === page
            return (
              <a
                key={item.page}
                href={item.path}
                onClick={(event) => follow(event, item.page)}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                  active
                    ? "bg-[#800000] font-semibold text-white shadow-sm ring-1 ring-[#DAA520]/40"
                    : "text-[#78716c] hover:bg-[#800000]/5 hover:text-[#800000]",
                )}
              >
                <Icon className="size-4" />
                {item.label}
              </a>
            )
          })}
        </nav>

        <div className="flex items-center gap-3 border-t border-[#e7e0d8] p-4">
          <div className="grid size-9 shrink-0 place-items-center rounded-full bg-[#800000] text-sm font-bold text-[#FFDF00] ring-2 ring-[#DAA520]/30">
            {session.user.email?.[0]?.toUpperCase() ?? "A"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-[#800000]">Administrator</p>
            <p className="truncate text-xs text-[#78716c]">{session.user.email}</p>
          </div>
          <Button variant="ghost" size="icon" aria-label="Sign out" onClick={() => void signOut()} className="text-[#800000] hover:bg-[#800000]/10 hover:text-[#680000]">
            <LogOut className="size-4" />
          </Button>
        </div>
      </aside>

      <section className="flex min-h-0 flex-col">
        <header className="flex min-h-16 items-center gap-3 border-b border-[#660000] bg-gradient-to-r from-[#800000] via-[#730000] to-[#550000] px-4 text-white shadow-sm md:px-6">
          <div className="grid size-9 place-items-center rounded-lg bg-white/10 text-[#FFDF00] ring-1 ring-[#DAA520]/50 md:hidden">
            <ShieldCheck className="size-4" />
          </div>
          <div className="min-w-0">
            <h1 className="truncate font-bold">{details.title}</h1>
            <p className="truncate text-xs text-[#FFDF00]/85">{details.description}</p>
          </div>
          <select
            className="ml-auto h-9 max-w-36 rounded-md border border-[#DAA520]/60 bg-white px-2 text-sm text-[#800000] outline-none md:hidden"
            value={page}
            aria-label="Admin page"
            onChange={(event) => onNavigate(event.target.value as AdminPage)}
          >
            {items.map((item) => <option key={item.page} value={item.page}>{item.label}</option>)}
          </select>
          <Button className="text-white hover:bg-white/15 hover:text-white md:hidden" variant="ghost" size="icon" aria-label="Sign out" onClick={() => void signOut()}>
            <LogOut className="size-4" />
          </Button>
        </header>

        <div className="flex-1 overflow-y-auto bg-gradient-to-b from-[#f7f3ed] to-[#fffdfa] p-4 md:p-6">
          <div className="mx-auto max-w-6xl">{children}</div>
        </div>
      </section>
    </main>
  )
}
