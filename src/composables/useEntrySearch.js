import { ref, onScopeDispose } from 'vue'
import { searchEntries, clearApiCache } from './useOpen5e.js'

export function useEntrySearch() {
  const results = ref([]), warnings = ref([]), loading = ref(false), error = ref('')
  let controller, sequence = 0
  function cancel() { sequence++; controller?.abort(); loading.value = false }
  function clear() { cancel(); results.value = []; warnings.value = []; error.value = '' }
  async function run(category, query, retry = false) {
    clear()
    if (!query.trim()) return
    if (retry) clearApiCache()
    controller = new AbortController()
    const id = sequence
    loading.value = true
    try {
      const data = await searchEntries(category, query, { signal: controller.signal })
      if (id !== sequence) return
      results.value = data.entries
      warnings.value = data.warnings
    } catch (reason) {
      if (id === sequence) error.value = reason?.message || 'Could not reach Open5e. Please retry.'
    } finally { if (id === sequence) loading.value = false }
  }
  onScopeDispose(cancel)
  return { results, warnings, loading, error, run, clear, cancel }
}
