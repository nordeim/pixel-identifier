import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Legacy shadcn Input, verbatim off the live app bundle (R11-F2):
 * `bg-background` (the live input computes to the app canvas #F6F7F9), a
 * 2px ring-offset focus ring, and no transition/shadow chrome.
 */
function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      className={cn(
        "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className,
      )}
      {...props}
    />
  )
}

export { Input }
