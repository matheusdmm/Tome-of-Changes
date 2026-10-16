import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
vi.mock('@vercel/analytics', () => ({ track: vi.fn() }))
let app, host
const flush = async () => { for (let i = 0; i < 4; i++) await new Promise(resolve => setTimeout(resolve, 0)) }
beforeEach(() => { localStorage.clear(); vi.resetModules(); document.head.innerHTML = '<link rel="canonical"><meta name="robots"><meta property="og:url">' })
afterEach(() => { app?.unmount(); host?.remove(); vi.unstubAllGlobals(); vi.restoreAllMocks() })

async function mount(component, props = {}, initial = '/') {
  const { createApp } = await import('vue')
  const { createRouter, createMemoryHistory } = await import('vue-router')
  const router = createRouter({ history: createMemoryHistory(), routes: [
    { path: '/', name: 'home', component: { template: '<div>Home</div>' } },
    { path: '/compare/:category/:query(.*)', name: 'compare', component: { template: '<div>Compare</div>' } },
    { path: '/favorites', name: 'favorites', component: { template: '<div>Favorites</div>' } },
    { path: '/privacy', name: 'privacy', component: { template: '<div>Privacy</div>' } },
  ] })
  await router.push(initial); await router.isReady()
  host = document.createElement('div'); document.body.append(host)
  app = createApp(component, props); app.use(router); app.mount(host)
  await flush()
  return router
}
const entry = { slug: 'example', name: 'Example', category: 'Spell',
  v2014: { desc: 'Deal 1d6 damage.', key: 'old', range: 60, range_unit: 'feet' },
  v2024: { desc: 'Deal 2d6 damage.', key: 'new', range: 60, range_unit: 'feet' } }

describe('card and privacy journeys', () => {
  it('renders mechanical text edits, saves notes immediately, and handles clipboard denial', async () => {
    const { default: EntryCard } = await import('../../components/EntryCard.vue')
    await mount(EntryCard, { entry })
    expect(host.textContent).toContain('Description changed; review highlights.')
    expect(host.textContent).toContain('60 feet')
    const noteButton = [...host.querySelectorAll('button')].find(b => b.textContent.includes('Note'))
    noteButton.click(); await flush()
    const textarea = host.querySelector('textarea')
    textarea.value = 'Keep this note'; textarea.dispatchEvent(new Event('input', { bubbles: true }))
    expect(JSON.parse(localStorage.getItem('tome-notes')).data['Spell-example']).toBe('Keep this note')
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: vi.fn().mockRejectedValue(new Error('denied')) } })
    ;[...host.querySelectorAll('button')].find(b => b.textContent.includes('Share')).click()
    await flush()
    expect(host.textContent).toContain('Could not copy')
    expect(host.textContent).not.toContain('✓ Copied')
  })
  it('reloads note state when a card receives another entry', async () => {
    const { default: EntryCard } = await import('../../components/EntryCard.vue')
    const { useNotes } = await import('../useNotes.js')
    const { h, ref } = await import('vue')
    const current = ref(entry)
    useNotes().saveNote(entry, 'First note')
    await mount({ setup: () => () => h(EntryCard, { entry: current.value }) })
    expect(host.querySelector('textarea').value).toBe('First note')
    current.value = { ...entry, name: 'Other', slug: 'other' }
    await flush()
    expect(host.querySelector('textarea')).toBeNull()
  })
  it('deletes favorites, notes, recents and theme from reactive state and disk', async () => {
    const { default: Privacy } = await import('../../views/PrivacyView.vue')
    const { useFavorites } = await import('../useFavorites.js')
    const { useNotes } = await import('../useNotes.js')
    const { useTheme } = await import('../useTheme.js')
    const favorites = useFavorites(), notes = useNotes(), theme = useTheme()
    favorites.toggleFavorite(entry); notes.saveNote(entry, 'Private'); theme.theme.value = 'light'
    await mount(Privacy, {}, '/privacy')
    ;[...host.querySelectorAll('button')].find(b => b.textContent.includes('Delete all')).click(); await flush()
    ;[...host.querySelectorAll('button')].find(b => b.textContent.includes('Confirm')).click(); await flush()
    expect(host.textContent).toContain('All saved data deleted.')
    expect(favorites.favorites.value).toEqual([])
    expect(notes.getNote(entry)).toBe('')
    expect(theme.theme.value).toBe('dark')
    expect(localStorage.getItem('tome-notes')).toBeNull()
    expect(document.documentElement.classList.contains('light')).toBe(false)
  })
  it('keeps unavailable source wording distinct from absence', async () => {
    const { default: EntryCard } = await import('../../components/EntryCard.vue')
    await mount(EntryCard, { entry: { ...entry, v2014: null, availability: { v2014: 'unavailable' } } })
    expect(host.textContent).toContain('Source unavailable')
    expect(host.textContent).not.toContain('Not present')
  })
})

describe('search and navigation journeys', () => {
  it('offers retry for failed requests, succeeds after retry, then clears stale results', async () => {
    const record = doc => ({ name: 'Example', key: doc + '_example', document: { key: doc }, desc: 'Rules' })
    let offline = true
    vi.stubGlobal('fetch', vi.fn(async url => offline ? { ok: false, status: 503 } : { ok: true, json: async () => ({ results: [record(new URL(url).searchParams.get('document__key__in'))] }) }))
    const { default: Search } = await import('../../views/SearchView.vue')
    const router = await mount(Search, {}, '/compare/Spell/Example')
    expect(host.textContent).toContain('503')
    offline = false
    ;[...host.querySelectorAll('button')].find(b => b.textContent.includes('Retry')).click(); await flush()
    expect(host.textContent).toContain('1 entry found')
    expect(document.querySelector('link[rel="canonical"]').href).toBe('https://www.tomeofchanges.com/compare/Spell/Example')
    const input = host.querySelector('input'); input.value = ''; input.dispatchEvent(new Event('input', { bubbles: true })); await flush()
    expect(host.textContent).toContain('Enter a name')
    expect(host.textContent).not.toContain('1 entry found')
    await router.push('/'); await new Promise(resolve => setTimeout(resolve, 450))
    // In the app RouterView unmounts the search; this standalone mount is torn down below.
  })
  it('exposes search labels, selected category state, and Enter submission', async () => {
    const { default: SearchBar } = await import('../../components/SearchBar.vue')
    const submit = vi.fn()
    await mount(SearchBar, { modelValue: 'Example', category: 'Spell', onSubmit: submit })
    expect(host.querySelector('input').getAttribute('aria-label')).toContain('Search')
    expect(host.querySelector('[aria-pressed="true"]').textContent).toBe('Spells')
    host.querySelector('input').dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
    expect(submit).toHaveBeenCalledOnce()
  })
})
