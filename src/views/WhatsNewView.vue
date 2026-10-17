<template>
    <div class="max-w-3xl mx-auto">

        <div class="text-center mb-10">
            <p class="font-cinzel text-[0.7rem] tracking-[0.2em] uppercase text-parchment/80 mb-3">✦ Edition Guide</p>
            <h1 class="text-[clamp(1.4rem,3vw,2rem)] text-gold-bright mb-3"
                :style="{ fontFamily: '\'Jim Nightshade\', cursive' }">What Changed in D&amp;D 2024?</h1>
            <p class="text-parchment/80 text-base leading-relaxed max-w-xl mx-auto">
                Selected notes about the published 2024 rules, with sources you can check. Use the comparison search for
                the available SRD text; these notes are editorial guidance.
            </p>
        </div>

        <div class="flex flex-col gap-6">

            <!-- Section -->
            <div v-for="section in sections" :key="section.title"
                class="bg-[linear-gradient(160deg,var(--color-surface),var(--color-surface-alt))] border border-gold/25 rounded-sm overflow-hidden">
                <div
                    class="px-5 py-3 bg-gradient-to-r from-gold/8 to-transparent border-b border-gold/20 flex items-center gap-3">
                    <h3 class="font-cinzel text-[0.9rem] tracking-[0.1em] text-gold-bright">{{ section.title }}</h3>
                    <span
                        class="ml-auto font-cinzel text-[0.55rem] tracking-[0.1em] uppercase py-px px-2 rounded-[1px] border shrink-0"
                        :class="section.impact === 'Major' ? 'border-crimson/60 text-crimson-light' : section.impact === 'Moderate' ? 'border-v2014/60 text-v2014' : 'border-gold/40 text-parchment/80'">{{
                            section.impact }}</span>
                </div>

                <div class="px-5 py-4 flex flex-col gap-4">
                    <p class="text-parchment/80 text-base leading-[1.8]">{{ section.summary }}</p>

                    <p class="text-parchment/80 text-sm"><a :href="section.source" target="_blank"
                            rel="noopener noreferrer" class="underline">Read source</a> · {{ section.rulesVersion }} ·
                        Reviewed {{ section.reviewedAt }}</p>
                    <div v-if="section.changes" class="flex flex-col gap-2">
                        <div v-for="change in section.changes" :key="change.what"
                            class="pl-4 border-l-2 border-gold/20">
                            <p class="text-parchment/90 text-sm font-semibold">{{ change.what }}</p>
                            <p class="text-parchment/80 text-sm leading-[1.7]">{{ change.detail }}</p>
                        </div>
                    </div>

                    <div v-if="section.example" class="bg-gold/[0.04] border border-gold/15 rounded-sm px-4 py-3">
                        <p class="font-cinzel text-[0.6rem] tracking-[0.12em] uppercase text-gold/60 mb-1">Example</p>
                        <p class="text-parchment/80 text-sm leading-[1.7]">{{ section.example }}</p>
                    </div>
                </div>
            </div>

        </div>

        <div class="text-center mt-10 mb-2">
            <p class="text-parchment/80 font-cinzel text-[0.65rem] tracking-[0.12em] uppercase">
                Curious about a specific spell, feat, or creature?
            </p>
            <RouterLink to="/"
                class="inline-block mt-3 font-cinzel text-[0.7rem] tracking-[0.15em] uppercase py-2 px-5 border border-gold/40 rounded-[1px] text-parchment/80 transition-all duration-200 hover:border-gold hover:text-gold">
                Search the Tome</RouterLink>
        </div>

    </div>
</template>

<script setup>
import { EDITION_GUIDE as sections } from '../data/editorial.js'
import { usePageMeta } from '../composables/usePageMeta.js'

usePageMeta(
    'Tome Of Changes — What Changed in D&D 2024?',
    'Sourced notes about selected published 2024 D&D rules and SRD coverage.',
)

</script>
