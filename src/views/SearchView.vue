<template>
  <div>
    <div class="flex justify-center gap-4 mb-4 text-sm"><RouterLink to="/browse/Spell" class="underline">Browse all categories</RouterLink></div>
    <SearchBar v-model="query" v-model:category="category" @submit="submit" />
    <EntryFilters :category="category" :entries="results" :filters="filters" @update="setFilter" @reset="resetFilters" />
    <div role="status" aria-live="polite" :aria-busy="loading" class="text-center font-cinzel text-sm mb-6 text-parchment/80">
      <span v-if="loading">Loading comparisons...</span>
      <span v-else-if="error">{{ error }}</span>
      <span v-else-if="results.length && filteredResults.length === results.length">{{ results.length }} {{ results.length === 1 ? 'entry' : 'entries' }} found</span>
      <span v-else-if="results.length">{{ filteredResults.length }} matches out of {{ results.length }} loaded entries</span>
      <span v-else-if="query.trim() || browsing">No matching entries found in the available SRD data.</span>
      <span v-else>Enter a name to search.</span>
    </div>
    <div v-if="error || warnings.length" class="mb-6 border border-gold/40 p-4 text-parchment/90">
      <p v-for="warning in warnings" :key="warning">{{ warning }}</p>
      <button class="mt-2 underline" @click="retry">Retry search</button>
    </div>
    <div class="flex flex-col gap-6"><EntryCard v-for="entry in visibleResults" :key="`${entry.category}-${entry.slug}`" :entry="entry" /></div>
    <nav v-if="pageCount > 1" aria-label="Search result pages" class="flex justify-center items-center gap-4 my-6">
      <button :disabled="page <= 1" @click="setPage(page - 1)">Previous</button><span aria-live="polite">Page {{ page }} of {{ pageCount }}</span><button :disabled="page >= pageCount" @click="setPage(page + 1)">Next</button>
    </nav>
  </div>
</template>
<script setup>
import { ref, watch, computed, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { track } from '@vercel/analytics'
import SearchBar from '../components/SearchBar.vue'
import EntryFilters from '../components/EntryFilters.vue'
import EntryCard from '../components/EntryCard.vue'
import { useEntrySearch } from '../composables/useEntrySearch.js'
import { usePageMeta } from '../composables/usePageMeta.js'
import { useRecentlyViewed } from '../composables/useRecentlyViewed.js'
import { canonicalName } from '../utils/entryIdentity.js'
import { filterEntries } from '../utils/entryFilters.js'
const route = useRoute(), router = useRouter()
const browsing = computed(() => route.name === 'browse')
const routeQuery = () => String(browsing.value ? route.query.q || '' : route.params.query || '')
const query = ref(routeQuery()), category = ref(String(route.params.category || 'Spell'))
const { results, warnings, loading, error, run, clear, cancel } = useEntrySearch()
const { addRecentlyViewed } = useRecentlyViewed()
const string = value => typeof value === 'string' ? value : ''
const filters = computed(() => ({
  level: /^[0-9]$/.test(string(route.query.level)) ? route.query.level : '',
  school: string(route.query.school).slice(0, 80), cr: string(route.query.cr).slice(0, 20), type: string(route.query.type).slice(0, 80),
  change: ['changed', 'unchanged', 'unpaired'].includes(route.query.change) ? route.query.change : 'all',
}))
const filteredResults = computed(() => filterEntries(results.value, category.value, filters.value))
const pageCount = computed(() => Math.max(1, Math.ceil(filteredResults.value.length / 10)))
const page = computed(() => Math.min(pageCount.value, Math.max(1, Number.parseInt(route.query.page, 10) || 1)))
const visibleResults = computed(() => filteredResults.value.slice((page.value - 1) * 10, page.value * 10))
usePageMeta(computed(() => `${query.value || 'Browse'} — ${category.value} | Tome of Changes`), 'Browse and compare available SRD rules between D&D 5e 2014 and 2024.')
let timer, syncing = false
function submit() {
  clearTimeout(timer)
  const changedCategory = category.value !== route.params.category
  const parameters = changedCategory ? {} : { ...route.query }
  delete parameters.page
  const target = browsing.value
    ? { name: 'browse', params: { category: category.value }, query: { ...parameters, q: query.value.trim() || undefined } }
    : query.value.trim()
      ? { name: 'compare', params: { category: category.value, query: query.value.trim() }, query: parameters }
      : { path: `/compare/${encodeURIComponent(category.value)}/`, query: parameters }
  if (router.resolve(target).fullPath === route.fullPath) run(category.value, query.value, false, browsing.value)
  else router.replace(target)
}
function retry() { return run(category.value, query.value, true, browsing.value) }
function setPage(number) { router.replace({ query: { ...route.query, page: String(number) } }) }
function setFilter({ key, value }) { router.replace({ query: { ...route.query, [key]: value === '' || value === 'all' ? undefined : value, page: undefined } }) }
function resetFilters() {
  const parameters = { ...route.query }
  for (const key of ['level', 'school', 'cr', 'type', 'change', 'page']) delete parameters[key]
  router.replace({ query: parameters })
}
watch([query, category], () => {
  if (syncing) return
  clearTimeout(timer); clear()
  timer = setTimeout(submit, 400)
}, { flush: 'sync' })
watch(() => JSON.stringify([route.name, route.params.category, route.params.query, route.query.q]), async () => {
  clearTimeout(timer); syncing = true
  query.value = routeQuery(); category.value = String(route.params.category || 'Spell')
  syncing = false
  const activeCategory = category.value, activeQuery = query.value
  await run(activeCategory, activeQuery, false, browsing.value)
  if (category.value !== activeCategory || query.value !== activeQuery) return
  if (results.value.length === 1 && activeQuery && canonicalName(activeCategory, results.value[0].name) === canonicalName(activeCategory, activeQuery)) addRecentlyViewed(results.value[0])
  if (!error.value && (activeQuery.trim() || browsing.value)) track('search', { category: activeCategory, results: results.value.length })
}, { immediate: true })
onUnmounted(() => { clearTimeout(timer); cancel() })
</script>
