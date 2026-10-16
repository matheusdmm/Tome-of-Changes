<template>
  <div>
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
import { fetchAllConditions } from '../composables/useOpen5e.js'
import { usePageMeta } from '../composables/usePageMeta.js'
usePageMeta('Conditions | Tome of Changes', 'Compare available SRD conditions between the 2014 and 2024 rules.')
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
