import type { ReactNode } from "react"
import { Search } from "lucide-react"

export const fieldClass =
  "mt-1.5 h-10 w-full rounded-md border border-[#d6cec5] bg-white px-3 text-sm text-[#1c1917] outline-none placeholder:text-[#a8a29e] focus:border-[#800000] focus:ring-2 focus:ring-[#800000]/15"

export const panelClass = "rounded-xl border border-[#e7e0d8] bg-white shadow-sm shadow-[#800000]/5"

export const actionClass = "bg-[#800000] text-white shadow-sm hover:bg-[#680000]"

export function SectionHeading({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#eee7df] px-5 py-4">
      <div>
        <h2 className="font-bold text-[#800000]">{title}</h2>
        <p className="mt-0.5 text-sm text-[#78716c]">{description}</p>
      </div>
      {action}
    </div>
  )
}

export function SearchField({ value, onChange, placeholder }: { value: string; onChange: (value: string) => void; placeholder: string }) {
  return (
    <label className="relative block w-full sm:max-w-xs">
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#DAA520]" />
      <input
        className="h-10 w-full rounded-md border border-[#d6cec5] bg-white pl-9 pr-3 text-sm outline-none placeholder:text-[#a8a29e] focus:border-[#800000] focus:ring-2 focus:ring-[#800000]/15"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
      />
    </label>
  )
}
