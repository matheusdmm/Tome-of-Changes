import { createStoredState, validEntry } from './useStorage.js'

const STORAGE_KEY = 'tome-favorites'

const { state: favorites, reset: resetFavorites } = createStoredState(STORAGE_KEY, [], value => Array.isArray(value) && value.every(validEntry))

export function useFavorites() {
  function isFavorite(entry) {
    return favorites.value.some(f => f.category === entry.category && f.name === entry.name)
  }

  function toggleFavorite(entry) {
    const idx = favorites.value.findIndex(f => f.category === entry.category && f.name === entry.name)
    if (idx === -1) {
      favorites.value = [...favorites.value, { ...entry, savedAt: new Date().toISOString() }]
    } else {
      favorites.value = favorites.value.filter((_, i) => i !== idx)
    }
  }

  return { favorites, isFavorite, toggleFavorite, resetFavorites }
}
