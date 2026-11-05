"use client"

import * as React from "react"
import { ChevronDownIcon, SearchIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

/*
 * The bar that sits on top of a list, table, or board.
 * One component, built from parts. A page includes only the parts it needs:
 *
 *   <Toolbar>
 *     <ToolbarViews />      Board / List (optional)
 *     <ToolbarSearch />     fills the free space (optional)
 *     <ToolbarFilter />     one per filter, any number (optional)
 *     <ToolbarActions>      pushed to the right edge (optional)
 *       <Button>New project</Button>
 *     </ToolbarActions>
 *   </Toolbar>
 *
 * Every control is the same height, so any mix lines up. On narrow screens
 * the parts wrap onto new rows and the search takes a full row.
 */

function Toolbar({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      role="toolbar"
      data-slot="toolbar"
      className={cn(
        "bg-card text-card-foreground flex w-full flex-wrap items-center gap-2 rounded-xl border p-2",
        className
      )}
      {...props}
    />
  )
}

type ToolbarView = { value: string; label: string; icon?: React.ReactNode }

function ToolbarViews({
  views,
  value,
  onValueChange,
  className,
  "aria-label": ariaLabel = "View",
}: {
  views: ToolbarView[]
  value: string
  onValueChange: (value: string) => void
  className?: string
  "aria-label"?: string
}) {
  return (
    <ToggleGroup
      data-slot="toolbar-views"
      value={[value]}
      onValueChange={(next: unknown[]) => {
        const picked = next.at(-1)
        if (typeof picked === "string") onValueChange(picked)
      }}
      spacing={1}
      aria-label={ariaLabel}
      className={cn("bg-muted shrink-0 rounded-lg p-0.5", className)}
    >
      {views.map((view) => (
        <ToggleGroupItem
          key={view.value}
          value={view.value}
          className="text-muted-foreground aria-pressed:bg-primary aria-pressed:text-primary-foreground aria-pressed:hover:bg-primary h-8 px-3"
        >
          {view.icon}
          {view.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  )
}

function ToolbarSearch({
  className,
  placeholder = "Search",
  "aria-label": ariaLabel,
  ...props
}: React.ComponentProps<"input">) {
  return (
    <div data-slot="toolbar-search" className={cn("relative min-w-48 flex-[1_1_16rem]", className)}>
      <SearchIcon
        aria-hidden="true"
        className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
      />
      <Input
        type="search"
        placeholder={placeholder}
        aria-label={ariaLabel ?? placeholder}
        className="h-9 pl-9"
        {...props}
      />
    </div>
  )
}

type ToolbarFilterOption = {
  value: string
  label: string
  /** Optional status color, shown as a dot before the label. Any CSS color or gradient. */
  color?: string
}

function Dot({ color }: { color?: string }) {
  if (!color) return null
  return <span aria-hidden="true" className="size-2 shrink-0 rounded-full" style={{ background: color }} />
}

function ToolbarFilter({
  label,
  options,
  value,
  onValueChange,
  icon,
  className,
}: {
  /** Shown before the value, as "Label: Value". Leave out to show the value alone. */
  label?: string
  options: ToolbarFilterOption[]
  value: string
  onValueChange: (value: string) => void
  icon?: React.ReactNode
  className?: string
}) {
  const current = options.find((o) => o.value === value) ?? options[0]
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="outline"
            size="lg"
            data-slot="toolbar-filter"
            className={cn("shrink-0 gap-2 font-normal", className)}
          />
        }
      >
        {icon}
        <Dot color={current?.color} />
        <span>
          {label ? <span className="text-muted-foreground">{label}: </span> : null}
          {current?.label}
        </span>
        <ChevronDownIcon aria-hidden="true" className="text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuRadioGroup value={value} onValueChange={(v: unknown) => onValueChange(String(v))}>
          {options.map((o) => (
            <DropdownMenuRadioItem key={o.value} value={o.value} className="gap-2">
              <Dot color={o.color} />
              {o.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function ToolbarActions({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="toolbar-actions"
      className={cn("ml-auto flex shrink-0 flex-wrap items-center gap-2", className)}
      {...props}
    />
  )
}

export { Toolbar, ToolbarActions, ToolbarFilter, ToolbarSearch, ToolbarViews }
export type { ToolbarFilterOption, ToolbarView }
