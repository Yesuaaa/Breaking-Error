import type { ReactNode } from "react"
import { Search } from "lucide-react"

export const fieldClass =
  "mt-1.5 h-10 w-full rounded-md border border-[#800000]/20 bg-white px-3 text-sm outline-none transition-colors placeholder:text-[#800000]/35 focus:border-[#DAA520] focus:ring-2 focus:ring-[#DAA520]/25"

export const panelClass =
  "rounded-xl border border-[#800000]/15 bg-white shadow-sm shadow-[#800000]/5"

export const actionClass =
  "bg-[#DAA520] text-[#4A0000] hover:bg-[#c8941c] focus-visible:ring-[#800000]"

export function SectionHeading({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#800000]/10 px-5 py-4">
      <div>
        <h2 className="font-semibold text-[#800000]">{title}</h2>
        <p className="mt-0.5 text-sm text-[#800000]/60">{description}</p>
      </div>
      {action}
    </div>
  )
}

export function SearchField({ value, onChange, placeholder }: { value: string; onChange: (value: string) => void; placeholder: string }) {
  return (
    <label className="relative block w-full sm:max-w-xs">
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#800000]/45" />
      <input
        className="h-10 w-full rounded-md border border-[#800000]/20 bg-white pl-9 pr-3 text-sm outline-none focus:border-[#DAA520] focus:ring-2 focus:ring-[#DAA520]/25"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
      />
    </label>
  )
}
