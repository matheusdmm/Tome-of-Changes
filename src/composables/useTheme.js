import { watch } from 'vue'
import { createStoredState } from './useStorage.js'

// Migrate the original unversioned plain-string preference.
try {
  const legacy = localStorage.getItem('theme')
  if (legacy === 'light' || legacy === 'dark') localStorage.setItem('theme', JSON.stringify(legacy))
} catch { /* createStoredState reports unavailable storage */ }
const { state: theme } = createStoredState('theme', 'dark', v => v === 'light' || v === 'dark')
watch(theme, value => document.documentElement.classList.toggle('light', value === 'light'), { immediate: true, flush: 'sync' })
export function useTheme() {
  return { theme, toggleTheme: () => { theme.value = theme.value === 'light' ? 'dark' : 'light' } }
}
