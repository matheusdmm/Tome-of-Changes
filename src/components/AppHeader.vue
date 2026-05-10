<template>
  <header class="relative text-center pt-12 pb-8 px-4">

    <button
      @click="toggleTheme"
      class="absolute top-4 right-4 font-cinzel text-[0.6rem] tracking-[0.1em] uppercase py-1 px-3 border border-gold/40 rounded-[1px] bg-transparent text-parchment/50 cursor-pointer transition-all duration-200 hover:border-gold hover:text-gold"
    >{{ isLight ? '◐ Dark' : '◑ Light' }}</button>

    <RouterLink to="/" class="block">
      <span class="text-gold text-[1.4rem] tracking-[0.5rem] opacity-70 block mb-2">⚔ ✦ ⚔</span>
      <h1
        class="font-metamorphous text-[clamp(1.8rem,4vw,3rem)] text-gold-bright leading-tight"
        :style="{ textShadow: isLight
          ? '0 0 20px rgba(176,128,0,0.35)'
          : '0 0 40px rgba(240,192,64,0.4), 2px 2px 0 rgba(0,0,0,0.8)' }"
      >Tome of Changes</h1>
      <p class="font-cinzel text-parchment-dark text-[0.9rem] mt-2 tracking-[0.15em] opacity-80">
        D&amp;D 5e (2014) · versus · D&amp;D 2024
      </p>
    </RouterLink>

    <div class="flex items-center gap-4 mx-auto my-6 max-w-[400px]">
      <div class="flex-1 h-px bg-gradient-to-r from-transparent via-gold to-transparent" />
      <div class="w-2 h-2 bg-gold rotate-45 shadow-[0_0_8px_var(--color-gold)]" />
      <div class="flex-1 h-px bg-gradient-to-r from-transparent via-gold to-transparent" />
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const isLight = ref(false)

onMounted(() => {
  isLight.value = localStorage.getItem('theme') === 'light'
  document.documentElement.classList.toggle('light', isLight.value)
})

function toggleTheme() {
  isLight.value = !isLight.value
  document.documentElement.classList.toggle('light', isLight.value)
  localStorage.setItem('theme', isLight.value ? 'light' : 'dark')
}
</script>
