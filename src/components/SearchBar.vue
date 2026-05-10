<template>
  <div class="mb-6">
    <div class="max-w-[600px] mx-auto mb-4 relative">
      <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gold text-[1.1rem] pointer-events-none">⚔</span>
      <input
        type="text"
        :value="modelValue"
        @input="$emit('update:modelValue', $event.target.value)"
        placeholder="Search by name..."
        autocomplete="off"
        class="w-full bg-input-bg border border-gold rounded-sm py-[0.9rem] pr-4 pl-12 text-base text-parchment outline-none transition-[box-shadow,border-color] duration-300 shadow-[0_0_15px_rgba(184,134,11,0.1)] placeholder:text-parchment/30 focus:border-gold-bright focus:shadow-[0_0_25px_rgba(240,192,64,0.2)]"
      />
    </div>

    <div class="flex gap-2 flex-wrap justify-center">
      <button
        v-for="(meta, key) in CATEGORIES"
        :key="key"
        @click="$emit('update:category', key)"
        :class="[
          'font-cinzel text-[0.7rem] tracking-[0.1em] py-[0.35rem] px-[0.9rem] border rounded-[1px] bg-transparent cursor-pointer transition-all duration-200 uppercase',
          category === key
            ? 'bg-gold/15 border-gold text-gold-bright'
            : 'border-gold/40 text-parchment/50 hover:border-gold hover:text-gold'
        ]"
      >{{ meta.label }}</button>
    </div>
  </div>
</template>

<script setup>
import { CATEGORIES } from '../composables/useOpen5e.js'

defineProps({ modelValue: String, category: String })
defineEmits(['update:modelValue', 'update:category'])
</script>
