import { describe, it, expect, beforeEach, vi } from 'vitest'

const ENTRY = { slug: 'fireball', name: 'Fireball', category: 'Spell' }
const ENTRY_B = { slug: 'charmed', name: 'Charmed', category: 'Condition' }

beforeEach(() => {
  localStorage.clear()
  vi.resetModules()
})

async function getComposable() {
  const { useNotes } = await import('../useNotes.js')
  return useNotes()
}

describe('useNotes', () => {
  it('returns empty string for unknown entry', async () => {
    const { getNote } = await getComposable()
    expect(getNote(ENTRY)).toBe('')
  })

  it('saves and retrieves a note', async () => {
    const { getNote, saveNote } = await getComposable()
    saveNote(ENTRY, 'Boss uses this spell at level 5')
    expect(getNote(ENTRY)).toBe('Boss uses this spell at level 5')
  })

  it('saves notes independently per entry', async () => {
    const { getNote, saveNote } = await getComposable()
    saveNote(ENTRY, 'Note A')
    saveNote(ENTRY_B, 'Note B')
    expect(getNote(ENTRY)).toBe('Note A')
    expect(getNote(ENTRY_B)).toBe('Note B')
  })

  it('deletes note when saved with empty string', async () => {
    const { getNote, saveNote } = await getComposable()
    saveNote(ENTRY, 'Some note')
    saveNote(ENTRY, '')
    expect(getNote(ENTRY)).toBe('')
  })

  it('deletes note when saved with whitespace only', async () => {
    const { getNote, saveNote } = await getComposable()
    saveNote(ENTRY, 'Some note')
    saveNote(ENTRY, '   ')
    expect(getNote(ENTRY)).toBe('')
  })

  it('overwrites existing note', async () => {
    const { getNote, saveNote } = await getComposable()
    saveNote(ENTRY, 'Old note')
    saveNote(ENTRY, 'New note')
    expect(getNote(ENTRY)).toBe('New note')
  })
})
