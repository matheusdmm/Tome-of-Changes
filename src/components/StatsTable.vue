<template>
  <table class="w-full border-collapse mb-2 text-sm">
    <thead>
      <tr class="border-b border-gold/20">
        <th class="py-2 text-left font-cinzel text-[0.6rem] tracking-[0.12em] uppercase text-parchment/25 w-1/3"></th>
        <th class="py-2 text-left font-cinzel text-[0.6rem] tracking-[0.12em] uppercase text-v2014 w-1/3">
          <span class="inline-block w-[5px] h-[5px] rounded-full bg-v2014 mr-1.5 align-middle mb-px" />2014
        </th>
        <th class="py-2 text-left font-cinzel text-[0.6rem] tracking-[0.12em] uppercase text-v2024 w-1/3">
          <span class="inline-block w-[5px] h-[5px] rounded-full bg-v2024 mr-1.5 align-middle mb-px" />2024
        </th>
      </tr>
    </thead>
    <tbody>
      <tr
        v-for="row in rows"
        :key="row.label"
        class="border-b border-gold/8 last:border-0"
        :class="row.changed ? 'bg-gold/[0.04]' : ''"
      >
        <td class="py-2 pr-4 font-cinzel text-[0.65rem] tracking-[0.08em] uppercase text-parchment/40">{{ row.label }}</td>
        <td class="py-2 pr-4 text-parchment/70">{{ row.v14 }}</td>
        <td class="py-2">
          <span :class="row.changed ? 'text-parchment font-semibold' : 'text-parchment/70'">{{ row.v24 }}</span>
          <span
            v-if="row.changed"
            class="ml-2 inline-block font-cinzel text-[0.55rem] tracking-[0.08em] py-px px-[0.3rem] bg-v2024/15 border border-v2024/30 text-v2024 rounded-[1px] align-middle"
          >changed</span>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script setup>
defineProps({ rows: Array })
</script>
