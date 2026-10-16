<template>
  <div class="min-h-screen flex flex-col">
    <div class="max-w-[1100px] w-full mx-auto px-6 pt-8 flex-1 flex flex-col">
      <AppHeader />
      <main class="flex-1 flex flex-col pb-8">
        <p v-if="storageError" role="alert" class="mb-4 border border-gold p-3 text-parchment">{{ storageError }}</p>
        <RouterView />
      </main>
    </div>
    <AppFooter />
  </div>
</template>

<script setup>
import { storageError } from './composables/useStorage.js'
import AppHeader from './components/AppHeader.vue'
import AppFooter from './components/AppFooter.vue'
</script>
