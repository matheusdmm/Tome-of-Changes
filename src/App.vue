<template>
  <div class="max-w-[1100px] mx-auto px-6 pt-8 pb-16">
    <AppHeader />
    <RouterView />
    <AppFooter />
  </div>
</template>

<script setup>
import AppHeader from './components/AppHeader.vue'
import AppFooter from './components/AppFooter.vue'
</script>
