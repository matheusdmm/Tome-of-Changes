<template>
  <span class="italic text-base leading-[1.8] text-parchment/80">
    <span
      v-for="(token, i) in tokens"
      :key="i"
      :class="{
        'bg-crimson/30 text-[var(--color-diff-removed)] line-through rounded-sm px-px': token.type === 'removed',
        'bg-v2024/20 text-[var(--color-diff-added)] rounded-sm px-px': token.type === 'added',
      }"
    >{{ token.text }}</span>
  </span>
</template>

<script setup>
import { computed } from 'vue'
import { wordDiff } from '../composables/useOpen5e.js'

const props = defineProps({ textA: String, textB: String, side: String })

const tokens = computed(() => {
  const all = wordDiff(props.textA || '', props.textB || '')
  if (props.side === 'a') return all.filter(t => t.type !== 'added')
  if (props.side === 'b') return all.filter(t => t.type !== 'removed')
  return all
})
</script>
