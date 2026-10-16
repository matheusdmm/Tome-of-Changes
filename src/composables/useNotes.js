import { createStoredState } from './useStorage.js'
import { entryKey } from '../utils/entryIdentity.js'

const STORAGE_KEY = 'tome-notes'
const { state: notes, reset: resetNotes } = createStoredState(STORAGE_KEY, {}, value => value && typeof value === 'object' && !Array.isArray(value) && Object.values(value).every(v => typeof v === 'string'))

export function useNotes() {
  function noteKey(entry) {
    return entryKey(entry)
  }

  function getNote(entry) {
    const legacyKeys = [entry.v2014?.key, entry.v2024?.key].filter(Boolean).map(key => `${entry.category}-${key}`)
    return notes.value[noteKey(entry)] || legacyKeys.map(key => notes.value[key]).find(Boolean) || ''
  }

  function saveNote(entry, text) {
    const key = noteKey(entry)
    const legacyKeys = [entry.v2014?.key, entry.v2024?.key].filter(Boolean).map(id => `${entry.category}-${id}`)
    const cleaned = Object.fromEntries(Object.entries(notes.value).filter(([id]) => !legacyKeys.includes(id)))
    if (text.trim()) {
      notes.value = { ...cleaned, [key]: text }
    } else {
      const { [key]: _, ...rest } = cleaned
      notes.value = rest
    }
  }

  return { getNote, saveNote, resetNotes }
}
