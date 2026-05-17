import { describe, it, expect, beforeEach, vi } from 'vitest'

const ENTRY_A = { slug: 'fireball', name: 'Fireball', category: 'Spell' }
const ENTRY_B = { slug: 'charmed', name: 'Charmed', category: 'Condition' }

beforeEach(() => {
  localStorage.clear()
  vi.resetModules()
})

async function getComposable() {
  const { useFavorites } = await import('../useFavorites.js')
  return useFavorites()
}

describe('useFavorites', () => {
  it('starts empty', async () => {
    const { favorites } = await getComposable()
    expect(favorites.value).toEqual([])
  })

  it('isFavorite returns false for unsaved entry', async () => {
    const { isFavorite } = await getComposable()
    expect(isFavorite(ENTRY_A)).toBe(false)
  })

  it('adds entry on first toggle', async () => {
    const { favorites, isFavorite, toggleFavorite } = await getComposable()
    toggleFavorite(ENTRY_A)
    expect(favorites.value).toHaveLength(1)
    expect(isFavorite(ENTRY_A)).toBe(true)
  })

  it('removes entry on second toggle', async () => {
    const { favorites, isFavorite, toggleFavorite } = await getComposable()
    toggleFavorite(ENTRY_A)
    toggleFavorite(ENTRY_A)
    expect(favorites.value).toHaveLength(0)
    expect(isFavorite(ENTRY_A)).toBe(false)
  })

  it('handles multiple independent favorites', async () => {
    const { favorites, isFavorite, toggleFavorite } = await getComposable()
    toggleFavorite(ENTRY_A)
    toggleFavorite(ENTRY_B)
    expect(favorites.value).toHaveLength(2)
    expect(isFavorite(ENTRY_A)).toBe(true)
    expect(isFavorite(ENTRY_B)).toBe(true)
  })

  it('removes only the toggled entry', async () => {
    const { favorites, isFavorite, toggleFavorite } = await getComposable()
    toggleFavorite(ENTRY_A)
    toggleFavorite(ENTRY_B)
    toggleFavorite(ENTRY_A)
    expect(favorites.value).toHaveLength(1)
    expect(isFavorite(ENTRY_B)).toBe(true)
  })
})
