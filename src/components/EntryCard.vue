<template>
  <div @click="rememberEntry" @focusin="rememberEntry" class="animate-fade-in bg-[linear-gradient(160deg,var(--color-surface),var(--color-surface-alt))] border border-gold/30 rounded-sm overflow-hidden transition-[border-color,box-shadow] duration-300 hover:border-gold/70 hover:shadow-[0_4px_30px_rgba(184,134,11,0.1)]">

    <!-- Header -->
    <div class="px-4 py-3 sm:px-6 sm:py-4 bg-gradient-to-r from-gold/8 to-transparent border-b border-gold/20 flex flex-col gap-2">
      <h2 class="font-cinzel text-base sm:text-[1.2rem] text-gold-bright font-semibold"><RouterLink :to="comparisonPath(entry)" class="hover:underline">{{ entry.name }}</RouterLink></h2>
      <div class="flex items-center gap-2 flex-wrap">
        <div class="font-cinzel text-[0.65rem] tracking-[0.2em] uppercase py-[0.2rem] px-[0.7rem] border border-crimson text-crimson-light rounded-[1px] shrink-0">{{ CATEGORIES[entry.category]?.label || entry.category }}</div>
        <button
          @click="toggleFavorite(entry)"
          :aria-pressed="isFavorite(entry)"
          :title="isFavorite(entry) ? 'Remove from favorites' : 'Add to favorites'"
          class="font-cinzel text-[0.65rem] tracking-[0.1em] py-[0.2rem] px-[0.7rem] border rounded-[1px] bg-transparent cursor-pointer transition-all duration-200 shrink-0"
          :class="isFavorite(entry) ? 'border-crimson/60 text-crimson-light hover:border-crimson' : 'border-gold/40 text-parchment/80 hover:border-gold hover:text-gold'"
        >{{ isFavorite(entry) ? '♥ Saved' : '♡ Save' }}</button>
        <button
          @click="copyForLLM"
          title="Copy prompt for AI analysis in Portuguese"
          class="font-cinzel text-[0.65rem] tracking-[0.1em] py-[0.2rem] px-[0.7rem] border border-gold/40 rounded-[1px] bg-transparent text-parchment/80 cursor-pointer transition-all duration-200 hover:border-gold hover:text-gold shrink-0"
        >{{ copiedLLM ? '✓ Copied' : '✦ Ask AI' }}</button>
        <button
          @click="copyLink"
          :title="copied ? 'Copied!' : 'Copy shareable link'"
          class="font-cinzel text-[0.65rem] tracking-[0.1em] py-[0.2rem] px-[0.7rem] border border-gold/40 rounded-[1px] bg-transparent text-parchment/80 cursor-pointer transition-all duration-200 hover:border-gold hover:text-gold shrink-0"
        >{{ copied ? '✓ Copied' : '⇥ Share' }}</button>
        <button
          @click="noteOpen = !noteOpen"
          :aria-expanded="noteOpen || !!noteText" :aria-controls="noteId"
          class="font-cinzel text-[0.65rem] tracking-[0.1em] py-[0.2rem] px-[0.7rem] border rounded-[1px] bg-transparent cursor-pointer transition-all duration-200 shrink-0"
          :class="noteText ? 'border-gold/60 text-gold hover:border-gold' : 'border-gold/40 text-parchment/80 hover:border-gold hover:text-gold'"
        >✎ Note{{ noteText ? ' ●' : '' }}</button>
      </div>
      <CollectionPicker :entry="entry" />
    </div>

    <div class="px-4 sm:px-6 py-2 text-sm text-parchment/80" aria-live="polite">
      <p v-if="isSnapshot">Saved snapshot ({{ savedDate }}). <RouterLink :to="comparisonPath(entry)" class="underline">Search current source data</RouterLink></p>
      <p v-if="copyError" role="alert">{{ copyError }}</p>
      <div v-if="confirmFavoriteRemoval" class="my-3 border border-gold/40 p-3 space-y-2">
        <p>Remove this entry from Favorites and all {{ membershipCount }} collections? Its session note will be kept.</p>
        <button class="underline mr-4" @click="removeFavorite">Confirm removal</button><button class="underline" @click="confirmFavoriteRemoval = false">Cancel removal</button>
      </div>
      <p>{{ comparisonStatus }}</p>
      <div class="flex flex-wrap gap-3 mt-3" role="group" aria-label="Comparison reading mode">
        <button :aria-pressed="!changesOnly" class="border px-2 py-1" :class="!changesOnly ? 'bg-gold/15 border-gold text-gold-bright' : 'border-gold/40'" @click="changesOnly = false">Full comparison</button>
        <button :aria-pressed="changesOnly" class="border px-2 py-1" :class="changesOnly ? 'bg-gold/15 border-gold text-gold-bright' : 'border-gold/40'" @click="changesOnly = true">Changes only</button>
      </div>
      <p class="mt-2"><span class="line-through">Removed text</span> · <span class="underline">Added text</span>. Highlights show text edits, not a rules interpretation.</p>
      <p v-if="changesOnly && a && b && !displayTokens.length" class="mt-2">No description changes. Any changed statistics are shown below.</p>
    </div>
    <!-- Stats table (full-width) -->
    <div v-if="displayRows.length" class="px-4 sm:px-6 pt-4 pb-1">
      <StatsTable :rows="displayRows" />
    </div>

    <!-- Description comparison (two columns) -->
    <div class="grid grid-cols-2 max-sm:grid-cols-1" :class="statRows.length ? 'border-t border-gold/10' : ''">

      <!-- 2014 Edition -->
      <div class="py-4 px-4 sm:py-5 sm:px-6 border-r border-gold/15 max-sm:border-r-0 max-sm:border-b max-sm:border-gold/15">
        <div class="font-cinzel text-[0.65rem] tracking-[0.2em] uppercase mb-4 pb-2 border-b border-gold/15 flex items-center gap-2 text-v2014">
          <span class="w-[6px] h-[6px] rounded-full shrink-0 bg-v2014" />
          2014 Edition
        </div>
        <SourceDetails :record="a" />
        <template v-if="a">
          <WordDiff v-if="b" :tokens="displayTokens" side="a" />
          <p v-else class="whitespace-pre-wrap text-parchment/80 text-base leading-[1.8] italic">{{ a.comparisonText }}</p>
        </template>
        <div v-else class="font-cinzel text-sm text-parchment/80 py-4 text-center italic">{{ missingEdition("v2014") }}</div>
      </div>

      <!-- 2024 Edition -->
      <div class="py-4 px-4 sm:py-5 sm:px-6">
        <div class="font-cinzel text-[0.65rem] tracking-[0.2em] uppercase mb-4 pb-2 border-b border-gold/15 flex items-center gap-2 text-v2024">
          <span class="w-[6px] h-[6px] rounded-full shrink-0 bg-v2024" />
          2024 Edition
        </div>
        <SourceDetails :record="b" />
        <template v-if="b">
          <WordDiff v-if="a" :tokens="displayTokens" side="b" />
          <p v-else class="whitespace-pre-wrap text-parchment/80 text-base leading-[1.8] italic">{{ b.comparisonText }}</p>
        </template>
        <div v-else class="font-cinzel text-sm text-parchment/80 py-4 text-center italic">{{ missingEdition("v2024") }}</div>
      </div>
    </div>

    <!-- Detected changes -->
    <div class="bg-v2024/4 border-t border-v2024/15 px-4 py-3 sm:px-6" v-if="diffs?.length">
      <div class="font-cinzel text-[0.65rem] tracking-[0.2em] uppercase text-v2024 mb-2 opacity-80">✦ Detected Changes</div>
      <ul class="flex flex-col gap-1.5">
        <li
          v-for="d in diffs"
          :key="d"
          class="text-sm text-parchment/80 pl-5 relative before:content-['→'] before:absolute before:left-0 before:text-v2024 before:opacity-70"
        >{{ d }}</li>
      </ul>
    </div>

    <!-- Session note -->
    <div v-if="noteOpen || noteText" :id="noteId" class="border-t border-gold/15 px-4 py-3 sm:px-6">
      <label :for="`${noteId}-input`" class="block font-cinzel text-[0.65rem] tracking-[0.2em] uppercase text-parchment/80 mb-2">✎ Session note</label>
      <textarea
        v-model="noteText"
        :id="`${noteId}-input`"
        placeholder="Add a note for your session..."
        rows="3"
        class="w-full bg-transparent text-parchment/80 text-sm resize-none outline-none placeholder:text-parchment/80 leading-relaxed"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, useId, onUnmounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import WordDiff from './WordDiff.vue'
import StatsTable from './StatsTable.vue'
import SourceDetails from './SourceDetails.vue'
import CollectionPicker from './CollectionPicker.vue'
import { CATEGORIES, normalizeRecord, statRows as buildStatRows, computeDiff, wordDiff } from '../composables/useOpen5e.js'
import { useFavorites } from '../composables/useFavorites.js'
import { useNotes } from '../composables/useNotes.js'
import { useRecentlyViewed } from '../composables/useRecentlyViewed.js'
import { useCollections } from '../composables/useCollections.js'
import { comparisonPath, entryKey } from '../utils/entryIdentity.js'
import { groupDiffTokens, changedPassages } from '../utils/wordDiff.js'
import { sourceDetails } from '../utils/sourceDetails.js'
import { changeStatus } from '../utils/entryFilters.js'

const props = defineProps({ entry: { type: Object, required: true } })
const route = useRoute()
const copied = ref(false), copiedLLM = ref(false), copyError = ref('')
const { isFavorite, toggleFavorite: changeFavorite } = useFavorites()
const { getNote, saveNote } = useNotes()
const { addRecentlyViewed } = useRecentlyViewed()
const { collections, contains } = useCollections()
const confirmFavoriteRemoval = ref(false)
const membershipCount = computed(() => collections.value.filter(c => contains(c.id, props.entry)).length)
watch(() => entryKey(props.entry), () => { confirmFavoriteRemoval.value = false })
const noteId = useId()
const noteOpen = ref(false)
const changesOnly = ref(false)
// Write immediately: navigation, reload and deletion cannot leave a delayed save behind.
const noteText = computed({ get: () => getNote(props.entry), set: value => saveNote(props.entry, value) })
const a = computed(() => normalizeRecord(props.entry.category, props.entry.v2014))
const b = computed(() => normalizeRecord(props.entry.category, props.entry.v2024))
const statRows = computed(() => buildStatRows(props.entry.category, a.value, b.value))
const diffs = computed(() => a.value && b.value ? computeDiff(props.entry.category, a.value, b.value) : [])
const tokens = computed(() => groupDiffTokens(wordDiff(a.value?.comparisonText, b.value?.comparisonText)))
const displayTokens = computed(() => changesOnly.value ? changedPassages(tokens.value) : tokens.value)
const displayRows = computed(() => changesOnly.value && a.value && b.value ? statRows.value.filter(row => row.changed) : statRows.value)
const comparisonStatus = computed(() => {
  if (!a.value || !b.value) return 'A complete edition comparison is not available for this entry.'
  return changeStatus(props.entry) === 'unchanged' ? 'No changes detected in the compared fields.' : 'Both editions available. Changes detected in the compared fields.'
})
const isSnapshot = computed(() => route.name === 'favorites')
const savedDate = computed(() => {
  const date = props.entry.savedAt || props.entry.fetchedAt
  return date ? new Date(date).toLocaleDateString() : 'date unknown'
})
function missingEdition(edition) {
  if (props.entry.referenceOnly) return 'Rules text was not included in this backup. Open current source data to load this entry.'
  const state = props.entry.availability?.[edition]
  if (state === 'unavailable') return 'Source unavailable. Retry the search to compare this edition.'
  if (state === 'incomplete') return 'Source results are incomplete. Try a more specific name.'
  if (state === 'ambiguous') return 'Multiple possible counterparts. Review the source entries separately.'
  return 'No matching entry found in this SRD. It may have a different name or be outside SRD coverage.'
}
function rememberEntry() { addRecentlyViewed(props.entry) }
function toggleFavorite(entry) {
  const adding = !isFavorite(entry)
  if (!adding && membershipCount.value) { confirmFavoriteRemoval.value = true; return }
  changeFavorite(entry)
}
function removeFavorite() {
  if (isFavorite(props.entry)) changeFavorite(props.entry)
  confirmFavoriteRemoval.value = false
}
let copiedTimer, promptTimer
async function copyText(text, prompt = false) {
  copyError.value = ''
  try {
    if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable')
    await navigator.clipboard.writeText(text)
    if (prompt) {
      copiedLLM.value = true; clearTimeout(promptTimer)
      promptTimer = setTimeout(() => copiedLLM.value = false, 2000)
    } else {
      copied.value = true; clearTimeout(copiedTimer)
      copiedTimer = setTimeout(() => copied.value = false, 2000)
    }
  } catch { copyError.value = 'Could not copy. Allow clipboard access in your browser and try again.' }
}
function copyLink() { return copyText(window.location.origin + comparisonPath(props.entry)) }
function copyForLLM() {
  const lines = ["Compare as regras do D&D 5e de 2014 e 2024. Responda em Português Brasileiro.", props.entry.name, 'Estatísticas:']
  for (const r of statRows.value) lines.push(r.label + ': ' + r.v14 + ' (2014) → ' + r.v24 + ' (2024)')
  for (const [edition, record] of [['2014', a.value], ['2024', b.value]]) {
    lines.push(edition + ':', record?.comparisonText || missingEdition('v' + edition))
    const source = sourceDetails(record)
    if (source) lines.push('Fonte: ' + source.name + ' (' + source.version + ')', source.url || '')
  }
  lines.push(...diffs.value, 'Diferencie mudanças observadas de interpretações. Não conclua que uma regra foi removida quando não há dados suficientes.')
  return copyText(lines.join('\n'), true)
}
onUnmounted(() => { clearTimeout(copiedTimer); clearTimeout(promptTimer) })
</script>
