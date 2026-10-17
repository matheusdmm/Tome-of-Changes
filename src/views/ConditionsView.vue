<template>
  <div>
    <div class="text-center mb-6">
      <h1 class="font-cinzel text-xl text-gold-bright mb-3">D&amp;D Conditions: 2014 vs 2024</h1>
      <p class="text-parchment/80 mb-4">Compare available SRD conditions side by side, with highlighted text changes between editions.</p>
      <CategoryLinks />
    </div>
    <p role="status" aria-live="polite" class="text-center mb-6 text-parchment/80">
      {{ loading ? 'Consulting the tome...' : error || `${conditions.length} conditions` }}
    </p>
    <button v-if="error" class="block mx-auto mb-6 underline" @click="load">Retry conditions</button>
    <div class="flex flex-col gap-6"><EntryCard v-for="entry in conditions" :key="entry.slug" :entry="entry" /></div>
  </div>
</template>
<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import EntryCard from '../components/EntryCard.vue'
import CategoryLinks from '../components/CategoryLinks.vue'
import { fetchAllConditions } from '../composables/useOpen5e.js'
import { usePageMeta } from '../composables/usePageMeta.js'
usePageMeta('Tome Of Changes — D&D Conditions: 2014 vs 2024', 'Compare D&D conditions between the 2014 and 2024 editions. See available SRD descriptions side by side with highlighted text differences.')
const conditions = ref([]), loading = ref(false), error = ref('')
let controller
async function load() {
  controller?.abort()
  controller = new AbortController()
  const current = controller
  loading.value = true; error.value = ''
  try { const entries = await fetchAllConditions({ signal: current.signal }); if (!current.signal.aborted) conditions.value = entries }
  catch (reason) { if (!current.signal.aborted) error.value = reason?.message || 'Could not reach Open5e. Please retry.' }
  finally { if (!current.signal.aborted) loading.value = false }
}
onMounted(load)
onUnmounted(() => controller?.abort())
</script>
