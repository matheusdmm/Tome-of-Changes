<template>
  <div>
    <SearchBar v-model="query" v-model:category="category" />

    <div :class="[
      'text-center font-cinzel text-[0.7rem] tracking-[0.15em] uppercase mb-6 min-h-[1.2em]',
      loading ? 'text-gold-light animate-pulse-glow' : error ? 'text-crimson-light' : 'text-parchment/35',
    ]">
      <template v-if="loading">✦ Consulting the tome...</template>
      <template v-else-if="error">✦ {{ error }}</template>
      <template v-else-if="results.length">✦ {{ results.length }} {{ results.length === 1 ? 'entry' : 'entries' }} found</template>
    </div>

    <div class="flex flex-col gap-6">
      <EntryCard v-for="entry in results" :key="entry.slug" :entry="entry" />
    </div>

    <div class="text-center py-16 px-8 text-parchment/30" v-if="!loading && !error && results.length === 0">
      <div class="font-cinzel text-3xl mb-4 opacity-20">✦</div>
      <div class="font-cinzel text-[0.85rem] tracking-[0.1em]">No entries found in the tome</div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import SearchBar from '../components/SearchBar.vue'
import EntryCard from '../components/EntryCard.vue'
import { searchEntries } from '../composables/useOpen5e.js'
import { usePageMeta } from '../composables/usePageMeta.js'
import { useRecentlyViewed } from '../composables/useRecentlyViewed.js'
import { track } from '@vercel/analytics'

const route  = useRoute()
const router = useRouter()
const { addRecentlyViewed } = useRecentlyViewed()

const query    = ref(route.params.query || '')
const category = ref(route.params.category || 'Spell')
const results  = ref([])
const loading  = ref(false)
const error    = ref(null)

const metaTitle = computed(() =>
  results.value.length
    ? `${results.value[0].name} — ${category.value} | Tome of Changes`
    : query.value
      ? `${query.value} — ${category.value} | Tome of Changes`
      : 'Tome of Changes — D&D 5e 2014 vs 2024'
)
const metaDesc = computed(() =>
  results.value.length
    ? `Compare ${results.value[0].name} between D&D 5e 2014 and 2024. See exactly what changed — word-level diffs, stat table, and detected changes.`
    : 'Compare D&D 5e spells, feats, creatures, conditions, magic items, and species between the 2014 and 2024 editions.'
)
usePageMeta(metaTitle, metaDesc)

async function doSearch() {
  const q = query.value.trim()
  if (!q) { results.value = []; return }
  loading.value = true; error.value = null
  try {
    results.value = await searchEntries(category.value, q)
    results.value.forEach(entry => addRecentlyViewed(entry))
    track('search', { category: category.value, results: results.value.length })
  } catch {
    error.value = 'Could not reach Open5e API.'
    results.value = []
  } finally {
    loading.value = false
  }
}

let timer = null
watch([query, category], ([q, cat]) => {
  clearTimeout(timer)
  if (!q.trim()) return
  timer = setTimeout(() => router.replace(`/compare/${cat}/${q.trim()}`), 400)
})

watch(() => route.params, params => {
  if (params.query)    query.value    = params.query
  if (params.category) category.value = params.category
  doSearch()
})

onMounted(doSearch)
</script>
