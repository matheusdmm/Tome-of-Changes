import { describe, it, expect, beforeEach, vi } from 'vitest'

const ENTRY_A = { slug: 'fireball', name: 'Fireball', category: 'Spell' }
const ENTRY_B = { slug: 'charmed', name: 'Charmed', category: 'Condition' }
const ENTRY_C = { slug: 'blindness', name: 'Blindness', category: 'Spell' }

beforeEach(() => {
  localStorage.clear()
  vi.resetModules()
})

async function getComposable() {
  const { useRecentlyViewed } = await import('../useRecentlyViewed.js')
  return useRecentlyViewed()
}

describe('useRecentlyViewed', () => {
  it('starts empty', async () => {
    const { recentlyViewed } = await getComposable()
    expect(recentlyViewed.value).toEqual([])
  })

  it('adds an entry', async () => {
    const { recentlyViewed, addRecentlyViewed } = await getComposable()
    addRecentlyViewed(ENTRY_A)
    expect(recentlyViewed.value).toHaveLength(1)
    expect(recentlyViewed.value[0].name).toBe('Fireball')
  })

  it('puts newest entry first', async () => {
    const { recentlyViewed, addRecentlyViewed } = await getComposable()
    addRecentlyViewed(ENTRY_A)
    addRecentlyViewed(ENTRY_B)
    expect(recentlyViewed.value[0].name).toBe('Charmed')
  })

  it('deduplicates by slug and category', async () => {
    const { recentlyViewed, addRecentlyViewed } = await getComposable()
    addRecentlyViewed(ENTRY_A)
    addRecentlyViewed(ENTRY_B)
    addRecentlyViewed(ENTRY_A)
    expect(recentlyViewed.value).toHaveLength(2)
    expect(recentlyViewed.value[0].name).toBe('Fireball')
  })

  it('caps at 10 entries', async () => {
    const { recentlyViewed, addRecentlyViewed } = await getComposable()
    for (let i = 0; i < 12; i++) {
      addRecentlyViewed({ slug: `entry-${i}`, name: `Entry ${i}`, category: 'Spell' })
    }
    expect(recentlyViewed.value).toHaveLength(10)
  })

  it('stores only slug, name, category', async () => {
    const { recentlyViewed, addRecentlyViewed } = await getComposable()
    addRecentlyViewed({ ...ENTRY_A, v2014: {}, v2024: {}, diffs: [] })
    const item = recentlyViewed.value[0]
    expect(Object.keys(item)).toEqual(['slug', 'name', 'category'])
  })
})
