import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Legacy shadcn Card family, verbatim off the live app bundle (R11-F2):
 * a flat `rounded-lg border bg-card shadow-sm` root (no data-slot attrs,
 * no py-6/gap-6 — the new-generation root added +48px to every card),
 * `flex flex-col space-y-1.5 p-6` headers and `p-6 pt-0` content.
 * CardTitle renders an h3 with the live's font-display base; sizes
 * (text-base / text-lg) are passed per usage like the live DOM.
 */
function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "rounded-lg border bg-card text-card-foreground shadow-sm",
        className,
      )}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("flex flex-col space-y-1.5 p-6", className)}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<"h3">) {
  return (
    <h3
      className={cn("font-semibold tracking-tight font-display", className)}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("text-sm text-muted-foreground", className)} {...props} />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("p-6 pt-0", className)} {...props} />
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("flex items-center p-6 pt-0", className)}
      {...props}
    />
  )
}

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
