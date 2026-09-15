import { z } from 'zod'

/** Shared result envelope for all server actions (scandihaven convention). */
export type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: { code: string; message: string; fieldErrors?: Record<string, string[]> } }

export function fail(
  code: string,
  message: string,
  fieldErrors?: Record<string, string[]>,
): { ok: false; error: { code: string; message: string; fieldErrors?: Record<string, string[]> } } {
  return { ok: false, error: { code, message, fieldErrors } }
}

export const emailSchema = z
  .string()
  .trim()
  .min(1, 'Email is required')
  .email('Enter a valid email address')
  .max(254)
  .transform((value) => value.toLowerCase())

export const passwordSchema = z
  .string()
  .min(6, 'Password must be at least 6 characters')
  .max(72, 'Password must be at most 72 characters')

export const signUpSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
})

const HOSTNAME_SOURCE = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/i

/**
 * Normalise a user-supplied domain: strip scheme/path/www, lowercase, and
 * validate against the hostname grammar so it can never smuggle a path,
 * query, or injection payload into the snippet or the DB.
 */
export function normalizeDomain(input: string): string | null {
  const trimmed = input
    .trim()
    .toLowerCase()
    .replace(/^[a-z]+:\/\//, '')
    .replace(/^www\./, '')
    .split(/[/?#]/)[0]
    .replace(/\.+$/, '')
  if (!trimmed || trimmed.length > 253 || !HOSTNAME_SOURCE.test(trimmed)) return null
  return trimmed
}

export const addDomainSchema = z.object({
  domain: z
    .string()
    .trim()
    .min(1, 'Domain is required')
    .max(253, 'Domain is too long'),
})

export const updateProfileSchema = z.object({
  company: z.string().trim().max(120, 'Company name is too long').optional().or(z.literal('')),
  website: z
    .string()
    .trim()
    .max(253, 'URL is too long')
    .optional()
    .or(z.literal('')),
  name: z.string().trim().max(120, 'Name is too long').optional().or(z.literal('')),
})

export const changePlanSchema = z.object({
  plan: z.enum(['free', 'starter', 'growth', 'scale']),
  cycle: z.enum(['monthly', 'annual']),
})

/** Ingest payload accepted from the browser pixel. */
export const trackPayloadSchema = z.object({
  k: z.string().trim().min(3).max(64), // site key
  u: z.string().trim().max(2048).optional(), // full page URL
  p: z.string().trim().max(2048).default('/'), // pathname
  r: z.string().trim().max(2048).optional().default(''), // referrer
  t: z.string().trim().max(500).optional().default(''), // title
  v: z.string().trim().max(64).optional(), // visitor id from cookie
  w: z.number().int().positive().max(20000).optional(), // screen width
  h: z.number().int().positive().max(20000).optional(), // screen height
})
