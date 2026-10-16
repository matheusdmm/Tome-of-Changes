import { createStoredState, validEntry } from './useStorage.js'

const STORAGE_KEY = 'tome-recently-viewed'
const MAX = 10

const { state: recentlyViewed, reset: resetRecentlyViewed } = createStoredState(STORAGE_KEY, [], value => Array.isArray(value) && value.length <= MAX && value.every(validEntry))

export function useRecentlyViewed() {
  function addRecentlyViewed(entry) {
    const item = { slug: entry.slug, name: entry.name, category: entry.category }
    if (recentlyViewed.value[0]?.slug === item.slug && recentlyViewed.value[0]?.category === item.category) return
    const filtered = recentlyViewed.value.filter(
      r => !(r.slug === item.slug && r.category === item.category)
    )
    recentlyViewed.value = [item, ...filtered].slice(0, MAX)
  }

  return { recentlyViewed, addRecentlyViewed, resetRecentlyViewed }
}
