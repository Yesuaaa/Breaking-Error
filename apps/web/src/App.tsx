import type { FormEvent } from "react"
import { useEffect, useRef, useState } from "react"
import type { Session } from "@supabase/supabase-js"
import { BookOpen, GraduationCap, Hash, LogOut, Send, Users } from "lucide-react"
import { AdminDashboard } from "@/components/AdminDashboard"
import { Button } from "@/components/ui/button"
import { api, type Message, type Profile, type Subject } from "@/lib/api"
import { supabase } from "@/lib/supabase"

function SignIn() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function submit(event: FormEvent) {
    event.preventDefault()
    setLoading(true)
    setError("")
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
    if (signInError) setError(signInError.message)
    setLoading(false)
  }

  return (
    <main className="grid min-h-svh place-items-center bg-muted/50 p-6">
      <form onSubmit={submit} className="w-full max-w-sm rounded-2xl border bg-card p-7 shadow-sm">
        <div className="mb-7 flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <GraduationCap className="size-6" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Sign in with your school account to open your subject conversations.
        </p>
        <label className="mt-6 block text-sm font-medium" htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="mt-2 h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
        <label className="mt-4 block text-sm font-medium" htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="mt-2 h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
        {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
        <Button className="mt-6 w-full" type="submit" disabled={loading}>
          {loading ? "Signing in..." : "Sign in"}
        </Button>
      </form>
    </main>
  )
}

function Workspace({ session }: { session: Session }) {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [draft, setDraft] = useState("")
  const [error, setError] = useState("")
  const [sending, setSending] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)
  const selected = subjects.find((subject) => subject.id === selectedId)

  useEffect(() => {
    api.subjects()
      .then((items) => {
        setSubjects(items)
        setSelectedId((current) => current ?? items[0]?.id ?? null)
      })
      .catch((cause: Error) => setError(cause.message))
  }, [])

  useEffect(() => {
    if (!selectedId) return
    let active = true

    const load = () => {
      api.messages(selectedId)
        .then((items) => active && setMessages(items))
        .catch((cause: Error) => active && setError(cause.message))
    }

    load()
    const interval = window.setInterval(load, 5000)
    return () => {
      active = false
      window.clearInterval(interval)
    }
  }, [selectedId])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  async function send(event: FormEvent) {
    event.preventDefault()
    const content = draft.trim()
    if (!content || !selectedId || sending) return

    setSending(true)
    setError("")
    try {
      const message = await api.sendMessage(selectedId, content)
      setMessages((current) => [...current, message])
      setDraft("")
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not send message")
    } finally {
      setSending(false)
    }
  }

  return (
    <main className="grid h-svh bg-background text-foreground md:grid-cols-[280px_1fr]">
      <aside className="hidden min-h-0 border-r bg-muted/30 md:flex md:flex-col">
        <div className="flex h-16 items-center gap-3 border-b px-5">
          <div className="grid size-9 place-items-center rounded-lg bg-primary text-primary-foreground">
            <GraduationCap className="size-5" />
          </div>
          <div>
            <p className="font-semibold leading-tight">Classroom</p>
            <p className="text-xs text-muted-foreground">Subject conversations</p>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-3">
          <p className="px-2 pb-2 pt-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">My subjects</p>
          {subjects.map((subject) => (
            <button
              key={subject.id}
              type="button"
              onClick={() => setSelectedId(subject.id)}
              className={`mb-1 flex w-full gap-3 rounded-lg px-3 py-3 text-left transition-colors ${
                selectedId === subject.id ? "bg-primary text-primary-foreground" : "hover:bg-muted"
              }`}
            >
              <Hash className="mt-0.5 size-4 shrink-0" />
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium">{subject.code}</span>
                <span className={`block truncate text-xs ${selectedId === subject.id ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                  {subject.name} · {subject.section}
                </span>
              </span>
            </button>
          ))}
          {!subjects.length && <p className="px-2 py-4 text-sm text-muted-foreground">No subjects assigned yet.</p>}
        </div>
        <div className="flex items-center gap-3 border-t p-4">
          <div className="grid size-9 place-items-center rounded-full bg-muted text-sm font-semibold">
            {session.user.email?.[0]?.toUpperCase() ?? "U"}
          </div>
          <p className="min-w-0 flex-1 truncate text-sm">{session.user.email}</p>
          <Button variant="ghost" size="icon" aria-label="Sign out" onClick={() => void supabase.auth.signOut()}>
            <LogOut className="size-4" />
          </Button>
        </div>
      </aside>

      <section className="flex min-h-0 flex-col">
        <header className="flex min-h-16 items-center justify-between border-b px-4 md:px-6">
          {selected ? (
            <>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <BookOpen className="size-4 text-muted-foreground" />
                  <h1 className="truncate font-semibold">{selected.code} · {selected.name}</h1>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">{selected.section} · {selected.term}</p>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Users className="size-4" /> {selected.memberCount}
              </div>
            </>
          ) : (
            <p className="font-semibold">Select a subject</p>
          )}
        </header>

        <div className="flex-1 overflow-y-auto px-4 py-6 md:px-8">
          <div className="mx-auto flex max-w-3xl flex-col gap-5">
            {messages.map((message) => {
              const mine = message.authorId === session.user.id
              return (
                <article key={message.id} className={`flex gap-3 ${mine ? "flex-row-reverse" : ""}`}>
                  <div className="grid size-9 shrink-0 place-items-center rounded-full bg-muted text-xs font-semibold">
                    {(message.author.name ?? "U").slice(0, 2).toUpperCase()}
                  </div>
                  <div className={`max-w-[75%] ${mine ? "text-right" : ""}`}>
                    <div className="mb-1 flex items-baseline gap-2 text-xs text-muted-foreground">
                      {!mine && <span className="font-medium text-foreground">{message.author.name ?? "Unknown"}</span>}
                      <time>{new Date(message.createdAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</time>
                    </div>
                    <p className={`whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-left text-sm ${mine ? "rounded-tr-sm bg-primary text-primary-foreground" : "rounded-tl-sm bg-muted"}`}>
                      {message.content}
                    </p>
                  </div>
                </article>
              )
            })}
            {selected && !messages.length && (
              <div className="py-16 text-center text-sm text-muted-foreground">No messages yet. Start the conversation.</div>
            )}
            <div ref={endRef} />
          </div>
        </div>

        <footer className="border-t bg-background p-4 md:px-8">
          <form onSubmit={send} className="mx-auto flex max-w-3xl items-end gap-2 rounded-xl border bg-card p-2 shadow-sm">
            <textarea
              value={draft}
              disabled={!selected}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault()
                  event.currentTarget.form?.requestSubmit()
                }
              }}
              rows={1}
              maxLength={4000}
              placeholder={selected ? `Message ${selected.code}` : "Select a subject to begin"}
              className="max-h-32 min-h-10 flex-1 resize-none bg-transparent px-3 py-2 text-sm outline-none disabled:cursor-not-allowed"
            />
            <Button size="icon" type="submit" disabled={!draft.trim() || !selected || sending} aria-label="Send message">
              <Send className="size-4" />
            </Button>
          </form>
          {error && <p className="mx-auto mt-2 max-w-3xl text-xs text-destructive">{error}</p>}
        </footer>
      </section>
    </main>
  )
}

function App() {
  const [session, setSession] = useState<Session | null | undefined>(undefined)
  const [profile, setProfile] = useState<Profile | null | undefined>(undefined)
  const [profileError, setProfileError] = useState("")

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => setSession(nextSession))
    return () => data.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!session) {
      setProfile(null)
      return
    }

    setProfile(undefined)
    setProfileError("")
    api.me()
      .then(setProfile)
      .catch((cause: Error) => setProfileError(cause.message))
  }, [session])

  if (session === undefined || (session && profile === undefined && !profileError)) {
    return <main className="grid min-h-svh place-items-center text-sm text-muted-foreground">Loading...</main>
  }

  if (!session) return <SignIn />

  if (profileError) {
    return (
      <main className="grid min-h-svh place-items-center p-6">
        <div className="text-center">
          <p className="text-sm text-destructive">{profileError}</p>
          <Button className="mt-4" variant="outline" onClick={() => void supabase.auth.signOut()}>Sign out</Button>
        </div>
      </main>
    )
  }

  return profile?.accountRole === "ADMIN"
    ? <AdminDashboard session={session} />
    : <Workspace session={session} />
}

export default App
