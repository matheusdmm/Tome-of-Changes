import { createStoredState, validEntry } from './useStorage.js'
import { entryKey } from '../utils/entryIdentity.js'

const STORAGE_KEY = 'tome-favorites'

const { state: favorites, reset: resetFavorites } = createStoredState(STORAGE_KEY, [], value => Array.isArray(value) && value.every(validEntry))
const removalHandlers = new Set()
export function onFavoriteRemoved(handler) { removalHandlers.add(handler) }

export function useFavorites() {
  function isFavorite(entry) {
    return favorites.value.some(f => entryKey(f) === entryKey(entry))
  }

  function addFavorite(entry) {
    if (!isFavorite(entry)) favorites.value = [...favorites.value, { ...entry, savedAt: new Date().toISOString() }]
  }

  function toggleFavorite(entry) {
    const idx = favorites.value.findIndex(f => entryKey(f) === entryKey(entry))
    if (idx === -1) {
      addFavorite(entry)
    } else {
      favorites.value = favorites.value.filter((_, i) => i !== idx)
      for (const handler of removalHandlers) handler(entryKey(entry))
    }
  }

  return { favorites, isFavorite, toggleFavorite, addFavorite, resetFavorites }
}
