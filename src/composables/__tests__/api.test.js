import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest'
import { searchEntries, fetchAllConditions, clearApiCache } from '../useOpen5e.js'
import { ENTRY_ALIASES } from '../../utils/entryIdentity.js'
const record = (name, doc, key = name) => ({ name, key: `${doc}_${key}`, document: { key: doc }, desc: 'Rules' })
const response = (results, next = null) => ({ ok: true, json: async () => ({ results, next }) })
const reviewedAliases = [...ENTRY_ALIASES]
beforeEach(() => { clearApiCache(); vi.stubGlobal('fetch', vi.fn()); ENTRY_ALIASES.splice(0, ENTRY_ALIASES.length, ...reviewedAliases) })
afterEach(() => { vi.unstubAllGlobals(); vi.useRealTimers(); ENTRY_ALIASES.splice(0, ENTRY_ALIASES.length, ...reviewedAliases) })
describe('API transport and edition matching', () => {
  it('retains partial results and marks an unavailable edition', async () => {
    fetch.mockImplementation(async url => url.includes('srd-2014') ? { ok: false, status: 503 } : response([record('Example', 'srd-2024')]))
    const result = await searchEntries('Spell', 'Example')
    expect(result.entries[0].availability.v2014).toBe('unavailable')
    expect(result.warnings[0]).toContain('2014 source unavailable')
    expect(fetch).toHaveBeenCalledTimes(2)
  })
  it('throws for a complete outage rather than returning zero results', async () => {
    fetch.mockResolvedValue({ ok: false, status: 503 })
    await expect(searchEntries('Spell', 'Example')).rejects.toThrow('503')
    await expect(fetchAllConditions()).rejects.toThrow('503')
  })
  it('rejects malformed JSON shape and unsupported categories', async () => {
    fetch.mockResolvedValue({ ok: true, json: async () => ({ detail: 'bad' }) })
    await expect(searchEntries('Spell', 'Example')).rejects.toThrow('unexpected response')
    await expect(searchEntries('constructor', 'Example')).rejects.toThrow('supported category')
  })
  it('follows pagination and ranks exact names first', async () => {
    fetch.mockImplementation(async url => {
      const parsed = new URL(url), doc = parsed.searchParams.get('document__key__in')
      if (parsed.searchParams.has('page')) return response([record('Fireball', doc)])
      parsed.searchParams.set('page', '2')
      return response([record('Delayed Fireball', doc)], parsed.href)
    })
    const { entries } = await searchEntries('Spell', 'Fireball')
    expect(entries.map(r => r.name)).toEqual(['Fireball', 'Delayed Fireball'])
    expect(entries[0].v2014).toBeTruthy()
    expect(entries[0].v2024).toBeTruthy()
    expect(fetch).toHaveBeenCalledTimes(4)
    await searchEntries('Spell', 'Fireball')
    expect(fetch).toHaveBeenCalledTimes(4)
  })
  it('does not overwrite duplicate names or mix unrelated source documents', async () => {
    fetch.mockImplementation(async url => url.includes('srd-2014') ? response([record('Example', 'srd-2014', 'a'), record('Example', 'srd-2014', 'b'), record('Intruder', 'other')]) : response([record('Example', 'srd-2024')]))
    const { entries, warnings } = await searchEntries('Spell', 'Example')
    expect(entries).toHaveLength(3)
    expect(new Set(entries.map(r => r.slug)).size).toBe(3)
    expect(entries[0].availability.v2024).toBe('ambiguous')
    expect(warnings[0]).toContain('Multiple source entries')
  })
  it('supports explicitly reviewed renames and typographic apostrophes', async () => {
    ENTRY_ALIASES.push({ category: 'Spell', names: ['Old Name', 'New Name'], source: 'test-only mapping' })
    fetch.mockImplementation(async url => {
      const doc = new URL(url).searchParams.get('document__key__in')
      return response([record(doc === 'srd-2014' ? 'Old Name' : 'New Name', doc)])
    })
    const { entries } = await searchEntries('Spell', 'New Name')
    expect(entries).toHaveLength(1)
    expect(entries[0].v2014.name).toBe('Old Name')
    expect(entries[0].v2024.name).toBe('New Name')
  })
  it('pairs the SRD FAQ’s reviewed item rename from either edition name', async () => {
    fetch.mockImplementation(async url => {
      const doc = new URL(url).searchParams.get('document__key__in')
      return response([record(doc === 'srd-2014' ? 'Deck of Many Things' : 'Mysterious Deck', doc)])
    })
    const { entries } = await searchEntries('MagicItem', 'Mysterious Deck')
    expect(entries).toHaveLength(1)
    expect(entries[0].v2014.name).toBe('Deck of Many Things')
    expect(entries[0].v2024.name).toBe('Mysterious Deck')
  })
  it('bounds huge result sets and does not infer absence from incomplete pages', async () => {
    fetch.mockImplementation(async url => {
      const parsed = new URL(url), doc = parsed.searchParams.get('document__key__in')
      const page = Number(parsed.searchParams.get('page') || 1)
      parsed.searchParams.set('page', String(page + 1))
      return doc === 'srd-2014' ? response([], parsed.href) : response([record('Example', doc)])
    })
    const result = await searchEntries('Spell', 'Example')
    expect(fetch).toHaveBeenCalledTimes(11)
    expect(result.entries[0].availability.v2014).toBe('incomplete')
    expect(result.warnings[0]).toContain('1,000')
  })
  it('times out and honors caller cancellation', async () => {
    vi.useFakeTimers()
    fetch.mockImplementation((_url, { signal }) => new Promise((resolve, reject) => signal.addEventListener('abort', () => reject(signal.reason))))
    const pending = expect(searchEntries('Spell', 'Example')).rejects.toThrow('timed out')
    await vi.advanceTimersByTimeAsync(15001)
    await pending
    const controller = new AbortController()
    const cancelled = expect(searchEntries('Spell', 'Example', { signal: controller.signal })).rejects.toMatchObject({ name: 'AbortError' })
    controller.abort()
    await cancelled
  })
  it('rejects pagination to another origin', async () => {
    fetch.mockResolvedValue(response([], 'https://example.com/collect'))
    await expect(searchEntries('Spell', 'Example')).rejects.toThrow('pagination link')
  })
})
