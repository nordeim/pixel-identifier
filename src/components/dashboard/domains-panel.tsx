'use client'

import { useActionState, useEffect, useRef, useState } from 'react'
import { CircleAlert, CircleCheckBig, Globe, Loader2, Plus } from 'lucide-react'
import { Trash2Icon } from '@/components/dashboard/live-icons'
import { addDomainAction, deleteDomainAction, type DomainDto } from '@/actions/domains'
import type { ActionResult } from '@/lib/validation'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { LegacyBadge, LEGACY_BADGE_SECONDARY } from '@/components/dashboard/content-badges'
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
  // R20-F2: the live's add-domain input is a controlled field — its
  // submit renders DISABLED while the input is empty (captured DOM:
  // type="submit" disabled="" + value=""), replacing the native
  // empty-field tooltip path. The input is cleared after a successful add
  // (preserving the React-19 auto-reset the uncontrolled field had).
  const [domainValue, setDomainValue] = useState('')

  // R20-F2: clear the controlled input when a fresh SUCCESSFUL action
  // result lands — React's "adjust state during render" pattern (the
  // documented replacement for a reset effect; setState during render of
  // the same component re-renders immediately without committing).
  const [prevAddResult, setPrevAddResult] = useState(state)
  if (state !== prevAddResult) {
    setPrevAddResult(state)
    if (state?.ok) setDomainValue('')
  }

  // Toasts fire from an effect keyed on state IDENTITY, never from onSubmit:
  // onSubmit runs before the action resolves and would re-announce the
  // previous submission's result (F-07). The toast is an external-system
  // update (sonner) — state resets live above, in the render-phase block.
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
    <div className="max-w-3xl space-y-6">
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Add a Domain</CardTitle>
          <p className="text-sm text-muted-foreground">
            Register a new domain to start tracking visitors.
          </p>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="flex gap-3">
            <Input
              name="domain"
              placeholder="yoursite.com"
              className="flex-1"
              aria-label="Domain to register"
              autoComplete="off"
              value={domainValue}
              onChange={(e) => setDomainValue(e.target.value)}
            />
            {/* Live CTA: gradient-primary + glow with a Plus glyph (R6-M3).
                R12-F6: the live builds this as Button base + overrides only
                (no variant fragment — their DOM shows no bg-primary); cva
                treats variant={null} size={null} as an explicit skip.
                R20-F2: disabled while empty — the live's captured state. */}
            <Button
              type="submit"
              disabled={pending || domainValue.trim() === ''}
              variant={null}
              size={null}
              className="gradient-primary text-primary-foreground shadow-lg glow-primary hover:opacity-90 transition-all duration-300 font-semibold h-10 px-4 py-2"
            >
              {pending ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <>
                  <Plus className="h-3.5 w-3.5 mr-1.5" aria-hidden="true" />
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

      <Card className="shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Your Domains</CardTitle>
        </CardHeader>
        {/* R22-F4: the live's empty branch — a plain DIV (text-center
            first) as a DIRECT child of the p-0 card content; the list
            branch already renders p-0 + divide-y, so the empty state
            keeps the same card geometry (no padded CardContent wrapper). */}
        <CardContent className="p-0">
          {domains.length === 0 ? (
            <div className="text-center py-12 text-sm text-muted-foreground">
              No domains yet. Add one above to get started.
            </div>
          ) : (
            <div className="divide-y divide-border">
              {domains.map((domain) => (
                <div
                  key={domain.id}
                  className="flex items-center justify-between px-5 py-4 hover:bg-muted/20 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Globe className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold">{domain.domain}</span>
                        {domain.status === 'verified' ? (
                          /* R11: Verified rides the DEFAULT variant + the
                              live's gradient overrides (new-gen string). */
                          <Badge variant="default" className="text-[10px] px-1.5 py-0 gradient-primary text-primary-foreground border-0">
                            <CircleCheckBig className="h-2.5 w-2.5 mr-0.5" aria-hidden="true" />
                            Verified
                          </Badge>
                        ) : (
                          /* R16 D1: the live's Pending badge ships the LEGACY
                              generation (base border + secondary foreground). */
                          <LegacyBadge className={cn(LEGACY_BADGE_SECONDARY, 'text-[10px] px-1.5 py-0')}>
                            <CircleAlert className="h-2.5 w-2.5 mr-0.5" aria-hidden="true" />
                            Pending
                          </LegacyBadge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Added {formatDate(domain.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    {/* Live row: big number = identified visitors, small
                        "N visitors" = total (R5-H5 / R5-M6). */}
                    <div className="text-right">
                      <div className="text-sm font-semibold">
                        {domain.identifiedCount}
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        {domain.visitorCount === 1 ? '1 visitor' : `${domain.visitorCount} visitors`}
                      </div>
                    </div>

                    {/* Deleting cascades visitors + events: always confirm (F-26). */}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label={`Delete ${domain.domain}`}
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2Icon className="h-3.5 w-3.5" />
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
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
