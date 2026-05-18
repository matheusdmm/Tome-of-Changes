<template>
  <header class="relative text-center pt-12 pb-8 px-4">

    <!-- Desktop nav -->
    <div class="hidden sm:flex absolute top-4 left-4 items-center gap-2">
      <RouterLink
        to="/favorites"
        class="font-cinzel text-[0.6rem] tracking-[0.1em] uppercase py-1 px-3 border border-gold/40 rounded-[1px] text-parchment/50 transition-all duration-200 hover:border-gold hover:text-gold"
      >♥ Favorites<span v-if="favCount" class="ml-1 text-crimson-light">{{ favCount }}</span></RouterLink>
      <RouterLink
        to="/conditions"
        class="font-cinzel text-[0.6rem] tracking-[0.1em] uppercase py-1 px-3 border border-gold/40 rounded-[1px] text-parchment/50 transition-all duration-200 hover:border-gold hover:text-gold"
      >⬡ Conditions</RouterLink>
      <RouterLink
        to="/whats-new"
        class="font-cinzel text-[0.6rem] tracking-[0.1em] uppercase py-1 px-3 border border-gold/40 rounded-[1px] text-parchment/50 transition-all duration-200 hover:border-gold hover:text-gold"
      >✦ What Changed</RouterLink>
      <a
        :href="translateUrl"
        target="_blank"
        rel="noopener"
        title="Translate this page to Brazilian Portuguese"
        class="font-cinzel text-[0.6rem] tracking-[0.1em] uppercase py-1 px-3 border border-gold/40 rounded-[1px] text-parchment/50 transition-all duration-200 hover:border-gold hover:text-gold"
      >⇄ PT-BR</a>
    </div>

    <!-- Mobile hamburger -->
    <div class="sm:hidden absolute top-4 left-4">
      <button
        @click="isMenuOpen = !isMenuOpen"
        class="font-cinzel text-[0.6rem] tracking-[0.1em] uppercase py-1 px-3 border border-gold/40 rounded-[1px] text-parchment/50 transition-all duration-200 hover:border-gold hover:text-gold bg-transparent cursor-pointer"
      >≡ Menu</button>
      <div
        v-if="isMenuOpen"
        class="absolute top-full left-0 mt-1 flex flex-col z-50 border border-gold/30 rounded-[2px] overflow-hidden"
        style="background: var(--color-surface, #1a1410);"
      >
        <RouterLink
          to="/favorites"
          @click="isMenuOpen = false"
          class="font-cinzel text-[0.6rem] tracking-[0.1em] uppercase py-2 px-4 border-b border-gold/20 text-parchment/50 transition-all duration-200 hover:text-gold hover:bg-gold/10 whitespace-nowrap"
        >♥ Favorites<span v-if="favCount" class="ml-1 text-crimson-light">{{ favCount }}</span></RouterLink>
        <RouterLink
          to="/conditions"
          @click="isMenuOpen = false"
          class="font-cinzel text-[0.6rem] tracking-[0.1em] uppercase py-2 px-4 border-b border-gold/20 text-parchment/50 transition-all duration-200 hover:text-gold hover:bg-gold/10 whitespace-nowrap"
        >⬡ Conditions</RouterLink>
        <RouterLink
          to="/whats-new"
          @click="isMenuOpen = false"
          class="font-cinzel text-[0.6rem] tracking-[0.1em] uppercase py-2 px-4 border-b border-gold/20 text-parchment/50 transition-all duration-200 hover:text-gold hover:bg-gold/10 whitespace-nowrap"
        >✦ What Changed</RouterLink>
        <a
          :href="translateUrl"
          target="_blank"
          rel="noopener"
          title="Translate this page to Brazilian Portuguese"
          @click="isMenuOpen = false"
          class="font-cinzel text-[0.6rem] tracking-[0.1em] uppercase py-2 px-4 text-parchment/50 transition-all duration-200 hover:text-gold hover:bg-gold/10 whitespace-nowrap"
        >⇄ PT-BR</a>
      </div>
    </div>

    <button
      @click="toggleTheme"
      class="absolute top-4 right-4 font-cinzel text-[0.6rem] tracking-[0.1em] uppercase py-1 px-3 border border-gold/40 rounded-[1px] bg-transparent text-parchment/50 cursor-pointer transition-all duration-200 hover:border-gold hover:text-gold"
    >{{ isLight ? '◐ Dark' : '◑ Light' }}</button>

    <RouterLink to="/" class="block">
      <span class="text-gold text-[1.4rem] tracking-[0.5rem] opacity-70 block mb-2">⚔ ✦ ⚔</span>
      <h1
        class="text-[clamp(1.8rem,4vw,3rem)] text-gold-bright leading-tight"
        :style="{
          fontFamily: '\'Jim Nightshade\', cursive',
          textShadow: isLight
            ? '0 0 20px rgba(176,128,0,0.35)'
            : '0 0 40px rgba(240,192,64,0.4), 2px 2px 0 rgba(0,0,0,0.8)'
        }"
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
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useFavorites } from '../composables/useFavorites.js'

const isLight = ref(false)
const isMenuOpen = ref(false)
const route = useRoute()
const { favorites } = useFavorites()
const favCount = computed(() => favorites.value.length || null)
const translateUrl = computed(() => {
  const url = `${window.location.origin}${route.fullPath}`
  return `https://translate.google.com/translate?sl=en&tl=pt-BR&u=${encodeURIComponent(url)}`
})

function onOutsideClick(e) {
  if (isMenuOpen.value && !e.target.closest('.sm\\:hidden')) isMenuOpen.value = false
}

onMounted(() => {
  isLight.value = localStorage.getItem('theme') === 'light'
  document.documentElement.classList.toggle('light', isLight.value)
  document.addEventListener('click', onOutsideClick)
})

onUnmounted(() => {
  document.removeEventListener('click', onOutsideClick)
})

function toggleTheme() {
  isLight.value = !isLight.value
  document.documentElement.classList.toggle('light', isLight.value)
  localStorage.setItem('theme', isLight.value ? 'light' : 'dark')
}
</script>
