<template>
  <div>
    <div :class="[
      'text-center font-cinzel text-[0.7rem] tracking-[0.15em] uppercase mb-6 min-h-[1.2em]',
      loading ? 'text-gold-light animate-pulse-glow' : error ? 'text-crimson-light' : 'text-parchment/35',
    ]">
      <template v-if="loading">✦ Consulting the tome...</template>
      <template v-else-if="error">✦ {{ error }}</template>
      <template v-else-if="conditions.length">✦ {{ conditions.length }} conditions</template>
    </div>

    <div class="flex flex-col gap-6">
      <EntryCard v-for="entry in conditions" :key="entry.slug" :entry="entry" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import EntryCard from '../components/EntryCard.vue'
import { fetchAllConditions } from '../composables/useOpen5e.js'
import { usePageMeta } from '../composables/usePageMeta.js'

usePageMeta(
  'Conditions — D&D 5e 2014 vs 2024 | Tome of Changes',
  'Quick reference for all D&D 5e conditions, side-by-side comparison between 2014 and 2024 editions.',
)

const conditions = ref([])
const loading = ref(false)
const error = ref(null)

onMounted(async () => {
  loading.value = true
  try {
    conditions.value = await fetchAllConditions()
  } catch {
    error.value = 'Could not reach Open5e API.'
  } finally {
    loading.value = false
  }
})
</script>
