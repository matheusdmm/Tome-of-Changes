import { ref, watch } from 'vue'

export const storageError = ref('')
const stores = new Map()
const fresh = value => structuredClone(value)

export function createStoredState(key, initial, validate) {
  function decode(raw) {
    if (raw == null) return fresh(initial)
    const parsed = JSON.parse(raw)
    const value = parsed?.version === 1 ? parsed.data : parsed
    if (!validate(value)) throw new Error('Invalid saved data')
    return value
  }
  function read() {
    try { return decode(localStorage.getItem(key)) }
    catch { storageError.value = 'Some saved data could not be read. Search still works; reset saved data or enable browser storage.'; return fresh(initial) }
  }
  const state = ref(read())
  let external = false
  watch(state, value => {
    if (external) return
    try { localStorage.setItem(key, JSON.stringify({ version: 1, data: value })) }
    catch { storageError.value = 'Changes are available in this tab but could not be saved. Browser storage may be blocked or full.' }
  }, { deep: true, flush: 'sync' })
  function receive(raw) {
    try {
      external = true
      state.value = decode(raw)
    } catch { storageError.value = 'Saved data in another tab could not be read.' }
    finally { external = false }
  }
  function reset() {
    receive(null)
    try { localStorage.removeItem(key) }
    catch { storageError.value = 'Saved data could not be deleted from browser storage. Check browser permissions and retry.' }
  }
  stores.set(key, { receive, reset })
  return { state, reset }
}

if (typeof window !== 'undefined') window.addEventListener('storage', event => {
  if (event.storageArea && event.storageArea !== localStorage) return
  if (event.key === null) for (const store of stores.values()) store.receive(null)
  else stores.get(event.key)?.receive(event.newValue)
})

export function resetStoredData() {
  storageError.value = ''
  for (const store of stores.values()) store.reset()
  return !storageError.value
}

export const validEntry = value => value && typeof value.name === 'string' && typeof value.slug === 'string'
  && ['Spell', 'Condition', 'Feat', 'Creature', 'MagicItem', 'Race'].includes(value.category)
