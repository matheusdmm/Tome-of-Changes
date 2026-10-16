<template>
  <div>
    <SearchBar v-model="query" v-model:category="category" @submit="submit" />
    <div role="status" aria-live="polite" :aria-busy="loading" class="text-center font-cinzel text-sm mb-6 text-parchment/80">
      <span v-if="loading">✦ Consulting the tome...</span>
      <span v-else-if="error">{{ error }}</span>
      <span v-else-if="results.length">{{ results.length }} {{ results.length === 1 ? 'entry' : 'entries' }} found</span>
      <span v-else-if="query.trim()">No matching entries found in the available SRD data.</span>
      <span v-else>Enter a name to search.</span>
    </div>
    <div v-if="error || warnings.length" class="mb-6 border border-gold/40 p-4 text-parchment/90">
      <p v-for="warning in warnings" :key="warning">{{ warning }}</p>
      <button class="mt-2 underline" @click="retry">Retry search</button>
    </div>
    <div class="flex flex-col gap-6">
      <EntryCard v-for="entry in visibleResults" :key="`${entry.category}-${entry.slug}`" :entry="entry" />
    </div>
    <nav v-if="pageCount > 1" aria-label="Search result pages" class="flex justify-center items-center gap-4 my-6">
      <button :disabled="page <= 1" @click="setPage(page - 1)">Previous</button>
      <span aria-live="polite">Page {{ page }} of {{ pageCount }}</span>
      <button :disabled="page >= pageCount" @click="setPage(page + 1)">Next</button>
    </nav>
  </div>
</template>
<script setup>
import { ref, watch, computed, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { track } from '@vercel/analytics'
import SearchBar from '../components/SearchBar.vue'
import EntryCard from '../components/EntryCard.vue'
import { useEntrySearch } from '../composables/useEntrySearch.js'
import { usePageMeta } from '../composables/usePageMeta.js'
import { useRecentlyViewed } from '../composables/useRecentlyViewed.js'
import { canonicalName } from '../utils/entryIdentity.js'
const route = useRoute(), router = useRouter()
const query = ref(String(route.params.query || '')), category = ref(String(route.params.category || 'Spell'))
const { results, warnings, loading, error, run, clear, cancel } = useEntrySearch()
const { addRecentlyViewed } = useRecentlyViewed()
const page = computed(() => Math.min(pageCount.value, Math.max(1, Number.parseInt(route.query.page, 10) || 1)))
const pageCount = computed(() => Math.max(1, Math.ceil(results.value.length / 10)))
const visibleResults = computed(() => results.value.slice((page.value - 1) * 10, page.value * 10))
const title = computed(() => `${query.value || 'Compare'} — ${category.value} | Tome of Changes`)
usePageMeta(title, 'Compare available SRD rules between D&D 5e 2014 and 2024. Review text and statistics side by side.')
let timer
function submit() {
  clearTimeout(timer)
  const path = `/compare/${encodeURIComponent(category.value)}/${encodeURIComponent(query.value.trim())}`
  if (route.path !== path) router.replace(path)
  else run(category.value, query.value)
}
function retry() { return run(category.value, query.value, true) }
function setPage(number) { router.replace({ query: { ...route.query, page: String(number) } }) }
watch([query, category], () => {
  clearTimeout(timer)
  clear()
  if (!query.value.trim()) return
  if (query.value === route.params.query && category.value === route.params.category) return
  timer = setTimeout(submit, 400)
}, { flush: 'sync' })
watch(() => [route.params.category, route.params.query], async ([cat, q]) => {
  clearTimeout(timer)
  query.value = String(q || '')
  category.value = String(cat || 'Spell')
  clearTimeout(timer)
  await run(category.value, query.value)
  if (results.value.length === 1 && canonicalName(category.value, results.value[0].name) === canonicalName(category.value, query.value)) addRecentlyViewed(results.value[0])
  if (!error.value && query.value.trim()) track('search', { category: category.value, results: results.value.length })
}, { immediate: true })
onUnmounted(() => { clearTimeout(timer); cancel() })
</script>
