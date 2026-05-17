<template>
  <div class="min-h-screen flex flex-col">
    <div class="max-w-[1100px] w-full mx-auto px-6 pt-8 flex-1 flex flex-col">
      <AppHeader />
      <main class="flex-1 flex flex-col pb-8">
        <RouterView />
      </main>
    </div>
    <AppFooter />
  </div>
  <Analytics />
</template>

<script setup>
import { Analytics } from '@vercel/analytics/vue'
import AppHeader from './components/AppHeader.vue'
import AppFooter from './components/AppFooter.vue'
</script>
