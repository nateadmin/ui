"use client"

import * as React from "react"
import { XIcon } from "lucide-react"
import { cn } from "@/lib/utils"

/*
 * A field for several email addresses. Each address becomes a chip when you
 * press Enter, comma, semicolon or space, leave the field, or paste a list.
 * Backspace in the empty field removes the last chip. Addresses that don't
 * look like email are shown in red so they can be fixed before sending.
 */

const EMAIL = /^[^\s@,;]+@[^\s@,;]+\.[^\s@,;]+$/

function isEmail(value: string) {
  return EMAIL.test(value)
}

function EmailInput({
  value,
  onValueChange,
  placeholder = "name@company.com",
  id,
  className,
  "aria-label": ariaLabel,
  "aria-describedby": describedBy,
}: {
  value: string[]
  onValueChange: (value: string[]) => void
  placeholder?: string
  id?: string
  className?: string
  "aria-label"?: string
  "aria-describedby"?: string
}) {
  const [draft, setDraft] = React.useState("")
  const inputRef = React.useRef<HTMLInputElement>(null)

  const add = (text: string) => {
    const parts = text
      .split(/[\s,;]+/)
      .map((p) => p.trim().replace(/^<|>$/g, ""))
      .filter(Boolean)
    if (parts.length === 0) return
    const lower = value.map((v) => v.toLowerCase())
    const next = [...value]
    for (const p of parts) {
      if (!lower.includes(p.toLowerCase())) {
        next.push(p)
        lower.push(p.toLowerCase())
      }
    }
    onValueChange(next)
  }

  const commit = () => {
    if (draft.trim()) add(draft)
    setDraft("")
  }

  return (
    <div
      onClick={() => inputRef.current?.focus()}
      className={cn(
        "border-input dark:bg-input/30 flex min-h-9 w-full cursor-text flex-wrap items-center gap-1.5 rounded-lg border bg-transparent px-2 py-1.5 text-sm transition-shadow",
        "focus-within:shadow-[0_0_0_2px_color-mix(in_oklch,var(--foreground)_8%,transparent),0_0_5px_color-mix(in_oklch,var(--foreground)_12%,transparent)]",
        className,
      )}
    >
      {value.map((email) => {
        const ok = isEmail(email)
        return (
          <span
            key={email}
            className={cn(
              "inline-flex h-6 max-w-full items-center gap-1 rounded-md pr-1 pl-2 text-xs",
              ok ? "bg-muted text-foreground" : "bg-destructive/10 text-destructive",
            )}
          >
            <span className="truncate">{email}</span>
            {ok ? null : <span className="sr-only">(not a valid email)</span>}
            <button
              type="button"
              aria-label={`Remove ${email}`}
              onClick={(e) => {
                e.stopPropagation()
                onValueChange(value.filter((v) => v !== email))
                inputRef.current?.focus()
              }}
              className="hover:bg-foreground/10 flex size-4 cursor-pointer items-center justify-center rounded"
            >
              <XIcon className="size-3" />
            </button>
          </span>
        )
      })}
      <input
        ref={inputRef}
        id={id}
        // Text, not type="email": browsers strip spaces from email fields, which would hide the separator.
        type="text"
        inputMode="email"
        autoComplete="email"
        value={draft}
        aria-label={ariaLabel}
        aria-describedby={describedBy}
        placeholder={value.length === 0 ? placeholder : ""}
        onChange={(e) => {
          const text = e.target.value
          // A separator typed at the end turns the text into a chip.
          if (/[\s,;]$/.test(text)) {
            add(text)
            setDraft("")
          } else {
            setDraft(text)
          }
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            if (draft.trim()) {
              e.preventDefault()
              commit()
            }
          } else if (e.key === "Backspace" && draft === "" && value.length > 0) {
            onValueChange(value.slice(0, -1))
          }
        }}
        onPaste={(e) => {
          const text = e.clipboardData.getData("text")
          if (/[\s,;]/.test(text.trim())) {
            e.preventDefault()
            add(draft + text)
            setDraft("")
          }
        }}
        onBlur={commit}
        className="placeholder:text-muted-foreground h-6 min-w-32 flex-1 bg-transparent px-1 outline-none"
      />
    </div>
  )
}

export { EmailInput, isEmail }
