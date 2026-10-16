import { beforeEach, afterEach, describe, it, expect, vi } from 'vitest'
import fixtures from './fixtures/open5e.json'
const entry = { name: 'Counterspell', slug: 'counterspell', category: 'Spell', v2014: fixtures.Spell['srd-2014'], v2024: fixtures.Spell['srd-2024'] }
const other = { ...entry, name: 'Other', slug: 'other' }
beforeEach(() => { localStorage.clear(); vi.resetModules() })
afterEach(() => vi.restoreAllMocks())
async function library() {
  const { useFavorites } = await import('../useFavorites.js'), { useNotes } = await import('../useNotes.js'), { useCollections } = await import('../useCollections.js')
  const backup = await import('../../utils/backup.js'), storage = await import('../useStorage.js')
  return { ...useFavorites(), ...useNotes(), ...useCollections(), ...backup, ...storage }
}
describe('saved collections', () => {
  it('preserves existing favorites and shares notes across memberships', async () => {
    const lib = await library()
    lib.addFavorite(entry); lib.saveNote(entry, 'One note')
    const first = lib.createCollection('Campaign'), second = lib.createCollection('Character')
    lib.toggleMembership(first, entry); lib.toggleMembership(second, entry)
    expect(lib.favorites.value).toHaveLength(1)
    expect(lib.entriesFor(first)[0].entry.name).toBe('Counterspell')
    expect(lib.getNote(lib.entriesFor(second)[0].entry)).toBe('One note')
    lib.setReviewed(first, entry, true)
    expect(lib.entriesFor(first)[0].reviewed).toBe(true)
    expect(lib.entriesFor(second)[0].reviewed).toBe(false)
    lib.renameCollection(first, 'Friday'); lib.saveCollectionNote(first, 'Bring dice')
    expect(lib.collections.value[0]).toMatchObject({ name: 'Friday', note: 'Bring dice' })
  })
  it('moves membership without deleting favorites or notes and cleans removed favorites', async () => {
    const lib = await library(), first = lib.createCollection('First'), second = lib.createCollection('Second')
    lib.toggleMembership(first, entry); lib.saveNote(entry, 'Keep')
    lib.toggleMembership(second, entry); lib.toggleMembership(first, entry)
    expect(lib.entriesFor(first)).toEqual([])
    expect(lib.entriesFor(second)).toHaveLength(1)
    lib.deleteCollection(first)
    expect(lib.isFavorite(entry)).toBe(true)
    expect(lib.getNote(entry)).toBe('Keep')
    lib.toggleFavorite(entry)
    expect(lib.entriesFor(second)).toEqual([])
    expect(lib.collections.value[0].items).toEqual([])
  })
  it('persists review state and resets collections with all saved data', async () => {
    let lib = await library(), id = lib.createCollection('Session')
    lib.toggleMembership(id, entry); lib.setReviewed(id, entry, true)
    vi.resetModules(); lib = await library()
    expect(lib.entriesFor(id)[0].reviewed).toBe(true)
    lib.resetStoredData()
    expect(lib.collections.value).toEqual([])
    expect(localStorage.getItem('tome-collections')).toBeNull()
  })
})
describe('backup validation, conflicts, and recovery', () => {
  it.each(['tome-favorites', 'tome-notes', 'tome-collections'])('preserves every store if import fails while writing %s', async failedKey => {
    const lib = await library(), id = lib.createCollection('Keep campaign')
    lib.toggleMembership(id, entry); lib.saveNote(entry, 'Keep note')
    const keys = ['tome-favorites', 'tome-notes', 'tome-collections']
    const before = Object.fromEntries(keys.map(key => [key, localStorage.getItem(key)]))
    const incoming = { ...lib.createBackup(), data: { favorites: [other], notes: { 'Spell-other': 'Incoming' }, collections: [] } }
    const originalWrite = Storage.prototype.setItem
    let failed = false
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(function (key, value) {
      if (key === failedKey && !failed) { failed = true; throw new Error('Quota exceeded') }
      return originalWrite.call(this, key, value)
    })
    expect(() => lib.importBackup(incoming, 'replace')).toThrow('preserved')
    expect(Object.fromEntries(keys.map(key => [key, localStorage.getItem(key)]))).toEqual(before)
    expect(lib.entriesFor(id)[0].entry.name).toBe('Counterspell')
    expect(lib.getNote(entry)).toBe('Keep note')
  })
  it('warns when both import and persistent rollback fail without publishing incoming state', async () => {
    const lib = await library(); lib.addFavorite(entry); lib.saveNote(entry, 'Current')
    const incoming = { ...lib.createBackup(), data: { favorites: [other], notes: {}, collections: [] } }
    const originalWrite = Storage.prototype.setItem
    let writes = 0
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(function (key, value) {
      if (++writes > 1) throw new Error('Storage unavailable')
      return originalWrite.call(this, key, value)
    })
    expect(() => lib.importBackup(incoming, 'replace')).toThrow('could not be restored completely')
    expect(lib.favorites.value[0].name).toBe('Counterspell')
    expect(lib.getNote(entry)).toBe('Current')
  })
  it('replaces only the saved library and leaves recent history and theme intact', async () => {
    const lib = await library(), { useRecentlyViewed } = await import('../useRecentlyViewed.js')
    const recent = useRecentlyViewed(); recent.addRecentlyViewed(other)
    const { useTheme } = await import('../useTheme.js')
    useTheme().toggleTheme()
    const before = localStorage.getItem('tome-recently-viewed'), theme = localStorage.getItem('theme')
    lib.addFavorite(entry)
    lib.importBackup({ ...lib.createBackup(), data: { favorites: [], notes: {}, collections: [] } }, 'replace')
    expect(lib.favorites.value).toEqual([])
    expect(recent.recentlyViewed.value).toHaveLength(1)
    expect(localStorage.getItem('tome-recently-viewed')).toBe(before)
    expect(localStorage.getItem('theme')).toBe(theme)
  })
  it('merges collection members, settings and snapshots according to the chosen conflict policy', async () => {
    const lib = await library(), id = lib.createCollection('Incoming name')
    lib.toggleMembership(id, entry); lib.saveCollectionNote(id, 'Incoming collection note')
    const backup = lib.createBackup()
    backup.data.favorites[0].v2024.desc = 'Incoming rules text'
    lib.renameCollection(id, 'Current name'); lib.saveCollectionNote(id, 'Current collection note'); lib.toggleMembership(id, other)
    lib.importBackup(backup, 'merge', 'keep')
    expect(lib.collections.value[0]).toMatchObject({ name: 'Current name', note: 'Current collection note' })
    expect(lib.entriesFor(id)).toHaveLength(2)
    expect(lib.favorites.value[0].v2024.desc).not.toBe('Incoming rules text')
    lib.importBackup(backup, 'merge', 'import')
    expect(lib.collections.value[0]).toMatchObject({ name: 'Incoming name', note: 'Incoming collection note' })
    expect(lib.entriesFor(id)).toHaveLength(2)
    expect(lib.favorites.value[0].v2024.desc).toBe('Incoming rules text')
    expect(backup.data.collections[0].items).toHaveLength(1)
  })
  it('rejects duplicate identities, collection IDs and members, invalid notes, and malformed nested records', async () => {
    const lib = await library(), id = lib.createCollection('Test campaign')
    lib.toggleMembership(id, entry)
    const backup = lib.createBackup(), collection = backup.data.collections[0]
    const cases = [
      { favorites: [entry, { ...entry }] },
      { collections: [collection, { ...collection }] },
      { collections: [{ ...collection, items: [collection.items[0], collection.items[0]] }] },
      { collections: [{ ...collection, items: [{ key: 'Spell-counterspell', reviewed: 'yes' }] }] },
      { notes: { 'Spell-counterspell': { text: 'Invalid' } } },
      { notes: { '__proto__': 'Invalid', invalid: 'Invalid' } },
      { favorites: [{ ...entry, v2024: { ...entry.v2024, damage_types: 'Invalid' } }] },
      { favorites: [{ ...entry, v2024: { ...entry.v2024, casting_options: [null] } }] },
      { favorites: [{ ...entry, v2024: { ...entry.v2024, document: { permalink: 42 } } }] },
    ]
    for (const change of cases) expect(() => lib.parseBackup(JSON.stringify({ ...backup, data: { ...backup.data, ...change } }))).toThrow()
    expect(lib.entriesFor(id)).toHaveLength(1)
    expect(lib.parseBackup('\uFEFF' + JSON.stringify(backup)).data.favorites).toHaveLength(1)
  })
  it('exports one collection without unrelated entries or personal notes', async () => {
    const lib = await library(), selected = lib.createCollection('Selected'), unrelated = lib.createCollection('Other campaign')
    lib.toggleMembership(selected, entry); lib.toggleMembership(unrelated, other)
    lib.saveNote(entry, 'Selected note'); lib.saveNote(other, 'Unrelated private note')
    lib.saveCollectionNote(unrelated, 'Private campaign notes')
    const backup = lib.createBackup(true, selected)
    expect(backup.data.collections.map(c => c.id)).toEqual([selected])
    expect(backup.data.favorites.map(f => f.name)).toEqual(['Counterspell'])
    expect(backup.data.notes).toEqual({ 'Spell-counterspell': 'Selected note' })
    expect(JSON.stringify(backup)).not.toContain('Unrelated private note')
    expect(JSON.stringify(backup)).not.toContain('Private campaign notes')
  })
  it('round-trips snapshots, notes, collection notes and review state', async () => {
    const lib = await library(), id = lib.createCollection('Campaign')
    lib.toggleMembership(id, entry); lib.setReviewed(id, entry, true); lib.saveNote(entry, 'Spell note'); lib.saveCollectionNote(id, 'Session note')
    const file = JSON.stringify(lib.createBackup())
    lib.resetStoredData()
    lib.importBackup(lib.parseBackup(file), 'replace')
    expect(lib.getNote(entry)).toBe('Spell note')
    expect(lib.entriesFor(id)[0].reviewed).toBe(true)
    expect(lib.collections.value[0].note).toBe('Session note')
    expect(lib.favorites.value[0].v2014.desc).toContain('interrupt')
    vi.resetModules()
    const restored = await library()
    expect(restored.collections.value[0].items).toHaveLength(1)
    expect(restored.getNote(entry)).toBe('Spell note')
  })
  it('merges duplicates with explicit note and reviewed-state conflict choices', async () => {
    const lib = await library(), id = lib.createCollection('Campaign')
    lib.toggleMembership(id, entry); lib.saveNote(entry, 'Imported'); lib.setReviewed(id, entry, true)
    const backup = lib.createBackup()
    lib.saveNote(entry, 'Current'); lib.setReviewed(id, entry, false); lib.addFavorite(other)
    lib.importBackup(backup, 'merge', 'keep')
    expect(lib.getNote(entry)).toBe('Current')
    expect(lib.entriesFor(id)[0].reviewed).toBe(false)
    expect(lib.favorites.value).toHaveLength(2)
    lib.importBackup(backup, 'merge', 'import')
    expect(lib.getNote(entry)).toBe('Imported')
    expect(lib.entriesFor(id)[0].reviewed).toBe(true)
    expect(lib.favorites.value).toHaveLength(2)
    lib.importBackup(backup, 'replace')
    expect(lib.favorites.value).toHaveLength(1)
  })
  it('keeps reference-only backups usable and migrates legacy note keys', async () => {
    localStorage.setItem('tome-notes', JSON.stringify({ 'Spell-srd_counterspell': 'Legacy note' }))
    const lib = await library()
    const legacy = { ...entry, slug: 'srd_counterspell', v2014: { ...entry.v2014, key: 'srd_counterspell' } }
    lib.addFavorite(legacy)
    const backup = lib.createBackup(false)
    expect(backup.data.favorites[0].v2014).toBeUndefined()
    expect(backup.data.favorites[0].referenceOnly).toBe(true)
    lib.importBackup(backup, 'replace')
    expect(lib.getNote(lib.favorites.value[0])).toBe('Legacy note')
  })
  it('applies conflict choices to legacy notes and does not resurrect them after an imported deletion', async () => {
    localStorage.setItem('tome-notes', JSON.stringify({ 'Spell-srd_counterspell': 'Current legacy note' }))
    const lib = await library(); lib.addFavorite(entry)
    const backup = { ...lib.createBackup(), data: { favorites: [entry], notes: { 'Spell-counterspell': 'Incoming note' }, collections: [] } }
    lib.importBackup(backup, 'merge', 'keep')
    expect(lib.getNote(entry)).toBe('Current legacy note')
    lib.importBackup(backup, 'merge', 'import')
    expect(lib.getNote(entry)).toBe('Incoming note')
    backup.data.notes['Spell-counterspell'] = ''
    lib.importBackup(backup, 'merge', 'import')
    expect(lib.getNote(entry)).toBe('')
  })
  it('rejects malformed data, wrong versions, oversized files and dangling references without mutation', async () => {
    const lib = await library(); lib.addFavorite(entry)
    const valid = lib.createBackup()
    for (const text of ['bad json', JSON.stringify({ ...valid, version: 99 }), ' '.repeat(lib.MAX_BACKUP_BYTES + 1),
      JSON.stringify({ ...valid, data: { ...valid.data, favorites: [{ ...entry, v2014: { traits: 'bad' } }] } }),
      JSON.stringify({ ...valid, data: { ...valid.data, collections: [{ id: 'abc', name: 'Missing', note: '', items: [{ key: 'Spell-missing', reviewed: false }] }] } })]) {
      expect(() => lib.parseBackup(text)).toThrow()
      expect(lib.favorites.value).toHaveLength(1)
    }
  })
  it('rolls back persistent writes when an import runs out of storage', async () => {
    const lib = await library(); lib.addFavorite(entry); lib.saveNote(entry, 'Current')
    const originalFavorites = localStorage.getItem('tome-favorites'), originalNotes = localStorage.getItem('tome-notes')
    const incoming = { ...lib.createBackup(), data: { favorites: [other], notes: { 'Spell-other': 'Incoming' }, collections: [] } }
    const originalWrite = Storage.prototype.setItem
    let failed = false
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(function (key, value) {
      if (key === 'tome-notes' && !failed) { failed = true; throw new Error('Quota exceeded') }
      return originalWrite.call(this, key, value)
    })
    expect(() => lib.importBackup(incoming, 'replace')).toThrow('preserved')
    expect(lib.favorites.value[0].name).toBe('Counterspell')
    expect(lib.getNote(entry)).toBe('Current')
    expect(localStorage.getItem('tome-favorites')).toBe(originalFavorites)
    expect(localStorage.getItem('tome-notes')).toBe(originalNotes)
  })
})
