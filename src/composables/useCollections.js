import { createStoredState } from './useStorage.js'
import { useFavorites, onFavoriteRemoved } from './useFavorites.js'
import { entryKey } from '../utils/entryIdentity.js'

export function validCollections(value) {
  return Array.isArray(value) && value.length <= 1000 && new Set(value.map(c => c?.id)).size === value.length && value.every(c =>
    c && typeof c.id === 'string' && /^[a-zA-Z0-9_-]{1,100}$/.test(c.id) && typeof c.name === 'string' && c.name.trim().length > 0 && c.name.length <= 80
    && typeof c.note === 'string' && c.note.length <= 10000 && Array.isArray(c.items) && c.items.length <= 5000
    && new Set(c.items.map(i => i?.key)).size === c.items.length
    && c.items.every(i => i && typeof i.key === 'string' && i.key.length > 0 && i.key.length <= 600 && typeof i.reviewed === 'boolean'))
}
const { state: collections, reset: resetCollections } = createStoredState('tome-collections', [], validCollections)
const { favorites, addFavorite } = useFavorites()
onFavoriteRemoved(key => {
  collections.value = collections.value.map(c => ({ ...c, items: c.items.filter(i => i.key !== key) }))
})

export function useCollections() {
  function edit(id, transform) { collections.value = collections.value.map(c => c.id === id ? transform(c) : c) }
  function createCollection(name) {
    const trimmed = name.trim()
    if (!trimmed || trimmed.length > 80) throw new Error('Use a collection name between 1 and 80 characters.')
    if (collections.value.length >= 1000) throw new Error('The collection limit has been reached.')
    const id = crypto.randomUUID()
    collections.value = [...collections.value, { id, name: trimmed, note: '', items: [] }]
    return id
  }
  function renameCollection(id, name) {
    if (!name.trim() || name.trim().length > 80) throw new Error('Use a collection name between 1 and 80 characters.')
    edit(id, c => ({ ...c, name: name.trim() }))
  }
  function deleteCollection(id) { collections.value = collections.value.filter(c => c.id !== id) }
  function saveCollectionNote(id, note) { edit(id, c => ({ ...c, note: note.slice(0, 10000) })) }
  function contains(id, entry) { return collections.value.find(c => c.id === id)?.items.some(i => i.key === entryKey(entry)) || false }
  function toggleMembership(id, entry) {
    if (!collections.value.some(c => c.id === id)) return
    if (contains(id, entry)) edit(id, c => ({ ...c, items: c.items.filter(i => i.key !== entryKey(entry)) }))
    else {
      addFavorite(entry)
      edit(id, c => ({ ...c, items: [...c.items, { key: entryKey(entry), reviewed: false }] }))
    }
  }
  function setReviewed(id, entry, reviewed) {
    edit(id, c => ({ ...c, items: c.items.map(i => i.key === entryKey(entry) ? { ...i, reviewed: !!reviewed } : i) }))
  }
  function entriesFor(id) {
    const collection = collections.value.find(c => c.id === id)
    return (collection?.items || []).map(item => ({ ...item, entry: favorites.value.find(f => entryKey(f) === item.key) })).filter(item => item.entry)
  }
  return { collections, createCollection, renameCollection, deleteCollection, saveCollectionNote, contains, toggleMembership, setReviewed, entriesFor, resetCollections }
}
