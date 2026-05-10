<template>
  <div class="animate-fade-in bg-[linear-gradient(160deg,var(--color-surface),var(--color-surface-alt))] border border-gold/30 rounded-sm overflow-hidden transition-[border-color,box-shadow] duration-300 hover:border-gold/70 hover:shadow-[0_4px_30px_rgba(184,134,11,0.1)]">

    <!-- Header -->
    <div class="px-4 py-3 sm:px-6 sm:py-4 bg-gradient-to-r from-gold/8 to-transparent border-b border-gold/20 flex items-center gap-3 flex-wrap">
      <div class="font-cinzel text-base sm:text-[1.2rem] text-gold-bright font-semibold flex-1 min-w-0">{{ entry.name }}</div>
      <div class="font-cinzel text-[0.65rem] tracking-[0.2em] uppercase py-[0.2rem] px-[0.7rem] border border-crimson text-crimson-light rounded-[1px] shrink-0">{{ entry.category }}</div>
      <button
        @click="copyLink"
        :title="copied ? 'Copied!' : 'Copy shareable link'"
        class="font-cinzel text-[0.65rem] tracking-[0.1em] py-[0.2rem] px-[0.7rem] border border-gold/40 rounded-[1px] bg-transparent text-parchment/50 cursor-pointer transition-all duration-200 hover:border-gold hover:text-gold shrink-0"
      >{{ copied ? '✓ Copied' : '🔗 Share' }}</button>
    </div>

    <!-- Two-column body -->
    <div class="grid grid-cols-2 max-sm:grid-cols-1">

      <!-- 2014 Edition -->
      <div class="py-4 px-4 sm:py-5 sm:px-6 border-r border-gold/15 max-sm:border-r-0 max-sm:border-b max-sm:border-gold/15">
        <div class="font-cinzel text-[0.65rem] tracking-[0.2em] uppercase mb-4 pb-2 border-b border-gold/15 flex items-center gap-2 text-v2014">
          <span class="w-[6px] h-[6px] rounded-full shrink-0 bg-v2014" />
          2014 Edition
        </div>
        <template v-if="entry.v2014">
          <SpellStats v-if="entry.category === 'Spell'" :spell="entry.v2014" />
          <CreatureStats v-else-if="entry.category === 'Creature'" :creature="entry.v2014" />
          <RaceStats v-else-if="entry.category === 'Race'" :race="entry.v2014" />
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
          <SpellStats v-if="entry.category === 'Spell'" :spell="entry.v2024" :compare="entry.v2014" />
          <CreatureStats v-else-if="entry.category === 'Creature'" :creature="entry.v2024" :compare="entry.v2014" />
          <RaceStats v-else-if="entry.category === 'Race'" :race="entry.v2024" :compare="entry.v2014" />
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
import { ref } from 'vue'
import WordDiff from './WordDiff.vue'
import SpellStats from './SpellStats.vue'
import CreatureStats from './CreatureStats.vue'
import RaceStats from './RaceStats.vue'

const props = defineProps({ entry: Object })
const copied = ref(false)

function truncate(t, max) { return t && t.length > max ? t.slice(0, max) + '…' : (t || '') }

function copyLink() {
  navigator.clipboard.writeText(`${window.location.origin}/compare/${props.entry.category}/${props.entry.name}`)
  copied.value = true
  setTimeout(() => copied.value = false, 2000)
}
</script>
