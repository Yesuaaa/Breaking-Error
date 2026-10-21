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
  overview: { title: "Administration overview", description: "Monitor and manage your classroom workspace." },
  accounts: { title: "Account management", description: "Create and review student, professor, and administrator accounts." },
  subjects: { title: "Subject chat management", description: "Create subject conversations and review their members." },
  import: { title: "Excel import", description: "Provision accounts, subject chats, and enrollments in bulk." },
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
    <main className="min-h-svh bg-[#fbfaf8] text-foreground">
      <header className="border-b-2 border-[#DAA520] bg-[#FFFFFF] shadow-sm">
        <div className="mx-auto flex min-h-16 max-w-7xl items-center gap-3 px-4 py-3 md:px-6">
          <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-[#800000] text-white ring-2 ring-[#DAA520]/40">
            <ShieldCheck className="size-5" />
          </div>
          <div className="min-w-0">
            <p className="font-semibold leading-tight text-[#800000]">Classroom Admin</p>
            <p className="truncate text-xs text-[#800000]/60">{session.user.email}</p>
          </div>
          <Button className="ml-auto text-[#800000] hover:bg-[#DAA520]/15" variant="ghost" size="icon" aria-label="Sign out" onClick={() => void signOut()}>
            <LogOut className="size-4" />
          </Button>
        </div>

        <nav className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 pb-3 md:px-6" aria-label="Admin pages">
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
                  "flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-[#800000] text-white"
                    : "text-[#800000]/70 hover:bg-[#DAA520]/15 hover:text-[#800000]",
                )}
              >
                <Icon className="size-4" />
                {item.label}
              </a>
            )
          })}
        </nav>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-8">
        <div className="mb-6">
          <p className="text-sm font-medium text-[#DAA520]">Administration</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-[#800000]">{details.title}</h1>
          <p className="mt-2 text-sm text-[#800000]/65">{details.description}</p>
        </div>
        {children}
      </div>
    </main>
  )
}
