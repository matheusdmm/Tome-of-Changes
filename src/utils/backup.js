import { validEntry, applyStoredBatch, storageError } from '../composables/useStorage.js'
import { useFavorites } from '../composables/useFavorites.js'
import { useNotes } from '../composables/useNotes.js'
import { useCollections, validCollections } from '../composables/useCollections.js'
import { entryKey } from './entryIdentity.js'
import { normalizeRecord, statRows } from './comparison.js'

export const MAX_BACKUP_BYTES = 5 * 1024 * 1024
const plain = value => JSON.parse(JSON.stringify(value))
const object = value => value != null && typeof value === 'object' && !Array.isArray(value)
function canonicalNotes(notes, entries) {
  const normalized = { ...notes }
  for (const entry of entries) {
    const key = entryKey(entry)
    const legacyKeys = [entry.slug, entry.v2014?.key, entry.v2024?.key].filter(Boolean).map(id => `${entry.category}-${id}`)
    const source = [key, ...legacyKeys].find(id => Object.hasOwn(notes, id))
    if (source) normalized[key] = notes[source]
    for (const legacy of legacyKeys) if (legacy !== key) delete normalized[legacy]
  }
  return normalized
}
function validateRecord(record, category) {
  if (record == null) return true
  if (!object(record) || (record.desc != null && typeof record.desc !== 'string')) return false
  for (const key of ['traits', 'actions', 'reactions', 'legendary_actions', 'bonus_actions', 'benefits', 'casting_options']) {
    if (record[key] == null) continue
    if (!Array.isArray(record[key]) || !record[key].every(item => object(item)
      && ['name', 'desc', 'action_type'].every(field => item[field] == null || typeof item[field] === 'string'))) return false
  }
  if (record.document != null && (!object(record.document) || ['name', 'key', 'permalink'].some(key => record.document[key] != null && typeof record.document[key] !== 'string'))) return false
  try {
    normalizeRecord(category, record)
    statRows(category, record, record)
    return true
  } catch { return false }
}
function validateData(data) {
  if (!object(data) || !Array.isArray(data.favorites) || data.favorites.length > 5000 || !data.favorites.every(e => validEntry(e)
    && e.name.length <= 500 && e.slug.length <= 500 && validateRecord(e.v2014, e.category) && validateRecord(e.v2024, e.category))) throw new Error('Invalid favorites in backup.')
  if (new Set(data.favorites.map(entryKey)).size !== data.favorites.length) throw new Error('Backup contains duplicate favorites.')
  if (!object(data.notes) || Object.keys(data.notes).length > 10000 || Object.entries(data.notes).some(([key, value]) =>
    !/^(Spell|Condition|Feat|Creature|MagicItem|Race)-.+/.test(key) || key.length > 600 || typeof value !== 'string' || value.length > 100000)) throw new Error('Invalid session notes in backup.')
  if (!validCollections(data.collections)) throw new Error('Invalid collections in backup.')
  const keys = new Set(data.favorites.map(entryKey))
  if (data.collections.some(c => c.items.some(i => !keys.has(i.key)))) throw new Error('A collection references an entry missing from the backup.')
  return data
}
export function createBackup(includeSnapshots = true, collectionId = null) {
  const { favorites } = useFavorites(), { notes } = useNotes(), { collections } = useCollections()
  const selected = collectionId ? collections.value.find(c => c.id === collectionId) : null
  if (collectionId && !selected) throw new Error('Collection not found.')
  const keys = selected ? new Set(selected.items.map(item => item.key)) : null
  const sourceEntries = keys ? favorites.value.filter(entry => keys.has(entryKey(entry))) : favorites.value
  const allNotes = canonicalNotes(plain(notes.value), sourceEntries)
  const savedNotes = keys ? Object.fromEntries(Object.entries(allNotes).filter(([key]) => keys.has(key))) : allNotes
  const entries = plain(sourceEntries).map(entry => {
    const slug = entryKey(entry).slice(entry.category.length + 1)
    if (includeSnapshots) return { ...entry, slug }
    return { category: entry.category, name: entry.name, slug, savedAt: entry.savedAt, referenceOnly: true }
  })
  return { format: 'tome-of-changes-backup', version: 1, createdAt: new Date().toISOString(),
    data: validateData({ favorites: entries, notes: savedNotes, collections: plain(selected ? [selected] : collections.value) }) }
}
export function parseBackup(text) {
  if (new TextEncoder().encode(text).length > MAX_BACKUP_BYTES) throw new Error('Backup exceeds the 5 MB limit.')
  let backup
  try { backup = JSON.parse(text.replace(/^\uFEFF/, '')) } catch { throw new Error('Select a valid JSON backup file.') }
  if (backup?.format !== 'tome-of-changes-backup' || backup.version !== 1) throw new Error('Unsupported backup format or version.')
  validateData(backup.data)
  return backup
}
export function importBackup(backup, mode = 'merge', conflict = 'keep') {
  if (!['merge', 'replace'].includes(mode) || !['keep', 'import'].includes(conflict)) throw new Error('Choose a supported import option.')
  const incoming = validateData(plain(backup.data))
  incoming.notes = canonicalNotes(incoming.notes, incoming.favorites)
  const { favorites } = useFavorites(), { notes } = useNotes(), { collections } = useCollections()
  let data = incoming
  if (mode === 'merge') {
    const merged = new Map(plain(favorites.value).map(e => [entryKey(e), e]))
    for (const entry of incoming.favorites) if (!merged.has(entryKey(entry)) || conflict === 'import') merged.set(entryKey(entry), entry)
    const mergedCollections = new Map(plain(collections.value).map(c => [c.id, c]))
    for (const collection of incoming.collections) {
      const existing = mergedCollections.get(collection.id)
      if (!existing) mergedCollections.set(collection.id, collection)
      else {
        const items = new Map(existing.items.map(i => [i.key, i]))
        for (const item of collection.items) if (!items.has(item.key) || conflict === 'import') items.set(item.key, item)
        mergedCollections.set(collection.id, { ...(conflict === 'import' ? collection : existing), items: [...items.values()] })
      }
    }
    const currentNotes = canonicalNotes(plain(notes.value), [...favorites.value, ...incoming.favorites])
    data = validateData({ favorites: [...merged.values()], notes: conflict === 'import' ? { ...currentNotes, ...incoming.notes } : { ...incoming.notes, ...currentNotes }, collections: [...mergedCollections.values()] })
  }
  if (!applyStoredBatch({ 'tome-favorites': data.favorites, 'tome-notes': data.notes, 'tome-collections': data.collections })) throw new Error(storageError.value)
  return { favorites: data.favorites.length, notes: Object.keys(data.notes).length, collections: data.collections.length }
}
