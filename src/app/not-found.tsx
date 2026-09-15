import Link from 'next/link'
import { Compass } from 'lucide-react'
import { Button } from '@/components/ui/button'

/** Root not-found boundary (F-27). */
export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-app px-4 text-center">
      <span
        className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15"
        aria-hidden="true"
      >
        <Compass className="h-7 w-7 text-amber-600" />
      </span>
      <h1 className="mt-5 text-2xl font-extrabold tracking-tight text-foreground">
        Page not found
      </h1>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
        The page you&apos;re looking for doesn&apos;t exist or may have moved.
      </p>
      <div className="mt-6 flex items-center gap-3">
        <Button asChild className="font-semibold">
          <Link href="/">Back to home</Link>
        </Button>
        <Button asChild variant="outline" className="font-semibold">
          <Link href="/dashboard">Go to dashboard</Link>
        </Button>
      </div>
    </div>
  )
}
