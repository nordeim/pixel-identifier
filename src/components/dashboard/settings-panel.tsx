'use client'

import { useActionState, useState } from 'react'
import { useRouter } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { Loader2 } from 'lucide-react'
import { updateProfileAction, deleteAccountAction } from '@/actions/settings'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

interface SettingsPanelProps {
  email: string
  company: string | null
  website: string | null
}

export function SettingsPanel({ email, company, website }: SettingsPanelProps) {
  const router = useRouter()
  const [state, formAction, pending] = useActionState(updateProfileAction, null)
  const [confirmText, setConfirmText] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  async function handleDelete(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    setDeleteError(null)
    setDeleting(true)
    const result = await deleteAccountAction(null, formData)
    if (!result.ok) {
      setDeleteError(result.error.message)
      setDeleting(false)
      return
    }
    // Destroy the JWT session together with the account — without this the
    // 30-day cookie would keep rendering a ghost dashboard (F-12).
    await signOut({ callbackUrl: '/?deleted=1' })
    router.refresh()
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold text-foreground">Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="company">Company Name</Label>
              <Input
                id="company"
                name="company"
                defaultValue={company ?? ''}
                placeholder="Acme Inc."
                autoComplete="organization"
                maxLength={120}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                name="website"
                type="url"
                defaultValue={website ?? ''}
                placeholder="https://yoursite.com"
                autoComplete="url"
                maxLength={253}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" defaultValue={email} disabled />
            </div>

            <div className="flex items-center gap-3">
              <Button type="submit" disabled={pending} className="font-semibold">
                {pending ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  'Save Changes'
                )}
              </Button>
              {state && state.ok && (
                <p role="status" className="text-sm font-medium text-teal-600">
                  Saved
                </p>
              )}
              {state && !state.ok && (
                <p role="alert" className="text-sm text-red-600">
                  {state.error.message}
                </p>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold text-red-600">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-foreground">Delete Account</p>
              <p className="text-xs text-muted-foreground">
                Permanently delete your account and all data.
              </p>
            </div>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="font-semibold">
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete your account?</AlertDialogTitle>
                  <AlertDialogDescription asChild>
                    <div className="space-y-3">
                      <span className="block">
                        This permanently deletes your account, every domain,
                        visitor, and event you have collected. There is no undo.
                      </span>
                      <span className="block text-sm font-medium text-foreground">
                        Type <span className="font-mono">{email}</span> to confirm:
                      </span>
                      <Input
                        value={confirmText}
                        onChange={(event) => setConfirmText(event.target.value)}
                        placeholder={email}
                        aria-label="Type your email to confirm deletion"
                        autoComplete="off"
                      />
                    </div>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setConfirmText('')}>Cancel</AlertDialogCancel>
                  <form onSubmit={handleDelete}>
                    <input type="hidden" name="confirmEmail" value={confirmText} />
                    <Button
                      type="submit"
                      variant="destructive"
                      disabled={confirmText.trim().toLowerCase() !== email.toLowerCase() || deleting}
                      className="font-semibold"
                    >
                      {deleting ? (
                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                      ) : (
                        'Delete Account'
                      )}
                    </Button>
                  </form>
                </AlertDialogFooter>
                {deleteError && (
                  <p role="alert" className="text-xs text-red-600">
                    {deleteError}
                  </p>
                )}
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
