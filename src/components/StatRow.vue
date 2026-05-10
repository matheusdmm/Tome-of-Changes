<template>
  <div class="flex gap-2 mb-1 text-sm leading-[1.6] items-baseline" v-if="value && value !== '—'">
    <span class="font-cinzel text-[0.7rem] text-parchment/40 uppercase tracking-[0.08em] shrink-0 min-w-[80px]">{{ label }}</span>
    <span class="text-parchment">
      {{ value }}
      <span
        v-if="changed"
        class="inline-block font-cinzel text-[0.6rem] tracking-[0.1em] py-px px-[0.35rem] bg-v2024/15 border border-v2024/30 text-v2024 rounded-[1px] ml-1.5 align-middle"
      >changed</span>
    </span>
  </div>
</template>

<script setup>
defineProps({ label: String, value: String, changed: { type: Boolean, default: false } })
</script>
