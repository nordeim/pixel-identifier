'use client'

import { useSyncExternalStore } from 'react'

import {
  nextSidebarState,
  SIDEBAR_STORAGE_KEY,
  type SidebarState,
} from '@/lib/dashboard-nav'

/**
 * Tiny pub/sub store shared by the dashboard chrome: the desktop sidebar
 * rail state (toggled from the topbar, persisted to localStorage) and the
 * visitors segment counts (published by the visitors page, rendered in the
 * topbar subtitle). Client-only by construction — server components never
 * import this file.
 */

export interface VisitorsCounts {
  individual: number
  company: number
}

interface ChromeState {
  sidebar: SidebarState
  visitorsCounts: VisitorsCounts | null
  /** R11: selected visitor row ids (visitors page → topbar Export (N)). */
  selectedVisitorIds: string[]
  /** R21-F1: the CURRENT PAGE's row ids — the live's "Export All" exports
   * the rows currently displayed (the current tab's page), not the whole
   * account; the topbar scopes the href with these ids. */
  pageVisitorIds: string[]
}

let state: ChromeState = {
  sidebar: 'expanded',
  visitorsCounts: null,
  selectedVisitorIds: [],
  pageVisitorIds: [],
}
const listeners = new Set<() => void>()

function emit() {
  for (const listener of listeners) listener()
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function getSnapshot(): ChromeState {
  return state
}

function getServerSnapshot(): ChromeState {
  return state
}

export function useChromeState(): ChromeState {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}

export function toggleSidebar() {
  state = { ...state, sidebar: nextSidebarState(state.sidebar, { type: 'toggle' }) }
  persistSidebar(state.sidebar)
  emit()
}

/** Restore the persisted rail state after hydration (client only). */
export function hydrateSidebar() {
  let stored: string | null = null
  try {
    stored = window.localStorage.getItem(SIDEBAR_STORAGE_KEY)
  } catch {
    stored = null
  }
  const next = nextSidebarState(state.sidebar, { type: 'hydrate', value: stored })
  if (next !== state.sidebar) {
    state = { ...state, sidebar: next }
    emit()
  }
}

function persistSidebar(value: SidebarState) {
  try {
    window.localStorage.setItem(SIDEBAR_STORAGE_KEY, value)
  } catch {
    // Private mode / disabled storage: the toggle still works per-session.
  }
}

export function publishVisitorsCounts(counts: VisitorsCounts) {
  state = { ...state, visitorsCounts: counts }
  emit()
}

/** R11: the visitors table publishes its row selection; the topbar's
 * Export button swaps to "Export (N)" with an ids-scoped href. */
export function publishSelectedVisitorIds(ids: string[]) {
  state = { ...state, selectedVisitorIds: ids }
  emit()
}

/** R21-F1: the visitors table publishes the current page's row ids so the
 * topbar's "Export All" scopes to the displayed rows (the live's W() exports
 * D = the current tab's current page). */
export function publishPageVisitorIds(ids: string[]) {
  state = { ...state, pageVisitorIds: ids }
  emit()
}
