import { ref, watch } from 'vue'

const STORAGE_KEY = 'tome-favorites'

const favorites = ref(JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'))

watch(favorites, val => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(val))
}, { deep: true })

export function useFavorites() {
  function isFavorite(entry) {
    return favorites.value.some(f => f.category === entry.category && f.name === entry.name)
  }

  function toggleFavorite(entry) {
    const idx = favorites.value.findIndex(f => f.category === entry.category && f.name === entry.name)
    if (idx === -1) {
      favorites.value = [...favorites.value, entry]
    } else {
      favorites.value = favorites.value.filter((_, i) => i !== idx)
    }
  }

  return { favorites, isFavorite, toggleFavorite }
}
