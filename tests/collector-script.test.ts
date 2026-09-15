import { describe, expect, it, vi } from 'vitest'
import vm from 'node:vm'
import { COLLECTOR_SCRIPT } from '@/lib/collector-script'

interface CollectorHarness {
  /** Beacon bodies captured from sendBeacon, as Blobs. */
  beacons: Blob[]
  /** Parsed beacon payload by index. */
  payload: (index: number) => Promise<Record<string, unknown>>
  /** The sandboxed `history` object, post monkey-patch. */
  history: { pushState: (...args: unknown[]) => void; replaceState: (...args: unknown[]) => void }
  /** How many times the *original* history methods ran. */
  originalCalls: { push: number; replace: number }
  location: { href: string; pathname: string; search: string }
  popstateHandler: (() => void) | null
}

/** Execute the collector in a VM with just enough browser to run. */
function runCollector(): CollectorHarness {
  const beacons: Blob[] = []
  const originalCalls = { push: 0, replace: 0 }
  const history = {
    pushState: vi.fn(() => {
      originalCalls.push += 1
    }),
    replaceState: vi.fn(() => {
      originalCalls.replace += 1
    }),
  }
  const location = {
    href: 'https://customer.example/landing?utm=x',
    pathname: '/landing',
    search: '?utm=x',
  }
  const storage = new Map<string, string>()
  const localStorage = {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => storage.set(key, value),
  }
  let popstateHandler: (() => void) | null = null

  const document = {
    currentScript: {
      getAttribute: (name: string) =>
        name === 'data-site'
          ? 'px_0123456789abcdef'
          : 'https://collector.test/pixel.js',
    },
    title: 'Customer page',
    referrer: '',
  }
  const navigator = {
    sendBeacon: (_url: string, body: Blob) => {
      beacons.push(body)
      return true
    },
  }
  const sandbox = {
    document,
    history,
    location,
    localStorage,
    navigator,
    fetch: vi.fn(),
    window: {
      addEventListener: (event: string, handler: () => void) => {
        if (event === 'popstate') popstateHandler = handler
      },
    },
    URL,
    Blob,
    Date,
    Math,
    JSON,
  }
  vm.createContext(sandbox)
  vm.runInContext(COLLECTOR_SCRIPT, sandbox)

  return {
    beacons,
    payload: async (index: number) => JSON.parse(await beacons[index].text()) as Record<string, unknown>,
    history: history as unknown as CollectorHarness['history'],
    originalCalls,
    location,
    popstateHandler,
  }
}

describe('collector script', () => {
  it('ships an initial pageview beacon with the site key and visitor id', async () => {
    const h = runCollector()
    expect(h.beacons).toHaveLength(1)
    const payload = await h.payload(0)
    expect(payload.k).toBe('px_0123456789abcdef')
    expect(payload.u).toBe('https://customer.example/landing?utm=x')
    expect(payload.p).toBe('/landing?utm=x')
    expect(typeof payload.v).toBe('string')
    expect((payload.v as string).length).toBeGreaterThanOrEqual(8)
  })

  it('persists a stable visitor id in localStorage', async () => {
    const h = runCollector()
    const first = await h.payload(0)
    h.location.pathname = '/next'
    h.location.href = 'https://customer.example/next'
    h.history.pushState({}, '', '/next')
    const second = await h.payload(1)
    expect(second.v).toBe(first.v)
  })

  it('calls the ORIGINAL replaceState exactly once per wrapped call (no recursion)', () => {
    const h = runCollector()
    expect(() => h.history.replaceState({}, '', '/other')).not.toThrow()
    expect(h.originalCalls.replace).toBe(1)
  })

  it('calls the ORIGINAL pushState exactly once per wrapped call', () => {
    const h = runCollector()
    expect(() => h.history.pushState({}, '', '/next')).not.toThrow()
    expect(h.originalCalls.push).toBe(1)
  })

  it('fires a beacon when a pushState navigation changes the path', async () => {
    const h = runCollector()
    expect(h.beacons).toHaveLength(1) // initial pageview
    h.location.pathname = '/pricing'
    h.location.href = 'https://customer.example/pricing'
    h.history.pushState({}, '', '/pricing')
    expect(h.beacons).toHaveLength(2)
    expect((await h.payload(1)).p).toBe('/pricing?utm=x')
  })

  it('does not fire a beacon when the path is unchanged', () => {
    const h = runCollector()
    h.history.pushState({}, '', '/landing') // same path
    expect(h.beacons).toHaveLength(1)
  })

  it('fires a beacon on popstate navigations', () => {
    const h = runCollector()
    expect(h.popstateHandler).toBeTypeOf('function')
    h.location.pathname = '/about'
    h.popstateHandler?.()
    expect(h.beacons).toHaveLength(2)
  })
})
