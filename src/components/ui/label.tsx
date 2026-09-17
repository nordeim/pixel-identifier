"use client"

import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"

import { cn } from "@/lib/utils"

/**
 * shadcn Label, verbatim off the live app bundle (R15 re-extraction): the
 * new-generation string — `text-sm font-medium leading-none` with the
 * peer-disabled states, no data-slot attr, no flex/gap/select-none chrome
 * (the R11-era string carried the old-generation layout classes).
 */
function Label({
  className,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      className={cn(
        "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
        className
      )}
      {...props}
    />
  )
}

export { Label }
