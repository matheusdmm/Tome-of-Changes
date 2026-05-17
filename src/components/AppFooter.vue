<template>
  <footer class="border-t border-gold/15">
    <div class="max-w-[1100px] mx-auto px-6 py-10">

      <!-- Top row -->
      <div class="flex flex-col sm:flex-row justify-between gap-8 mb-8">

        <!-- Brand -->
        <div class="max-w-xs">
          <p class="font-cinzel text-gold-bright text-base tracking-[0.1em] mb-2">Tome of Changes</p>
          <p class="text-parchment/40 text-sm leading-relaxed">
            Compare D&amp;D 5e spells, conditions, creatures and more between the 2014 and 2024 editions.
          </p>
        </div>

        <!-- Links -->
        <nav class="flex flex-wrap gap-10 text-sm font-cinzel">

          <div class="flex flex-col gap-2.5">
            <p class="text-[10px] text-parchment/25 uppercase tracking-widest mb-1">App</p>
            <RouterLink to="/" class="text-parchment/50 hover:text-gold transition-colors">Home</RouterLink>
            <RouterLink to="/conditions" class="text-parchment/50 hover:text-gold transition-colors">Conditions</RouterLink>
            <RouterLink to="/favorites" class="text-parchment/50 hover:text-gold transition-colors">Favorites</RouterLink>
            <RouterLink to="/whats-new" class="text-parchment/50 hover:text-gold transition-colors">What Changed</RouterLink>
          </div>

          <div class="flex flex-col gap-2.5">
            <p class="text-[10px] text-parchment/25 uppercase tracking-widest mb-1">Also by Matheus</p>
            <a href="https://heroscribe.vercel.app/" target="_blank" rel="noopener" class="text-parchment/50 hover:text-gold transition-colors">HeroScribe</a>
            <a href="https://matheusdmm.dev" target="_blank" rel="noopener" class="text-parchment/50 hover:text-gold transition-colors">matheusdmm.dev</a>
          </div>

          <div class="flex flex-col gap-2.5">
            <p class="text-[10px] text-parchment/25 uppercase tracking-widest mb-1">Legal</p>
            <RouterLink to="/privacy" class="text-parchment/50 hover:text-gold transition-colors">Privacy</RouterLink>
            <a href="https://creativecommons.org/licenses/by-nc/4.0/" target="_blank" rel="noopener" class="text-parchment/50 hover:text-gold transition-colors">CC BY-NC 4.0</a>
          </div>

          <div class="flex flex-col gap-2.5">
            <p class="text-[10px] text-parchment/25 uppercase tracking-widest mb-1">Resources</p>
            <a href="https://api.open5e.com" target="_blank" rel="noopener" class="text-parchment/50 hover:text-gold transition-colors">Open5e API</a>
            <a href="https://dnd.wizards.com/resources/systems-reference-document" target="_blank" rel="noopener" class="text-parchment/50 hover:text-gold transition-colors">SRD (WotC)</a>
            <a href="https://github.com/matheusdmm/Tome-of-Changes" target="_blank" rel="noopener" class="text-parchment/50 hover:text-gold transition-colors">GitHub</a>
          </div>

        </nav>
      </div>

      <!-- Bottom bar -->
      <div class="border-t border-gold/15 pt-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs text-parchment/25 font-cinzel tracking-[0.08em]">
        <p>
          © {{ year }} Tome of Changes. Built by
          <a href="https://matheusdmm.dev" target="_blank" rel="noopener" class="underline hover:text-parchment/50 transition-colors">Matheus</a>.
        </p>
      </div>

    </div>
  </footer>
</template>

<script setup>
const year = new Date().getFullYear()
</script>
