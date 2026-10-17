import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest'
import { readFileSync } from 'node:fs'

let app, host
const template = readFileSync('index.html', 'utf8')
const sitemap = readFileSync('public/sitemap.xml', 'utf8')
const originalHead = document.head.innerHTML
const meta = selector => document.querySelector(selector)?.getAttribute('content')
const canonical = () => document.querySelector('link[rel="canonical"]').href

beforeEach(() => {
  vi.resetModules()
  localStorage.clear()
  document.head.innerHTML = new DOMParser().parseFromString(template, 'text/html').head.innerHTML
  vi.stubGlobal('fetch', vi.fn(async url => {
    const source = new URL(url).searchParams.get('document__key__in')
    return { ok: true, json: async () => ({ results: Array.from({ length: 13 }, (_, index) => ({
      key: `${source}_${index}`, name: `Entry ${index}`, document: { key: source },
      desc: 'Example rules', level: 1, school: { name: 'Evocation' },
    })) }) }
  }))
})

afterEach(() => {
  app?.unmount()
  host?.remove()
  document.head.innerHTML = originalHead
  vi.unstubAllGlobals()
})

async function mount(path) {
  const { createApp } = await import('vue')
  const { createRouter, createMemoryHistory } = await import('vue-router')
  const { routes, validateCategory } = await import('../../router/index.js')
  const { default: App } = await import('../../App.vue')
  const router = createRouter({ history: createMemoryHistory(), routes })
  router.beforeEach(validateCategory)
  await router.push(path)
  host = document.createElement('div')
  document.body.append(host)
  app = createApp(App).use(router)
  app.mount(host)
  return router
}

describe('search visibility and crawlable navigation', () => {
  it('matches homepage snippets to the HTML and links all six categories from the page and sitemap', async () => {
    const initialTitle = document.title
    const initialDescription = meta('meta[name="description"]')
    await mount('/')
    await vi.waitFor(() => expect(host.querySelectorAll('h1')).toHaveLength(1))
    expect(host.querySelector('h1').textContent).toBe('Tome Of Changes')
    expect(document.title).toBe(initialTitle)
    for (const selector of ['meta[name="description"]', 'meta[property="og:description"]', 'meta[name="twitter:description"]']) {
      expect(meta(selector)).toBe(initialDescription)
    }
    const links = host.querySelectorAll('nav[aria-label="Browse comparison categories"] a')
    expect(links).toHaveLength(6)
    for (const link of links) expect(sitemap).toContain(`<loc>${link.href.replace(location.origin, 'https://www.tomeofchanges.com')}</loc>`)
    expect(fetch).not.toHaveBeenCalled()
  })

  it('exposes entry and pagination links, preserves page canonicals, and avoids refetching on pagination', async () => {
    await mount('/browse/Spell?page=2&utm_source=test')
    await vi.waitFor(() => expect(host.textContent).toContain('Page 2 of 2'))
    expect(canonical()).toBe('https://www.tomeofchanges.com/browse/Spell?page=2')
    expect(meta('meta[name="robots"]')).toBe('index,follow')
    expect(host.querySelectorAll('h1')).toHaveLength(1)
    expect(host.querySelector('h1').textContent).toBe('D&D Spells: 2014 vs 2024')
    expect(host.querySelector('h2 a').getAttribute('href')).toMatch(/^\/compare\/Spell\/Entry%20\d+$/)
    const previous = host.querySelector('nav[aria-label="Search result pages"] a')
    expect(previous.textContent).toBe('Previous')
    expect(previous.getAttribute('href')).toBe('/browse/Spell?utm_source=test')
    previous.click()
    await vi.waitFor(() => expect(host.textContent).toContain('Page 1 of 2'))
    expect(canonical()).toBe('https://www.tomeofchanges.com/browse/Spell')
    expect(fetch).toHaveBeenCalledTimes(2)
  })

  it('updates snippets and indexing directives when navigating between filters, searches and public pages', async () => {
    const router = await mount('/browse/Spell?level=1&page=2&utm_source=test')
    await vi.waitFor(() => expect(meta('meta[name="robots"]')).toBe('noindex,follow'))
    expect(canonical()).toBe('https://www.tomeofchanges.com/browse/Spell?level=1&page=2')
    await router.push('/browse/Spell?q=Entry%201')
    await vi.waitFor(() => expect(document.title).toContain('Entry 1: D&D 2014 vs 2024'))
    expect(canonical()).toBe('https://www.tomeofchanges.com/browse/Spell?q=Entry+1')
    expect(meta('meta[name="robots"]')).toBe('noindex,follow')
    expect(meta('meta[name="description"]')).toContain('SRD spell results for Entry 1')
    await router.push('/compare/Spell/Entry%201')
    await vi.waitFor(() => expect(meta('meta[name="robots"]')).toBe('index,follow'))
    expect(canonical()).toBe('https://www.tomeofchanges.com/compare/Spell/Entry%201')
    await router.push('/favorites')
    await vi.waitFor(() => expect(meta('meta[name="robots"]')).toBe('noindex,follow'))
    await router.push('/')
    await vi.waitFor(() => expect(meta('meta[name="robots"]')).toBe('index,follow'))
    await router.push('/unknown-page')
    await vi.waitFor(() => expect(document.title).toBe('Tome Of Changes — Page Not Found'))
    expect(meta('meta[name="robots"]')).toBe('noindex,follow')
    expect(host.querySelectorAll('h1')).toHaveLength(1)
  })
})
