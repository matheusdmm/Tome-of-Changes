import { ref, watch } from 'vue'

const STORAGE_KEY = 'tome-recently-viewed'
const MAX = 10

const recentlyViewed = ref(JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'))

watch(recentlyViewed, val => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(val))
}, { deep: true })

export function useRecentlyViewed() {
  function addRecentlyViewed(entry) {
    const item = { slug: entry.slug, name: entry.name, category: entry.category }
    const filtered = recentlyViewed.value.filter(
      r => !(r.slug === item.slug && r.category === item.category)
    )
    recentlyViewed.value = [item, ...filtered].slice(0, MAX)
  }

  return { recentlyViewed, addRecentlyViewed }
}
