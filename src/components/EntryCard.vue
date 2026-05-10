<template>
  <div class="animate-fade-in bg-[linear-gradient(160deg,var(--color-surface),var(--color-surface-alt))] border border-gold/30 rounded-sm overflow-hidden transition-[border-color,box-shadow] duration-300 hover:border-gold/70 hover:shadow-[0_4px_30px_rgba(184,134,11,0.1)]">

    <!-- Header -->
    <div class="px-4 py-3 sm:px-6 sm:py-4 bg-gradient-to-r from-gold/8 to-transparent border-b border-gold/20 flex flex-col gap-2">
      <div class="font-cinzel text-base sm:text-[1.2rem] text-gold-bright font-semibold">{{ entry.name }}</div>
      <div class="flex items-center gap-2 flex-wrap">
        <div class="font-cinzel text-[0.65rem] tracking-[0.2em] uppercase py-[0.2rem] px-[0.7rem] border border-crimson text-crimson-light rounded-[1px] shrink-0">{{ entry.category }}</div>
        <button
          @click="toggleFavorite(entry)"
          :title="isFavorite(entry) ? 'Remove from favorites' : 'Add to favorites'"
          class="font-cinzel text-[0.65rem] tracking-[0.1em] py-[0.2rem] px-[0.7rem] border rounded-[1px] bg-transparent cursor-pointer transition-all duration-200 shrink-0"
          :class="isFavorite(entry) ? 'border-crimson/60 text-crimson-light hover:border-crimson' : 'border-gold/40 text-parchment/50 hover:border-gold hover:text-gold'"
        >{{ isFavorite(entry) ? '♥ Saved' : '♡ Save' }}</button>
        <button
          @click="copyForLLM"
          title="Copy prompt for AI analysis in Portuguese"
          class="font-cinzel text-[0.65rem] tracking-[0.1em] py-[0.2rem] px-[0.7rem] border border-gold/40 rounded-[1px] bg-transparent text-parchment/50 cursor-pointer transition-all duration-200 hover:border-gold hover:text-gold shrink-0"
        >{{ copiedLLM ? '✓ Copied' : '✦ Ask AI' }}</button>
        <button
          @click="copyLink"
          :title="copied ? 'Copied!' : 'Copy shareable link'"
          class="font-cinzel text-[0.65rem] tracking-[0.1em] py-[0.2rem] px-[0.7rem] border border-gold/40 rounded-[1px] bg-transparent text-parchment/50 cursor-pointer transition-all duration-200 hover:border-gold hover:text-gold shrink-0"
        >{{ copied ? '✓ Copied' : '⇥ Share' }}</button>
      </div>
    </div>

    <!-- Stats table (full-width) -->
    <div v-if="statRows.length" class="px-4 sm:px-6 pt-4 pb-1">
      <StatsTable :rows="statRows" />
    </div>

    <!-- Description comparison (two columns) -->
    <div class="grid grid-cols-2 max-sm:grid-cols-1" :class="statRows.length ? 'border-t border-gold/10' : ''">

      <!-- 2014 Edition -->
      <div class="py-4 px-4 sm:py-5 sm:px-6 border-r border-gold/15 max-sm:border-r-0 max-sm:border-b max-sm:border-gold/15">
        <div class="font-cinzel text-[0.65rem] tracking-[0.2em] uppercase mb-4 pb-2 border-b border-gold/15 flex items-center gap-2 text-v2014">
          <span class="w-[6px] h-[6px] rounded-full shrink-0 bg-v2014" />
          2014 Edition
        </div>
        <template v-if="entry.v2014">
          <WordDiff v-if="entry.v2024" :textA="entry.v2014.desc" :textB="entry.v2024.desc" side="a" />
          <p v-else class="text-parchment/80 text-base leading-[1.8] italic">{{ truncate(entry.v2014.desc, 400) }}</p>
        </template>
        <div v-else class="font-cinzel text-sm text-parchment/20 py-4 text-center italic">Not present in 2014 SRD</div>
      </div>

      <!-- 2024 Edition -->
      <div class="py-4 px-4 sm:py-5 sm:px-6">
        <div class="font-cinzel text-[0.65rem] tracking-[0.2em] uppercase mb-4 pb-2 border-b border-gold/15 flex items-center gap-2 text-v2024">
          <span class="w-[6px] h-[6px] rounded-full shrink-0 bg-v2024" />
          2024 Edition
        </div>
        <template v-if="entry.v2024">
          <WordDiff v-if="entry.v2014" :textA="entry.v2014.desc" :textB="entry.v2024.desc" side="b" />
          <p v-else class="text-parchment/80 text-base leading-[1.8] italic">{{ truncate(entry.v2024.desc, 400) }}</p>
        </template>
        <div v-else class="font-cinzel text-sm text-parchment/20 py-4 text-center italic">Not present in 2024 SRD</div>
      </div>
    </div>

    <!-- Detected changes -->
    <div class="bg-v2024/4 border-t border-v2024/15 px-4 py-3 sm:px-6" v-if="entry.diffs?.length">
      <div class="font-cinzel text-[0.65rem] tracking-[0.2em] uppercase text-v2024 mb-2 opacity-80">✦ Detected Changes</div>
      <ul class="flex flex-col gap-1.5">
        <li
          v-for="d in entry.diffs"
          :key="d"
          class="text-sm text-parchment/70 pl-5 relative before:content-['→'] before:absolute before:left-0 before:text-v2024 before:opacity-70"
        >{{ d }}</li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { track } from '@vercel/analytics'
import WordDiff from './WordDiff.vue'
import StatsTable from './StatsTable.vue'
import { spellLevel, schoolName, speciesSize, speciesSpeed } from '../composables/useOpen5e.js'
import { useFavorites } from '../composables/useFavorites.js'

const props = defineProps({ entry: Object })
const copied = ref(false)
const copiedLLM = ref(false)
const { isFavorite, toggleFavorite: _toggleFavorite } = useFavorites()

function toggleFavorite(entry) {
  const adding = !isFavorite(entry)
  _toggleFavorite(entry)
  track('favorite', { category: entry.category, name: entry.name, action: adding ? 'add' : 'remove' })
}

function truncate(t, max) { return t && t.length > max ? t.slice(0, max) + '…' : (t || '') }

function copyLink() {
  navigator.clipboard.writeText(`${window.location.origin}/compare/${props.entry.category}/${props.entry.name}`)
  track('share', { category: props.entry.category, name: props.entry.name })
  copied.value = true
  setTimeout(() => copied.value = false, 2000)
}


function buildLLMPrompt() {
  const { name, category, v2014: a, v2024: b, diffs } = props.entry
  const lines = []

  lines.push(`Você está analisando as mudanças entre as edições do D&D 5e de 2014 e 2024.`)
  lines.push(``)
  lines.push(`Entrada: ${name}`)
  lines.push(`Categoria: ${category}`)
  lines.push(``)

  if (statRows.value.length) {
    lines.push(`=== Comparação de Estatísticas ===`)
    for (const row of statRows.value) {
      const changed = row.changed ? ' [ALTERADO]' : ''
      lines.push(`${row.label}: ${row.v14} (2014) → ${row.v24} (2024)${changed}`)
    }
    lines.push(``)
  }

  if (a) {
    lines.push(`=== Edição 2014 — Descrição ===`)
    lines.push(a.desc?.trim() || '(sem descrição)')
    lines.push(``)
  }

  if (b) {
    lines.push(`=== Edição 2024 — Descrição ===`)
    lines.push(b.desc?.trim() || '(sem descrição)')
    lines.push(``)
  }

  if (diffs?.length) {
    lines.push(`=== Mudanças Detectadas ===`)
    for (const d of diffs) lines.push(`→ ${d}`)
    lines.push(``)
  }

  lines.push(`---`)
  lines.push(`Com base nos dados acima, explique detalhadamente o que mudou entre as edições de 2014 e 2024 para esta entrada. Seja específico: mencione cada mudança mecânica, alteração de texto e qualquer impacto no jogo. Responda inteiramente em Português Brasileiro (pt-BR).`)

  return lines.join('\n')
}

function copyForLLM() {
  navigator.clipboard.writeText(buildLLMPrompt())
  track('ask-ai', { category: props.entry.category, name: props.entry.name })
  copiedLLM.value = true
  setTimeout(() => copiedLLM.value = false, 2000)
}

function typeName(t) { return (typeof t === 'string' ? t : t?.name) || '—' }
function sizeName(s) { return (typeof s === 'string' ? s : s?.name) || '—' }
function hpString(c) { return c?.hit_points ? `${c.hit_points} (${c.hit_dice})` : '—' }

const statRows = computed(() => {
  const { category, v2014: a, v2024: b } = props.entry
  let rows = []
  if (category === 'Spell') {
    rows = [
      { label: 'Level',     v14: spellLevel(a),              v24: spellLevel(b) },
      { label: 'School',    v14: schoolName(a?.school),      v24: schoolName(b?.school) },
      { label: 'Cast Time', v14: a?.casting_time,            v24: b?.casting_time },
      { label: 'Range',     v14: a?.range,                   v24: b?.range },
      { label: 'Duration',  v14: a?.duration,                v24: b?.duration },
    ]
  } else if (category === 'Creature') {
    rows = [
      { label: 'CR',   v14: a?.challenge_rating_text,                     v24: b?.challenge_rating_text },
      { label: 'Type', v14: typeName(a?.type),                             v24: typeName(b?.type) },
      { label: 'Size', v14: sizeName(a?.size),                             v24: sizeName(b?.size) },
      { label: 'HP',   v14: hpString(a),                                   v24: hpString(b) },
      { label: 'AC',   v14: a?.armor_class ? String(a.armor_class) : null, v24: b?.armor_class ? String(b.armor_class) : null },
    ]
  } else if (category === 'Race') {
    rows = [
      { label: 'Size',  v14: speciesSize(a?.traits),  v24: speciesSize(b?.traits) },
      { label: 'Speed', v14: speciesSpeed(a?.traits), v24: speciesSpeed(b?.traits) },
    ]
  }
  return rows
    .map(r => ({
      label:   r.label,
      v14:     r.v14 || '—',
      v24:     r.v24 || '—',
      changed: !!(a && b) && (r.v14 || '—') !== (r.v24 || '—'),
    }))
    .filter(r => r.v14 !== '—' || r.v24 !== '—')
})
</script>
