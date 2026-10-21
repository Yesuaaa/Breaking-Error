import type { FormEvent } from "react"
import { useEffect, useRef, useState } from "react"
import type { Session } from "@supabase/supabase-js"
import {
  Award,
  Bell,
  Binary,
  BookOpen,
  Briefcase,
  Calculator,
  Calendar,
  CheckCircle2,
  Code2,
  Cpu,
  Database,
  FlaskConical,
  GraduationCap,
  Hash,
  HeartPulse,
  History,
  Info,
  Languages,
  Laptop,
  Lightbulb,
  LineChart,
  LogOut,
  Megaphone,
  MessageSquare,
  Music,
  Palette,
  Scale,
  Search,
  Send,
  ShieldAlert,
  Sparkles,
  Stethoscope,
  Terminal,
  User,
  Users,
} from "lucide-react"
import { AdminDashboard } from "@/components/AdminDashboard"
import { Button } from "@/components/ui/button"
import { api, type Message, type Profile, type Subject } from "@/lib/api"
import { supabase } from "@/lib/supabase"

/* Helper to dynamically determine the most appropriate academic icon */
function getSubjectIcon(code: string, name: string) {
  const combined = `${code} ${name}`.toLowerCase()

  // Computer Science, Programming & IT
  if (
    combined.includes("cs") ||
    combined.includes("prog") ||
    combined.includes("code") ||
    combined.includes("software") ||
    combined.includes("algorithm") ||
    combined.includes("data structure")
  ) {
    return Code2
  }
  if (combined.includes("it") || combined.includes("tech") || combined.includes("computer") || combined.includes("network")) {
    return Laptop
  }
  if (combined.includes("db") || combined.includes("sql") || combined.includes("database")) {
    return Database
  }

  // Mathematics, Statistics, Analytics & Discrete
  if (
    combined.includes("math") ||
    combined.includes("discrete") ||
    combined.includes("calculus") ||
    combined.includes("algebra") ||
    combined.includes("geometry") ||
    combined.includes("arithmetic")
  ) {
    return Calculator
  }
  if (combined.includes("stat") || combined.includes("analytics") || combined.includes("finance") || combined.includes("econ")) {
    return LineChart
  }

  // Languages, English, Filipino, Communication, Humanities
  if (
    combined.includes("eng") ||
    combined.includes("comm") ||
    combined.includes("speech") ||
    combined.includes("writing") ||
    combined.includes("academic communication") ||
    combined.includes("literature")
  ) {
    return Megaphone
  }
  if (combined.includes("fil") || combined.includes("wika") || combined.includes("panitikan") || combined.includes("lang") || combined.includes("foreign")) {
    return Languages
  }

  // Sciences & Engineering
  if (combined.includes("phys") || combined.includes("chem") || combined.includes("bio") || combined.includes("sci") || combined.includes("lab")) {
    return FlaskConical
  }
  if (combined.includes("engr") || combined.includes("hardware") || combined.includes("electronics") || combined.includes("circuit")) {
    return Cpu
  }

  // Law, Ethics, History & Social Sciences
  if (combined.includes("law") || combined.includes("ethics") || combined.includes("constitution") || combined.includes("policy")) {
    return Scale
  }
  if (combined.includes("hist") || combined.includes("kasaysayan") || combined.includes("rizal") || combined.includes("society")) {
    return History
  }

  // Arts, Design, Physical Education
  if (combined.includes("art") || combined.includes("design") || combined.includes("drawing") || combined.includes("multimedia")) {
    return Palette
  }
  if (combined.includes("pe") || combined.includes("pathfit") || combined.includes("fitness") || combined.includes("health")) {
    return HeartPulse
  }

  // Business & Management
  if (combined.includes("bus") || combined.includes("mgmt") || combined.includes("entrepreneur") || combined.includes("account")) {
    return Briefcase
  }

  // Default fallback for any general course
  return BookOpen
}

/* Official PUP Seal / Emblem SVG Component */
function PupLogo({ className = "size-10" }: { className?: string }) {
  return (
    <div className={`relative flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#800000] via-[#600000] to-[#4a0000] p-1.5 shadow-md ring-2 ring-[#FFDF00]/70 ${className}`}>
      <GraduationCap className="size-full text-[#FFDF00]" />
      <span className="absolute -bottom-0.5 -right-0.5 flex size-3 items-center justify-center rounded-full bg-[#FFDF00] ring-1 ring-[#800000]">
        <span className="size-1.5 rounded-full bg-[#800000]" />
      </span>
    </div>
  )
}

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
    <main className="relative flex min-h-svh items-center justify-center overflow-hidden bg-[#faf8f5] p-4 sm:p-6">
      {/* Decorative background watermark and accents */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 size-96 rounded-full bg-[#800000]/5 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 size-96 rounded-full bg-[#FFDF00]/10 blur-3xl" />
        <div className="absolute inset-x-0 top-0 h-2 bg-gradient-to-r from-[#800000] via-[#FFDF00] to-[#800000]" />
      </div>

      <div className="relative w-full max-w-md">
        {/* University Header Crest */}
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex size-16 items-center justify-center rounded-2xl bg-gradient-to-b from-[#800000] to-[#550000] p-3 text-[#FFDF00] shadow-xl ring-4 ring-[#FFDF00]/30">
            <GraduationCap className="size-10" />
          </div>
          <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#800000]">
            Republic of the Philippines
          </p>
          <h2 className="mt-0.5 text-base font-extrabold tracking-tight text-[#1c1917] sm:text-lg">
            POLYTECHNIC UNIVERSITY OF THE PHILIPPINES
          </h2>
          <p className="text-xs font-semibold text-[#DAA520]">
            The Country&apos;s 1st Polytechnic U • Academic Portal
          </p>
        </div>

        {/* Card Form */}
        <form
          onSubmit={submit}
          className="rounded-2xl border border-[#e7e0d8] bg-white p-6 shadow-xl shadow-[#800000]/5 sm:p-8"
        >
          <div className="mb-6 border-b border-[#f0eae1] pb-4">
            <h1 className="text-xl font-bold text-[#800000]">Student & Faculty Portal</h1>
            <p className="mt-1 text-xs text-[#78716c]">
              Sign in with your official PUP WebMail or credentials to access your course rooms.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#44403c]" htmlFor="email">
                WebMail / Institutional Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="student@example.edu"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="mt-1.5 h-11 w-full rounded-lg border border-[#d6cec5] bg-[#faf8f5] px-3.5 text-sm transition-all outline-none focus:border-[#800000] focus:bg-white focus:ring-2 focus:ring-[#800000]/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#44403c]" htmlFor="password">
                Portal Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="mt-1.5 h-11 w-full rounded-lg border border-[#d6cec5] bg-[#faf8f5] px-3.5 text-sm transition-all outline-none focus:border-[#800000] focus:bg-white focus:ring-2 focus:ring-[#800000]/20"
              />
            </div>
          </div>

          {error && (
            <div className="mt-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
              <Info className="size-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          <Button
            className="mt-6 h-11 w-full rounded-lg bg-gradient-to-r from-[#800000] via-[#8c0808] to-[#800000] font-semibold text-white shadow-md shadow-[#800000]/25 transition-all hover:brightness-110 active:scale-[0.99]"
            type="submit"
            disabled={loading}
          >
            {loading ? "Authenticating..." : "Sign in to Portal"}
          </Button>

          {/* Quick Demo Credentials Reminder */}
          <div className="mt-6 rounded-xl border border-[#DAA520]/30 bg-[#fffdf0] p-3 text-[11px] text-[#78350f]">
            <span className="font-bold text-[#800000]">Demo Accounts:</span>
            <div className="mt-1 grid grid-cols-2 gap-1 text-[10px]">
              <div><span className="font-semibold">Student:</span> alex.student@example.edu</div>
              <div><span className="font-semibold">Pass:</span> Student123!</div>
              <div><span className="font-semibold">Professor:</span> professor@example.edu</div>
              <div><span className="font-semibold">Pass:</span> Professor123!</div>
            </div>
          </div>
        </form>

        <p className="mt-6 text-center text-xs text-[#a8a29e]">
          Sintang Paaralan, Tanglaw ng Bayan • PUP Manila
        </p>
      </div>
    </main>
  )
}

function Workspace({ session, profile }: { session: Session; profile: Profile | null | undefined }) {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [draft, setDraft] = useState("")
  const [error, setError] = useState("")
  const [sending, setSending] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const endRef = useRef<HTMLDivElement>(null)

  const selected = subjects.find((subject) => subject.id === selectedId)

  // Determine user role in current context: either subject role or professor/student
  const isProfessor =
    selected?.role === "PROFESSOR" ||
    subjects.some((s) => s.role === "PROFESSOR") ||
    session.user.email?.toLowerCase().includes("professor")

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
    const interval = window.setInterval(load, 4000)
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

  const filteredSubjects = subjects.filter(
    (s) =>
      s.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.section.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const displayName =
    profile?.name ??
    session.user.user_metadata?.full_name ??
    session.user.email?.split("@")[0] ??
    "PUPian"

  return (
    <div className="flex h-svh flex-col bg-[#fbf9f6] text-[#1c1917]">
      {/* Top PUP Official University Bar */}
      <header className="relative z-10 flex h-14 shrink-0 items-center justify-between border-b border-[#660000] bg-gradient-to-r from-[#800000] via-[#730000] to-[#550000] px-4 text-white shadow-md md:px-6">
        <div className="flex items-center gap-3">
          <PupLogo className="size-9" />
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-extrabold tracking-tight text-white text-sm md:text-base">
                Syncademia
              </span>
              <span className="hidden rounded bg-[#FFDF00] px-1.5 py-0.5 text-[10px] font-black uppercase text-[#800000] sm:inline-block">
                {isProfessor ? "Faculty Portal" : "Student Portal"}
              </span>
            </div>
            <span className="hidden text-[10px] text-[#FFDF00]/90 md:inline-block">
              Polytechnic University of the Philippines • {isProfessor ? "Faculty & Instructor Channel" : "Student Communication Hub"}
            </span>
          </div>
        </div>

        {/* User Pill & Sign out */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-2 rounded-full border border-[#FFDF00]/30 bg-[#600000]/60 px-3 py-1 text-xs text-white shadow-inner">
            <span className="size-2 rounded-full bg-[#FFDF00] animate-pulse" />
            <span className="max-w-[130px] truncate font-medium sm:max-w-[200px]">
              {displayName}
            </span>
            <span className="rounded bg-[#FFDF00]/20 px-1 py-0.5 text-[9px] font-bold text-[#FFDF00]">
              {isProfessor ? "FACULTY" : "STUDENT"}
            </span>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => void supabase.auth.signOut()}
            className="h-8 gap-1 rounded-full px-2.5 text-xs text-white/90 hover:bg-white/15 hover:text-white"
            title="Sign out of portal"
          >
            <LogOut className="size-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </header>

      {/* Main Workspace: Sidebar & Discussion Stage */}
      <div className="grid flex-1 min-h-0 md:grid-cols-[300px_1fr]">
        {/* Left Academic Navigation Sidebar */}
        <aside className="hidden flex-col border-r border-[#e7e0d8] bg-[#f7f3ed] md:flex">
          {/* Semester / Academic Year Banner */}
          <div className="border-b border-[#e7e0d8] bg-[#fffdfa] p-4">
            <div className="flex items-center justify-between text-xs text-[#78716c]">
              <span className="flex items-center gap-1 font-semibold text-[#800000]">
                <Calendar className="size-3.5 text-[#DAA520]" /> 1st Semester 2026-2027
              </span>
              <span className="rounded-full bg-[#800000]/10 px-2 py-0.5 text-[10px] font-bold text-[#800000]">
                Active
              </span>
            </div>

            {/* Subject Search */}
            <div className="relative mt-3">
              <Search className="absolute left-2.5 top-2.5 size-3.5 text-[#a8a29e]" />
              <input
                type="text"
                placeholder="Search subject or section..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-8 w-full rounded-md border border-[#d6cec5] bg-[#faf8f5] pl-8 pr-3 text-xs outline-none transition-colors placeholder:text-[#a8a29e] focus:border-[#800000] focus:bg-white focus:ring-1 focus:ring-[#800000]"
              />
            </div>
          </div>

          {/* Subjects List */}
          <div className="flex-1 overflow-y-auto p-3">
            <div className="mb-2 flex items-center justify-between px-2 text-[11px] font-bold uppercase tracking-wider text-[#78716c]">
              <span>{isProfessor ? "Teaching Assignments" : "Enrolled Courses"}</span>
              <span className="text-[10px] font-semibold text-[#800000]">
                {subjects.length} Subjects
              </span>
            </div>

            <div className="space-y-1.5">
              {filteredSubjects.map((subject) => {
                const isActive = selectedId === subject.id
                const SubjectIcon = getSubjectIcon(subject.code, subject.name)
                return (
                  <button
                    key={subject.id}
                    type="button"
                    onClick={() => setSelectedId(subject.id)}
                    className={`group relative flex w-full flex-col gap-1 rounded-xl p-3 text-left transition-all ${
                      isActive
                        ? "bg-[#800000] text-white shadow-md shadow-[#800000]/20 ring-1 ring-[#FFDF00]/40"
                        : "border border-[#e9e2d9] bg-white text-[#1c1917] hover:border-[#DAA520] hover:bg-[#fffef9]"
                    }`}
                  >
                    {/* Active Golden Left Indicator */}
                    {isActive && (
                      <span className="absolute left-0 top-2.5 bottom-2.5 w-1 rounded-r bg-[#FFDF00]" />
                    )}

                    <div className="flex items-center justify-between">
                      <span className={`inline-flex items-center gap-1.5 font-bold tracking-tight text-xs ${isActive ? "text-[#FFDF00]" : "text-[#800000]"}`}>
                        <span className={`flex size-6 items-center justify-center rounded-md ${isActive ? "bg-white/20 text-[#FFDF00]" : "bg-[#800000]/10 text-[#800000]"}`}>
                          <SubjectIcon className="size-3.5 shrink-0" />
                        </span>
                        {subject.code}
                      </span>
                      <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${isActive ? "bg-white/20 text-white" : "bg-[#f5efe6] text-[#78716c]"}`}>
                        {subject.section}
                      </span>
                    </div>

                    <p className={`line-clamp-1 text-xs font-medium ${isActive ? "text-white/95" : "text-[#292524]"}`}>
                      {subject.name}
                    </p>

                    <div className={`mt-1 flex items-center justify-between text-[10px] ${isActive ? "text-white/70" : "text-[#a8a29e]"}`}>
                      <span className="flex items-center gap-1">
                        <Users className="size-3" /> {subject.memberCount} members
                      </span>
                      <span>{subject.term}</span>
                    </div>
                  </button>
                )
              })}

              {!filteredSubjects.length && (
                <div className="py-8 text-center text-xs text-[#a8a29e]">
                  No matching subjects found.
                </div>
              )}
            </div>
          </div>

          {/* Academic Footer Info */}
          <div className="border-t border-[#e7e0d8] bg-[#fffdfa] p-3 text-center text-[10px] text-[#78716c]">
            <p className="font-semibold text-[#800000]">PUP Student Information Services</p>
            <p className="text-[9px] text-[#a8a29e]">For enrollment issues, contact your College Dean</p>
          </div>
        </aside>

        {/* Right Chat Section */}
        <section className="flex min-h-0 flex-col bg-[#ffffff]">
          {/* Header */}
          <header className="flex min-h-16 shrink-0 items-center justify-between border-b border-[#e7e0d8] bg-[#faf8f5] px-4 md:px-6">
            {selected ? (() => {
              const SelectedIcon = getSubjectIcon(selected.code, selected.name)
              return (
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#800000] to-[#5a0000] text-[#FFDF00] shadow-sm ring-1 ring-[#FFDF00]/30">
                    <SelectedIcon className="size-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h1 className="truncate text-base font-bold text-[#800000] sm:text-lg">
                        {selected.code} • {selected.name}
                      </h1>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-[#78716c]">
                      <span className="font-semibold text-[#1c1917]">Section {selected.section}</span>
                      <span>•</span>
                      <span className="text-[#DAA520] font-semibold">{selected.term}</span>
                      <span>•</span>
                      <span className="inline-flex items-center gap-1 text-[#800000]">
                        <Users className="size-3" /> {selected.memberCount} enrolled
                      </span>
                    </div>
                  </div>
                </div>
              )
            })() : (
              <p className="font-semibold text-[#800000]">Select an Enrolled Subject</p>
            )}

            {/* University Tag */}
            <div className="hidden items-center gap-1 rounded-full border border-[#DAA520]/40 bg-[#fffdf0] px-3 py-1 text-xs font-semibold text-[#800000] sm:flex">
              <Sparkles className="size-3.5 text-[#DAA520]" />
              <span>Official Subject Channel</span>
            </div>
          </header>

          {/* Academic Announcement / Guidelines Banner */}
          <div className="border-b border-[#f2ece3] bg-gradient-to-r from-[#fff9e6] via-[#fffdf5] to-[#fff9e6] px-4 py-2 text-xs text-[#78350f]">
            <div className="mx-auto flex max-w-4xl items-center gap-2">
              <CheckCircle2 className="size-4 shrink-0 text-[#DAA520]" />
              <span>
                <strong>Honor Code:</strong> Observe respectful academic discourse in accordance with the PUP Student Handbook.
              </span>
            </div>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto bg-gradient-to-b from-[#faf8f5] to-white px-4 py-6 md:px-8">
            <div className="mx-auto flex max-w-3xl flex-col gap-4">
              {/* Subject Welcomer */}
              {selected && (() => {
                const WelcomeIcon = getSubjectIcon(selected.code, selected.name)
                return (
                  <div className="mb-2 rounded-2xl border border-[#e8dfd3] bg-white p-5 text-center shadow-sm">
                    <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-[#800000]/10 text-[#800000]">
                      <WelcomeIcon className="size-6 text-[#800000]" />
                    </div>
                    <h3 className="text-sm font-bold text-[#800000]">
                      Welcome to {selected.code} ({selected.name})
                    </h3>
                    <p className="mx-auto mt-1 max-w-md text-xs text-[#78716c]">
                      This is the official discussion room for Section {selected.section}. All announcements and course inquiries take place here.
                    </p>
                  </div>
                )
              })()}

              {messages.map((message) => {
                const mine = message.authorId === session.user.id
                const authorInitial = (message.author.name ?? "U").slice(0, 2).toUpperCase()

                return (
                  <article key={message.id} className={`flex gap-3 ${mine ? "flex-row-reverse" : "flex-row"}`}>
                    {/* Avatar */}
                    <div
                      className={`grid size-9 shrink-0 place-items-center rounded-full text-xs font-bold shadow-sm ${
                        mine
                          ? "bg-gradient-to-br from-[#800000] to-[#550000] text-[#FFDF00] ring-1 ring-[#FFDF00]"
                          : "border border-[#e2d8cb] bg-[#fffaf2] text-[#800000]"
                      }`}
                    >
                      {authorInitial}
                    </div>

                    {/* Bubble */}
                    <div className={`max-w-[80%] sm:max-w-[70%] ${mine ? "text-right" : "text-left"}`}>
                      <div className={`mb-1 flex items-baseline gap-2 text-xs ${mine ? "justify-end" : "justify-start"}`}>
                        <span className={`font-semibold ${mine ? "text-[#800000]" : "text-[#292524]"}`}>
                          {mine ? "You" : (message.author.name ?? "Unknown")}
                        </span>
                        <time className="text-[10px] text-[#a8a29e]">
                          {new Date(message.createdAt).toLocaleTimeString([], {
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </time>
                      </div>

                      <div
                        className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm transition-all ${
                          mine
                            ? "rounded-tr-none bg-[#800000] text-white selection:bg-[#FFDF00] selection:text-[#800000]"
                            : "rounded-tl-none border border-[#e8dfd3] bg-white text-[#1c1917]"
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{message.content}</p>
                      </div>
                    </div>
                  </article>
                )
              })}

              {selected && !messages.length && (
                <div className="my-10 flex flex-col items-center justify-center text-center text-xs text-[#a8a29e]">
                  <MessageSquare className="mb-2 size-8 text-[#DAA520]" />
                  <p className="font-semibold text-[#800000]">No messages yet</p>
                  <p className="mt-0.5 text-[#78716c]">Post the first question or greeting to your class.</p>
                </div>
              )}

              <div ref={endRef} />
            </div>
          </div>

          {/* Footer Input Bar */}
          <footer className="shrink-0 border-t border-[#e7e0d8] bg-[#fffdfa] p-3 md:px-8 md:py-4">
            <form
              onSubmit={send}
              className="mx-auto flex max-w-3xl items-end gap-2 rounded-2xl border border-[#d8cfc3] bg-white p-2 shadow-sm focus-within:border-[#800000] focus-within:ring-2 focus-within:ring-[#800000]/15"
            >
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
                placeholder={selected ? `Post to ${selected.code} class... (Enter to send)` : "Select a subject first"}
                className="max-h-32 min-h-10 flex-1 resize-none bg-transparent px-3 py-2 text-sm outline-none placeholder:text-[#a8a29e] disabled:cursor-not-allowed"
              />
              <Button
                size="icon"
                type="submit"
                disabled={!draft.trim() || !selected || sending}
                className="size-10 shrink-0 rounded-xl bg-[#800000] text-[#FFDF00] shadow-sm hover:bg-[#680000] hover:text-[#fff066] active:scale-95 disabled:opacity-50"
                aria-label="Send message"
              >
                <Send className="size-4" />
              </Button>
            </form>
            {error && <p className="mx-auto mt-2 max-w-3xl text-center text-xs text-red-600">{error}</p>}
          </footer>
        </section>
      </div>
    </div>
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
    return (
      <main className="grid min-h-svh place-items-center bg-[#faf8f5]">
        <div className="flex flex-col items-center gap-3">
          <PupLogo className="size-14 animate-bounce" />
          <p className="text-xs font-bold tracking-wider text-[#800000] uppercase">
            Loading PUP Academic Portal...
          </p>
        </div>
      </main>
    )
  }

  if (!session) return <SignIn />

  if (profileError) {
    return (
      <main className="grid min-h-svh place-items-center bg-[#faf8f5] p-6">
        <div className="max-w-md rounded-2xl border border-[#e7e0d8] bg-white p-6 text-center shadow-lg">
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-red-100 text-red-600">
            <Info className="size-6" />
          </div>
          <h2 className="text-base font-bold text-[#800000]">Portal Authentication Error</h2>
          <p className="mt-2 text-xs text-[#78716c]">{profileError}</p>
          <Button
            className="mt-5 w-full rounded-lg bg-[#800000] text-white hover:bg-[#680000]"
            onClick={() => void supabase.auth.signOut()}
          >
            Sign out and Try Again
          </Button>
        </div>
      </main>
    )
  }

  return profile?.accountRole === "ADMIN"
    ? <AdminDashboard session={session} />
    : <Workspace session={session} profile={profile} />
}

export default App
