import { describe, it, expect, vi } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { runInNewContext } from 'node:vm'
import { createRouter, createMemoryHistory } from 'vue-router'
import { routes, validateCategory } from '../../router/index.js'

describe('routing and legacy deployment recovery', () => {
  it('handles unsupported categories even when changing parameters on an existing comparison route', async () => {
    const inert = routes.map(route => ({ ...route, component: { template: '<div />' } }))
    const router = createRouter({ history: createMemoryHistory(), routes: inert })
    router.beforeEach(validateCategory)
    await router.push('/compare/Spell/Counterspell')
    expect(router.currentRoute.value.name).toBe('compare')
    await router.push('/compare/constructor/Counterspell')
    expect(router.currentRoute.value.name).toBe('not-found')
    await router.push('/unknown-page')
    expect(router.currentRoute.value.name).toBe('not-found')
  })
  it('waits for scoped legacy-cache cleanup without deleting unrelated caches', async () => {
    const handlers = {}, pending = []
    const cacheDelete = vi.fn(async () => true), unregister = vi.fn(async () => true)
    const scope = 'https://example.test/'
    runInNewContext(readFileSync(resolve('public/sw.js'), 'utf8'), {
      self: { addEventListener: (event, callback) => handlers[event] = callback, skipWaiting: vi.fn(), registration: { scope, unregister } },
      caches: { keys: async () => ['tome-of-changes-v1', `workbox-precache-v2-${scope}`, 'another-app-cache'], delete: cacheDelete },
    })
    handlers.activate({ waitUntil: promise => pending.push(promise) })
    await Promise.all(pending)
    expect(cacheDelete.mock.calls.map(([name]) => name)).toEqual(['tome-of-changes-v1', `workbox-precache-v2-${scope}`])
    expect(unregister).toHaveBeenCalledOnce()
    expect(pending).toHaveLength(1)
  })
})
