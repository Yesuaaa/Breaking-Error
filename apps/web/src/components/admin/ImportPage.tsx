import type { FormEvent } from "react"
import { useState } from "react"
import { CheckCircle2, Download, FileSpreadsheet, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { actionClass, panelClass } from "@/components/admin/shared"
import { api, type ImportResult } from "@/lib/api"

type Props = { onChanged: () => Promise<void>; onSuccess: (message: string) => void; onError: (message: string) => void }

export function ImportPage({ onChanged, onSuccess, onError }: Props) {
  const [file, setFile] = useState<File | null>(null)
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)

  async function downloadTemplate() {
    try {
      const blob = await api.downloadImportTemplate()
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement("a")
      anchor.href = url
      anchor.download = "account-import-template.xlsx"
      anchor.click()
      URL.revokeObjectURL(url)
    } catch (cause) {
      onError(cause instanceof Error ? cause.message : "Could not download template")
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!file) return
    setBusy(true)
    setResult(null)
    try {
      const nextResult = await api.importWorkbook(file)
      setResult(nextResult)
      setFile(null)
      onSuccess("Workbook imported successfully.")
      await onChanged()
    } catch (cause) {
      onError(cause instanceof Error ? cause.message : "Could not import workbook")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      <form onSubmit={submit} className={`${panelClass} p-5 md:p-6`}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3"><div className="grid size-10 place-items-center rounded-lg bg-muted"><FileSpreadsheet className="size-5" /></div><div><h2 className="font-semibold">Upload workbook</h2><p className="text-sm text-muted-foreground">Use an .xlsx file up to 5 MB.</p></div></div>
          <Button variant="outline" type="button" onClick={() => void downloadTemplate()}><Download className="size-4" /> Download template</Button>
        </div>
        <label className="mt-6 flex min-h-52 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed bg-muted/30 p-6 text-center hover:bg-muted/50">
          <input className="sr-only" type="file" accept=".xlsx" onChange={(event) => setFile(event.target.files?.[0] ?? null)} />
          <Upload className="size-7 text-muted-foreground" />
          <p className="mt-3 text-sm font-semibold">{file ? file.name : "Choose an Excel workbook"}</p>
          <p className="mt-1 text-xs text-muted-foreground">{file ? `${(file.size / 1024).toFixed(1)} KB selected` : "Click to browse your computer"}</p>
        </label>
        <Button className={`mt-5 ${actionClass}`} type="submit" disabled={!file || busy}>{busy ? "Importing…" : "Import workbook"}</Button>
        {result && <div className="mt-5 rounded-lg border bg-muted/40 p-4 text-sm"><p className="flex items-center gap-2 font-semibold"><CheckCircle2 className="size-4" /> Import completed</p><p className="mt-2">Processed {result.rowsProcessed} rows, {result.accountsProcessed} accounts, and {result.membershipsProcessed} enrollments. Created {result.accountsCreated} accounts and {result.subjectsCreated} subjects.</p></div>}
      </form>

      <aside className={`${panelClass} p-5 md:p-6`}>
        <h2 className="font-semibold">Workbook checklist</h2>
        <p className="mt-1 text-sm text-muted-foreground">Prepare your file before uploading.</p>
        <ol className="mt-5 space-y-5">
          <Step number="1" title="Download the template">Keep all column names unchanged.</Step>
          <Step number="2" title="Add enrollment rows">Use one row per account-to-subject enrollment.</Step>
          <Step number="3" title="Check role values">Use USER, ADMIN, STUDENT, or PROFESSOR as appropriate.</Step>
          <Step number="4" title="Upload the workbook">Existing accounts and subjects will be reused.</Step>
        </ol>
      </aside>
    </div>
  )
}

function Step({ number, title, children }: { number: string; title: string; children: string }) {
  return <li className="flex gap-3"><span className="grid size-7 shrink-0 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">{number}</span><div><p className="text-sm font-medium">{title}</p><p className="mt-0.5 text-sm text-muted-foreground">{children}</p></div></li>
}
