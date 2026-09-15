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
}

let state: ChromeState = { sidebar: 'expanded', visitorsCounts: null }
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
