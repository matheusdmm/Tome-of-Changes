import { describe, it, expect, vi } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { runInNewContext } from 'node:vm'
import { createRouter, createMemoryHistory } from 'vue-router'
import { routes, validateCategory } from '../../router/index.js'

describe('routing and legacy deployment recovery', () => {
  it('serves only known SPA paths through nginx and returns a plain 404 for probes', () => {
    const config = readFileSync(resolve('nginx.conf'), 'utf8')
    const routePatterns = [...config.matchAll(/location ~ (\^[^\r\n]+) \{/g)]
      .map(([, source]) => new RegExp(source))
    const matchesRoute = path => routePatterns.some(pattern => pattern.test(path))
    for (const path of [
      '/conditions', '/privacy', '/favorites', '/whats-new', '/attribution', '/browse',
      '/browse/Spell', '/browse/Condition', '/browse/Feat', '/browse/Creature',
      '/browse/MagicItem', '/browse/Race', '/compare/Spell/Counterspell',
      '/compare/Spell/Entry%20One', '/compare/Spell/',
    ]) expect(matchesRoute(path)).toBe(true)
    for (const path of [
      '/wp-admin/install.php', '/wp-login.php', '/unknown-page', '/browse/__proto__',
      '/browse/Spell/extra', '/compare/constructor/Counterspell',
    ]) expect(matchesRoute(path)).toBe(false)
    expect(matchesRoute('/robots.txt')).toBe(true)
    expect(config).toContain('location / { return 404; }')
    expect(config).toContain('error_page 404 /404.html;')
    expect(readFileSync(resolve('public/404.html'), 'utf8')).toContain('404 Not Found')
  })

  it('restores browse deep links and rejects unsupported browse categories', async () => {
    const inert = routes.map(route => ({ ...route, component: { template: '<div />' } }))
    const router = createRouter({ history: createMemoryHistory(), routes: inert })
    router.beforeEach(validateCategory)
    await router.push('/browse')
    expect(router.currentRoute.value.params.category).toBe('Spell')
    await router.push('/browse/Creature?cr=1%2F4&type=beast&page=2')
    expect(router.currentRoute.value.query).toEqual({ cr: '1/4', type: 'beast', page: '2' })
    await router.push('/browse/__proto__')
    expect(router.currentRoute.value.name).toBe('not-found')
  })
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
