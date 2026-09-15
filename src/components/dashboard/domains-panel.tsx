'use client'

import { useActionState } from 'react'
import { Globe, Loader2, Plus, Trash2 } from 'lucide-react'
import { addDomainAction, deleteDomainAction, type DomainDto } from '@/actions/domains'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/format'
import { useToast } from '@/hooks/use-toast'

interface DomainsPanelProps {
  domains: DomainDto[]
  domainLimit: number // -1 = unlimited
  planName: string
}

export function DomainsPanel({ domains, domainLimit, planName }: DomainsPanelProps) {
  const [state, formAction, pending] = useActionState(addDomainAction, null)
  const { toast } = useToast()

  const atLimit = domainLimit !== -1 && domains.length >= domainLimit

  function notifyResult() {
    if (state && !state.ok) {
      toast({
        title: 'Could not add domain',
        description: state.error.message,
        variant: 'destructive',
      })
    } else if (state && state.ok) {
      toast({ title: 'Domain added successfully' })
    }
  }

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
          <form action={formAction} className="flex flex-col gap-2.5 sm:flex-row" onSubmit={notifyResult}>
            <div className="relative flex-1">
              <Globe
                className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                name="domain"
                placeholder="yoursite.com"
                className="pl-9"
                aria-label="Domain to register"
                autoComplete="off"
                required
              />
            </div>
            <Button type="submit" disabled={pending} className="font-semibold">
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

          {atLimit && (
            <p className="mt-3 rounded-lg bg-primary/15 px-3.5 py-2.5 text-xs leading-relaxed text-amber-800">
              The {planName} plan includes {domainLimit}{' '}
              {domainLimit === 1 ? 'domain' : 'domains'}.{' '}
              <a href="/dashboard/pricing" className="font-semibold underline underline-offset-2">
                Upgrade to add more
              </a>
              .
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
          <ul className="space-y-2.5">
            {domains.map((domain) => (
              <li
                key={domain.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3.5 shadow-sm"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/15" aria-hidden="true">
                    <Globe className="h-5 w-5 text-amber-600" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">{domain.domain}</p>
                    <p className="text-xs text-muted-foreground">
                      Added {formatDate(domain.createdAt)} · {domain.visitorCount}{' '}
                      {domain.visitorCount === 1 ? 'visitor' : 'visitors'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  {domain.status === 'verified' ? (
                    <Badge variant="secondary" className="bg-primary/20 text-amber-800 hover:bg-primary/20">
                      Verified
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-muted text-muted-foreground hover:bg-muted">
                      Pending
                    </Badge>
                  )}
                  <form action={deleteDomainAction}>
                    <input type="hidden" name="siteId" value={domain.id} />
                    <Button
                      type="submit"
                      variant="ghost"
                      size="icon"
                      aria-label={`Delete ${domain.domain}`}
                      className="text-muted-foreground hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
