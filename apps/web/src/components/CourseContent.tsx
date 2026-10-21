import type { FormEvent } from "react"
import { useEffect, useState } from "react"
import {
  CalendarClock,
  ClipboardList,
  ExternalLink,
  FileText,
  Link2,
  LoaderCircle,
  Plus,
  Trash2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  api,
  type LearningMaterial,
  type Subject,
  type SubjectTask,
} from "@/lib/api"

type CourseContentProps = {
  subject: Subject
  view: "tasks" | "materials"
  isProfessor: boolean
}

const fieldClass =
  "mt-1.5 w-full rounded-lg border border-[#d6cec5] bg-white px-3 py-2 text-sm outline-none transition-colors placeholder:text-[#a8a29e] focus:border-[#800000] focus:ring-2 focus:ring-[#800000]/15"

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value))
}

export function CourseContent({ subject, view, isProfessor }: CourseContentProps) {
  const [tasks, setTasks] = useState<SubjectTask[]>([])
  const [materials, setMaterials] = useState<LearningMaterial[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const [taskTitle, setTaskTitle] = useState("")
  const [taskDescription, setTaskDescription] = useState("")
  const [taskDueAt, setTaskDueAt] = useState("")
  const [taskPoints, setTaskPoints] = useState("")

  const [materialTitle, setMaterialTitle] = useState("")
  const [materialDescription, setMaterialDescription] = useState("")
  const [materialUrl, setMaterialUrl] = useState("")

  useEffect(() => {
    let active = true
    setLoading(true)
    setError("")

    const request = view === "tasks" ? api.tasks(subject.id) : api.materials(subject.id)
    request
      .then((items) => {
        if (!active) return
        if (view === "tasks") setTasks(items as SubjectTask[])
        else setMaterials(items as LearningMaterial[])
      })
      .catch((cause: Error) => active && setError(cause.message))
      .finally(() => active && setLoading(false))

    return () => {
      active = false
    }
  }, [subject.id, view])

  async function createTask(event: FormEvent) {
    event.preventDefault()
    if (!taskTitle.trim() || saving) return
    setSaving(true)
    setError("")
    try {
      const task = await api.createTask(subject.id, {
        title: taskTitle.trim(),
        description: taskDescription.trim() || undefined,
        dueAt: taskDueAt ? new Date(taskDueAt).toISOString() : null,
        points: taskPoints ? Number(taskPoints) : null,
      })
      setTasks((current) => [...current, task].sort((a, b) => {
        if (!a.dueAt) return 1
        if (!b.dueAt) return -1
        return new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime()
      }))
      setTaskTitle("")
      setTaskDescription("")
      setTaskDueAt("")
      setTaskPoints("")
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not add the task")
    } finally {
      setSaving(false)
    }
  }

  async function createMaterial(event: FormEvent) {
    event.preventDefault()
    if (!materialTitle.trim() || !materialUrl.trim() || saving) return
    setSaving(true)
    setError("")
    try {
      const material = await api.createMaterial(subject.id, {
        title: materialTitle.trim(),
        description: materialDescription.trim() || undefined,
        url: materialUrl.trim(),
      })
      setMaterials((current) => [material, ...current])
      setMaterialTitle("")
      setMaterialDescription("")
      setMaterialUrl("")
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not add the material")
    } finally {
      setSaving(false)
    }
  }

  async function removeTask(taskId: string) {
    if (!window.confirm("Delete this task? Students will no longer be able to see it.")) return
    setError("")
    try {
      await api.deleteTask(subject.id, taskId)
      setTasks((current) => current.filter((task) => task.id !== taskId))
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not delete the task")
    }
  }

  async function removeMaterial(materialId: string) {
    if (!window.confirm("Delete this learning material?")) return
    setError("")
    try {
      await api.deleteMaterial(subject.id, materialId)
      setMaterials((current) => current.filter((material) => material.id !== materialId))
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not delete the material")
    }
  }

  const isTasks = view === "tasks"
  const items = isTasks ? tasks : materials

  return (
    <div className="flex-1 overflow-y-auto bg-gradient-to-b from-[#faf8f5] to-white px-4 py-6 md:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-5 flex items-start gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#800000]/10 text-[#800000]">
            {isTasks ? <ClipboardList className="size-5" /> : <FileText className="size-5" />}
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#800000]">
              {isTasks ? "Tasks and deadlines" : "Learning materials"}
            </h2>
            <p className="mt-0.5 text-sm text-[#78716c]">
              {isProfessor
                ? isTasks
                  ? "Create assignments and share their deadlines with the class."
                  : "Share readings, slides, videos, and other useful links."
                : isTasks
                  ? "Review the tasks assigned for this subject."
                  : "Open the resources shared by your professor."}
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className={`grid items-start gap-5 ${isProfessor ? "lg:grid-cols-[320px_1fr]" : "grid-cols-1"}`}>
          {isProfessor && isTasks && (
            <form onSubmit={createTask} className="rounded-xl border border-[#e7e0d8] bg-white p-4 shadow-sm">
              <h3 className="flex items-center gap-2 font-bold text-[#292524]">
                <Plus className="size-4 text-[#DAA520]" /> Add a task
              </h3>
              <label className="mt-4 block text-xs font-semibold text-[#44403c]">
                Title
                <input
                  required
                  maxLength={200}
                  value={taskTitle}
                  onChange={(event) => setTaskTitle(event.target.value)}
                  placeholder="e.g. Problem Set 1"
                  className={fieldClass}
                />
              </label>
              <label className="mt-3 block text-xs font-semibold text-[#44403c]">
                Instructions
                <textarea
                  rows={4}
                  maxLength={4000}
                  value={taskDescription}
                  onChange={(event) => setTaskDescription(event.target.value)}
                  placeholder="What should students complete?"
                  className={`${fieldClass} resize-y`}
                />
              </label>
              <label className="mt-3 block text-xs font-semibold text-[#44403c]">
                Due date (optional)
                <input
                  type="datetime-local"
                  value={taskDueAt}
                  onChange={(event) => setTaskDueAt(event.target.value)}
                  className={fieldClass}
                />
              </label>
              <label className="mt-3 block text-xs font-semibold text-[#44403c]">
                Points (optional)
                <input
                  type="number"
                  min="0"
                  max="10000"
                  value={taskPoints}
                  onChange={(event) => setTaskPoints(event.target.value)}
                  placeholder="100"
                  className={fieldClass}
                />
              </label>
              <Button type="submit" disabled={saving} className="mt-4 w-full bg-[#800000] text-white hover:bg-[#680000]">
                {saving ? <LoaderCircle className="size-4 animate-spin" /> : <Plus className="size-4" />}
                Add task
              </Button>
            </form>
          )}

          {isProfessor && !isTasks && (
            <form onSubmit={createMaterial} className="rounded-xl border border-[#e7e0d8] bg-white p-4 shadow-sm">
              <h3 className="flex items-center gap-2 font-bold text-[#292524]">
                <Plus className="size-4 text-[#DAA520]" /> Add material
              </h3>
              <label className="mt-4 block text-xs font-semibold text-[#44403c]">
                Title
                <input
                  required
                  maxLength={200}
                  value={materialTitle}
                  onChange={(event) => setMaterialTitle(event.target.value)}
                  placeholder="e.g. Week 1 lecture slides"
                  className={fieldClass}
                />
              </label>
              <label className="mt-3 block text-xs font-semibold text-[#44403c]">
                Resource link
                <div className="relative">
                  <Link2 className="absolute left-3 top-4 size-4 text-[#a8a29e]" />
                  <input
                    required
                    type="url"
                    maxLength={2048}
                    value={materialUrl}
                    onChange={(event) => setMaterialUrl(event.target.value)}
                    placeholder="https://..."
                    className={`${fieldClass} pl-9`}
                  />
                </div>
              </label>
              <label className="mt-3 block text-xs font-semibold text-[#44403c]">
                Description (optional)
                <textarea
                  rows={4}
                  maxLength={4000}
                  value={materialDescription}
                  onChange={(event) => setMaterialDescription(event.target.value)}
                  placeholder="Tell students what this resource covers."
                  className={`${fieldClass} resize-y`}
                />
              </label>
              <Button type="submit" disabled={saving} className="mt-4 w-full bg-[#800000] text-white hover:bg-[#680000]">
                {saving ? <LoaderCircle className="size-4 animate-spin" /> : <Plus className="size-4" />}
                Add material
              </Button>
            </form>
          )}

          <div className="space-y-3">
            {loading && (
              <div className="flex items-center justify-center gap-2 rounded-xl border border-[#e7e0d8] bg-white py-16 text-sm text-[#78716c]">
                <LoaderCircle className="size-4 animate-spin text-[#800000]" /> Loading...
              </div>
            )}

            {!loading && !items.length && (
              <div className="rounded-xl border border-dashed border-[#d6cec5] bg-white py-16 text-center">
                {isTasks
                  ? <ClipboardList className="mx-auto size-9 text-[#DAA520]" />
                  : <FileText className="mx-auto size-9 text-[#DAA520]" />}
                <p className="mt-3 font-semibold text-[#800000]">
                  No {isTasks ? "tasks" : "learning materials"} yet
                </p>
                <p className="mt-1 text-xs text-[#78716c]">
                  {isProfessor ? `Use the form to add the first ${isTasks ? "task" : "resource"}.` : "Check back after your professor posts one."}
                </p>
              </div>
            )}

            {!loading && isTasks && tasks.map((task) => {
              const overdue = task.dueAt ? new Date(task.dueAt).getTime() < Date.now() : false
              return (
                <article key={task.id} className="rounded-xl border border-[#e7e0d8] bg-white p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="font-bold text-[#292524]">{task.title}</h3>
                      <p className="mt-1 text-xs text-[#78716c]">
                        Posted by {task.creator.name ?? "Professor"}
                      </p>
                    </div>
                    {isProfessor && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => void removeTask(task.id)}
                        className="size-8 shrink-0 text-[#a8a29e] hover:bg-red-50 hover:text-red-600"
                        aria-label={`Delete ${task.title}`}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    )}
                  </div>
                  {task.description && <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-[#44403c]">{task.description}</p>}
                  <div className="mt-4 flex flex-wrap gap-2 text-xs">
                    {task.dueAt && (
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-semibold ${overdue ? "bg-red-50 text-red-700" : "bg-[#800000]/10 text-[#800000]"}`}>
                        <CalendarClock className="size-3.5" /> Due {formatDate(task.dueAt)}
                      </span>
                    )}
                    {task.points !== null && (
                      <span className="rounded-full bg-[#fff8dc] px-2.5 py-1 font-semibold text-[#8a6500]">
                        {task.points} {task.points === 1 ? "point" : "points"}
                      </span>
                    )}
                    {!task.dueAt && task.points === null && (
                      <span className="text-[#a8a29e]">No deadline or points specified</span>
                    )}
                  </div>
                </article>
              )
            })}

            {!loading && !isTasks && materials.map((material) => (
              <article key={material.id} className="rounded-xl border border-[#e7e0d8] bg-white p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#fff8dc] text-[#9a7200]">
                    <FileText className="size-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-[#292524]">{material.title}</h3>
                    <p className="mt-1 text-xs text-[#78716c]">
                      Shared by {material.creator.name ?? "Professor"} · {formatDate(material.createdAt)}
                    </p>
                    {material.description && <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-[#44403c]">{material.description}</p>}
                    <a
                      href={material.url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-4 inline-flex max-w-full items-center gap-1.5 rounded-lg bg-[#800000] px-3 py-2 text-xs font-semibold text-white hover:bg-[#680000]"
                    >
                      <ExternalLink className="size-3.5 shrink-0" />
                      <span className="truncate">Open resource</span>
                    </a>
                  </div>
                  {isProfessor && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => void removeMaterial(material.id)}
                      className="size-8 shrink-0 text-[#a8a29e] hover:bg-red-50 hover:text-red-600"
                      aria-label={`Delete ${material.title}`}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  )}
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
