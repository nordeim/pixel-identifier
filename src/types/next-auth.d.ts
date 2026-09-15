import type { DefaultSession } from 'next-auth'

/**
 * Session augmentation: the JWT callback stores the user id on the token and
 * the session callback copies it onto `session.user.id` so server components
 * and actions have a stable database key for the signed-in user.
 */
declare module 'next-auth' {
  interface Session {
    user: {
      id: string
    } & DefaultSession['user']
  }
}
