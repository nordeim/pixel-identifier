'use client'

import { useActionState, useEffect, useRef } from 'react'
import { CheckCircle2, Clock, Globe, Loader2, Plus, Trash2 } from 'lucide-react'
import { addDomainAction, deleteDomainAction, type DomainDto } from '@/actions/domains'
import type { ActionResult } from '@/lib/validation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { formatDate } from '@/lib/format'
import { useToast } from '@/hooks/use-toast'

interface DomainsPanelProps {
  domains: DomainDto[]
}

export function DomainsPanel({ domains }: DomainsPanelProps) {
  const [state, formAction, pending] = useActionState(addDomainAction, null)
  const [deleteState, deleteFormAction] = useActionState(deleteDomainAction, null)
  const { toast } = useToast()

  // Toasts fire from an effect keyed on state IDENTITY, never from onSubmit:
  // onSubmit runs before the action resolves and would re-announce the
  // previous submission's result (F-07).
  const lastAddResult = useRef<ActionResult<DomainDto> | null>(null)
  useEffect(() => {
    if (state === null || state === lastAddResult.current) return
    lastAddResult.current = state
    if (state.ok) {
      toast({ title: 'Domain added successfully' })
    } else {
      toast({
        title: 'Could not add domain',
        description: state.error.message,
        variant: 'destructive',
      })
    }
  }, [state, toast])

  const lastDeleteResult = useRef<ActionResult<{ deleted: true }> | null>(null)
  useEffect(() => {
    if (deleteState === null || deleteState === lastDeleteResult.current) return
    lastDeleteResult.current = deleteState
    if (deleteState.ok) {
      toast({ title: 'Domain deleted', description: 'Its visitors and events were removed.' })
    } else {
      toast({
        title: 'Could not delete domain',
        description: deleteState.error.message,
        variant: 'destructive',
      })
    }
  }, [deleteState, toast])

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold text-foreground">Add a Domain</CardTitle>
          <p className="text-sm text-muted-foreground">
            Register a new domain to start tracking visitors.
          </p>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="flex flex-col gap-2.5 sm:flex-row">
            <div className="flex-1">
              <Input
                name="domain"
                placeholder="yoursite.com"
                aria-label="Domain to register"
                autoComplete="off"
                required
              />
            </div>
            <Button type="submit" disabled={pending} variant="outline" className="font-semibold">
              {pending ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <>
                  <Plus className="mr-1.5 h-4 w-4" aria-hidden="true" />
                  Add Domain
                </>
              )}
            </Button>
          </form>

          {state && !state.ok && state.error.fieldErrors?.domain && (
            <p role="alert" className="mt-2 text-xs text-red-600">
              {state.error.fieldErrors.domain[0]}
            </p>
          )}
        </CardContent>
      </Card>

      <section aria-labelledby="domains-heading">
        <h2 id="domains-heading" className="mb-3 text-base font-bold text-foreground">
          Your Domains
        </h2>

        {domains.length === 0 ? (
          <Card className="shadow-sm">
            <CardContent className="py-12 text-center">
              <p className="text-sm text-muted-foreground">
                No domains yet. Add one above to get started.
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card className="shadow-sm">
            <ul className="divide-y divide-border/60">
              {domains.map((domain) => (
                <li
                  key={domain.id}
                  className="flex items-center justify-between gap-4 px-5 py-4"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <Globe className="h-5 w-5 shrink-0 text-amber-500" aria-hidden="true" />
                    <div className="min-w-0">
                      <p className="flex flex-wrap items-center gap-2">
                        <span className="truncate text-sm font-bold text-foreground">{domain.domain}</span>
                        {domain.status === 'verified' ? (
                          <Badge variant="secondary" className="gap-1 bg-primary/20 text-amber-900 hover:bg-primary/20">
                            <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                            Verified
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="gap-1 bg-muted text-muted-foreground hover:bg-muted">
                            <Clock className="h-3 w-3" aria-hidden="true" />
                            Pending
                          </Badge>
                        )}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        Added {formatDate(domain.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-5">
                    <div className="text-right">
                      <p className="text-sm font-semibold tabular-nums leading-none text-foreground">
                        {domain.visitorCount}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {domain.visitorCount === 1 ? 'visitor' : 'visitors'}
                      </p>
                    </div>

                    {/* Deleting cascades visitors + events: always confirm (F-26). */}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label={`Delete ${domain.domain}`}
                          className="text-muted-foreground hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete {domain.domain}?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This permanently removes the domain, its {domain.visitorCount}{' '}
                            {domain.visitorCount === 1 ? 'visitor' : 'visitors'}, and every recorded
                            event. This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <form action={deleteFormAction}>
                            <input type="hidden" name="siteId" value={domain.id} />
                            <AlertDialogAction
                              type="submit"
                              className="bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-600"
                            >
                              Delete domain
                            </AlertDialogAction>
                          </form>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </section>
    </div>
  )
}
