<template>
  <div class="relative bg-[linear-gradient(135deg,var(--color-surface),var(--color-surface-alt),var(--color-surface))] border border-gold rounded-sm py-[1.4rem] px-8 mx-auto mb-10 max-w-[700px] text-center shadow-[0_0_30px_rgba(184,134,11,0.15),inset_0_0_30px_rgba(0,0,0,0.3)] before:content-['✦'] before:absolute before:top-[6px] before:left-[10px] before:text-gold before:text-[0.7rem] before:opacity-60 after:content-['✦'] after:absolute after:bottom-[6px] after:right-[10px] after:text-gold after:text-[0.7rem] after:opacity-60">
    <div class="font-cinzel text-[0.65rem] tracking-[0.25em] text-gold uppercase mb-2">{{ fact.category }}</div>
    <div class="text-parchment text-base leading-[1.6] italic">"{{ fact.text }}"</div>
    <div class="font-cinzel text-[0.6rem] text-gold-light tracking-[0.2em] mt-3 opacity-50 uppercase">✦ scroll of knowledge ✦</div>
  </div>
</template>

<script setup>
import { RANDOM_FACTS } from '../composables/useOpen5e.js'
const fact = RANDOM_FACTS[Math.floor(Math.random() * RANDOM_FACTS.length)]
</script>
