"use client"

/*
 * From Uiverse.io by Shoh2008 - https://uiverse.io/Shoh2008/big-deer-80
 * MIT License, Copyright (c) Shoh2008 (c0der)
 *
 * A round checkbox that splashes in the accent color (--primary) when you tick
 * it. Boxes that load already checked show the filled state without replaying
 * the splash; the splash only plays after the person clicks. Clicks don't
 * reach the row underneath, so it works inside clickable list rows.
 *
 * Styles live in styles.css under .sf-cte (import "@nateadmin/ui/styles.css").
 * First used as the CTE checkbox on the Sales Deals table.
 */

import * as React from "react"
import { cn } from "@/lib/utils"

function SplashCheckbox({
  checked,
  disabled,
  label,
  onChange,
  className,
}: {
  checked: boolean
  disabled?: boolean
  /** Read by screen readers; the box has no visible text. */
  label: string
  onChange: (checked: boolean) => void
  className?: string
}) {
  const id = React.useId()
  const filterId = `${id}-goo`
  const [touched, setTouched] = React.useState(false)

  return (
    <div
      data-slot="splash-checkbox"
      className={cn("sf-cte", className)}
      data-animate={touched ? "true" : "false"}
      onClick={(event) => event.stopPropagation()}
    >
      <div className="sf-cte-box">
        <input
          id={id}
          type="checkbox"
          aria-label={label}
          checked={checked}
          disabled={disabled}
          onChange={(event) => {
            setTouched(true)
            onChange(event.target.checked)
          }}
        />
        <label htmlFor={id} />
        <svg fill="none" viewBox="0 0 15 14" height="14" width="15" aria-hidden>
          <path d="M2 8.36364L6.23077 12L13 2" />
        </svg>
      </div>
      <svg className="sf-cte-filter" version="1.1" xmlns="http://www.w3.org/2000/svg" aria-hidden>
        <defs>
          <filter id={filterId}>
            <feGaussianBlur result="blur" stdDeviation="4" in="SourceGraphic" />
            <feColorMatrix
              result={filterId}
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -7"
              mode="matrix"
              in="blur"
            />
            <feBlend in2={filterId} in="SourceGraphic" />
          </filter>
        </defs>
      </svg>
    </div>
  )
}

export { SplashCheckbox }
