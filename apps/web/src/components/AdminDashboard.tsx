import { useCallback, useEffect, useState } from "react"
import type { Session } from "@supabase/supabase-js"
import { AccountsPage } from "@/components/admin/AccountsPage"
import { AdminShell, type AdminPage } from "@/components/admin/AdminShell"
import { ImportPage } from "@/components/admin/ImportPage"
import { OverviewPage } from "@/components/admin/OverviewPage"
import { SubjectsPage } from "@/components/admin/SubjectsPage"
import { api, type AdminOverview } from "@/lib/api"

const pagePaths: Record<AdminPage, string> = {
  overview: "/admin",
  accounts: "/admin/accounts",
  subjects: "/admin/subjects",
  import: "/admin/import",
}

function pageFromPath(pathname: string): AdminPage {
  if (pathname.startsWith("/admin/accounts")) return "accounts"
  if (pathname.startsWith("/admin/subjects")) return "subjects"
  if (pathname.startsWith("/admin/import")) return "import"
  return "overview"
}

export function AdminDashboard({ session }: { session: Session }) {
  const [page, setPage] = useState<AdminPage>(() => pageFromPath(window.location.pathname))
  const [overview, setOverview] = useState<AdminOverview | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [notice, setNotice] = useState("")

  const refresh = useCallback(async () => {
    setError("")
    try {
      setOverview(await api.adminOverview())
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not load admin data")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  useEffect(() => {
    const handleHistoryChange = () => setPage(pageFromPath(window.location.pathname))
    window.addEventListener("popstate", handleHistoryChange)
    return () => window.removeEventListener("popstate", handleHistoryChange)
  }, [])

  function navigate(nextPage: AdminPage) {
    if (nextPage !== page) {
      window.history.pushState({}, "", pagePaths[nextPage])
      setPage(nextPage)
    }
    setError("")
    setNotice("")
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  function showSuccess(message: string) {
    setError("")
    setNotice(message)
  }

  function showError(message: string) {
    setNotice("")
    setError(message)
  }

  const data = overview ?? { subjects: [], profiles: [] }

  return (
    <AdminShell session={session} page={page} onNavigate={navigate}>
      {(error || notice) && (
        <div
          role="status"
          className={`mb-6 rounded-lg border px-4 py-3 text-sm ${
            error
              ? "border-destructive/40 bg-destructive/10 text-destructive"
              : "border-[#DAA520]/50 bg-[#DAA520]/10 text-[#800000]"
          }`}
        >
          {error || notice}
        </div>
      )}

      {loading && !overview ? (
        <div className="grid min-h-72 place-items-center rounded-xl border border-[#800000]/15 bg-white text-sm text-[#800000]/60">
          Loading administration data…
        </div>
      ) : page === "accounts" ? (
        <AccountsPage overview={data} onChanged={refresh} onSuccess={showSuccess} onError={showError} />
      ) : page === "subjects" ? (
        <SubjectsPage overview={data} onChanged={refresh} onSuccess={showSuccess} onError={showError} />
      ) : page === "import" ? (
        <ImportPage onChanged={refresh} onSuccess={showSuccess} onError={showError} />
      ) : (
        <OverviewPage overview={data} onNavigate={navigate} />
      )}
    </AdminShell>
  )
}
