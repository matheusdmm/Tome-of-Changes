<template>
  <details class="border border-gold/30 rounded-sm p-4 text-parchment/90">
    <summary class="cursor-pointer font-cinzel">Backup and restore</summary>
    <div class="mt-4 space-y-4">
      <p class="text-sm">Download favorites, session notes, and collections as a JSON file. The file includes personal notes; keep it somewhere you trust.</p>
      <label class="flex items-center gap-2 text-sm"><input v-model="includeSnapshots" type="checkbox" /> Include saved rules text</label>
      <label v-if="selectedCollection" class="flex items-center gap-2 text-sm"><input v-model="collectionOnly" type="checkbox" /> Export only {{ selectedCollection.name }} and its entry notes</label>
      <button class="border border-gold/50 px-3 py-2" @click="download">Download backup</button>
      <label class="block space-y-2"><span class="block">Import a backup (maximum 5 MB)</span><input type="file" accept=".json,application/json" @change="readFile" /></label>
      <div v-if="pending" class="border-t border-gold/20 pt-4 space-y-3">
        <p>Ready to import {{ pending.data.favorites.length }} favorites, {{ Object.keys(pending.data.notes).length }} notes, and {{ pending.data.collections.length }} collections.</p>
        <fieldset class="space-y-2"><legend class="mb-2">Import method</legend>
          <label class="flex gap-2"><input v-model="mode" type="radio" :name="`${id}-mode`" value="merge" /> Merge with saved data</label>
          <label class="flex gap-2"><input v-model="mode" type="radio" :name="`${id}-mode`" value="replace" /> Replace favorites, notes, and collections</label>
        </fieldset>
        <label v-if="mode === 'merge'" class="block">When the same entry, note, or collection setting already exists
          <select v-model="conflict" class="block mt-2 p-2 bg-input-bg border border-gold/40"><option value="keep">Keep current values</option><option value="import">Use imported values</option></select>
        </label>
        <p v-else class="text-sm">Replacing removes your current favorites, notes, and collections. Download a backup first if you want to keep them. Recent history and theme are unchanged.</p>
        <div class="flex gap-4"><button class="border border-gold px-3 py-2" @click="apply">{{ mode === 'replace' ? 'Replace saved data' : 'Merge backup' }}</button><button class="underline" @click="pending = null">Cancel import</button></div>
      </div>
      <p v-if="error" role="alert">{{ error }}</p>
      <p role="status" aria-live="polite">{{ message }}</p>
    </div>
  </details>
</template>
<script setup>
import { ref, useId, onUnmounted, computed, watch } from 'vue'
import { createBackup, parseBackup, importBackup, MAX_BACKUP_BYTES } from '../utils/backup.js'
import { useCollections } from '../composables/useCollections.js'
const props = defineProps({ collectionId: { type: String, default: '' } })
const { collections } = useCollections()
const collectionOnly = ref(false)
const selectedCollection = computed(() => collections.value.find(c => c.id === props.collectionId))
watch(() => props.collectionId, () => { collectionOnly.value = false })
const id = useId()
const includeSnapshots = ref(true), pending = ref(null), mode = ref('merge'), conflict = ref('keep'), error = ref(''), message = ref('')
let fileSequence = 0
const downloadUrls = new Set()
function download() {
  error.value = ''; message.value = ''
  try {
    const text = JSON.stringify(createBackup(includeSnapshots.value, collectionOnly.value ? props.collectionId : null), null, 2)
    if (new Blob([text]).size > MAX_BACKUP_BYTES) throw new Error('This backup exceeds 5 MB. Try excluding saved rules text.')
    const url = URL.createObjectURL(new Blob([text], { type: 'application/json' }))
    downloadUrls.add(url)
    const anchor = document.createElement('a')
    anchor.href = url; anchor.download = `tome-of-changes-${new Date().toISOString().slice(0, 10)}.json`
    document.body.append(anchor); anchor.click(); anchor.remove()
    message.value = 'Backup download started.'
  } catch (reason) { error.value = reason.message }
}
async function readFile(event) {
  const current = ++fileSequence, file = event.target.files?.[0]
  pending.value = null; error.value = ''; message.value = ''; event.target.value = ''
  if (!file) return
  try {
    if (file.size > MAX_BACKUP_BYTES) throw new Error('Backup exceeds the 5 MB limit.')
    const backup = parseBackup(await file.text())
    if (current !== fileSequence) return
    pending.value = backup; mode.value = 'merge'; conflict.value = 'keep'
  } catch (reason) { if (current === fileSequence) error.value = reason.message }
}
function apply() {
  error.value = ''
  try {
    const counts = importBackup(pending.value, mode.value, conflict.value)
    pending.value = null
    message.value = `Import complete: ${counts.favorites} favorites, ${counts.notes} notes, ${counts.collections} collections saved.`
  } catch (reason) { error.value = reason.message }
}
onUnmounted(() => { fileSequence++; for (const url of downloadUrls) URL.revokeObjectURL(url) })
</script>
