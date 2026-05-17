import { ref, watch } from 'vue'

const STORAGE_KEY = 'tome-notes'
const notes = ref(JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'))

watch(notes, val => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(val))
}, { deep: true })

export function useNotes() {
  function noteKey(entry) {
    return `${entry.category}-${entry.slug}`
  }

  function getNote(entry) {
    return notes.value[noteKey(entry)] || ''
  }

  function saveNote(entry, text) {
    const key = noteKey(entry)
    if (text.trim()) {
      notes.value = { ...notes.value, [key]: text }
    } else {
      const { [key]: _, ...rest } = notes.value
      notes.value = rest
    }
  }

  return { getNote, saveNote }
}
