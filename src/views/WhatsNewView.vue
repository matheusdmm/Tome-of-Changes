<template>
  <div class="max-w-3xl mx-auto">

    <div class="text-center mb-10">
      <p class="font-cinzel text-[0.7rem] tracking-[0.2em] uppercase text-parchment/40 mb-3">✦ Edition Guide</p>
      <h2
        class="text-[clamp(1.4rem,3vw,2rem)] text-gold-bright mb-3"
        :style="{ fontFamily: '\'Jim Nightshade\', cursive' }"
      >What Changed in 2024?</h2>
      <p class="text-parchment/60 text-base leading-relaxed max-w-xl mx-auto">
        The 2024 Player's Handbook is not a new edition — Wizards calls it a revision. But the changes are significant enough that if you sit down with a 2014 character sheet, some things won't work the same way. Here's what you need to know.
      </p>
    </div>

    <div class="flex flex-col gap-6">

      <!-- Section -->
      <div v-for="section in sections" :key="section.title"
        class="bg-[linear-gradient(160deg,var(--color-surface),var(--color-surface-alt))] border border-gold/25 rounded-sm overflow-hidden"
      >
        <div class="px-5 py-3 bg-gradient-to-r from-gold/8 to-transparent border-b border-gold/20 flex items-center gap-3">
          <h3 class="font-cinzel text-[0.9rem] tracking-[0.1em] text-gold-bright">{{ section.title }}</h3>
          <span
            class="ml-auto font-cinzel text-[0.55rem] tracking-[0.1em] uppercase py-px px-2 rounded-[1px] border shrink-0"
            :class="section.impact === 'Major' ? 'border-crimson/60 text-crimson-light' : section.impact === 'Moderate' ? 'border-v2014/60 text-v2014' : 'border-gold/40 text-parchment/50'"
          >{{ section.impact }}</span>
        </div>

        <div class="px-5 py-4 flex flex-col gap-4">
          <p class="text-parchment/75 text-base leading-[1.8]">{{ section.summary }}</p>

          <div v-if="section.changes" class="flex flex-col gap-2">
            <div
              v-for="change in section.changes"
              :key="change.what"
              class="pl-4 border-l-2 border-gold/20"
            >
              <p class="text-parchment/90 text-sm font-semibold">{{ change.what }}</p>
              <p class="text-parchment/55 text-sm leading-[1.7]">{{ change.detail }}</p>
            </div>
          </div>

          <div v-if="section.example" class="bg-gold/[0.04] border border-gold/15 rounded-sm px-4 py-3">
            <p class="font-cinzel text-[0.6rem] tracking-[0.12em] uppercase text-gold/60 mb-1">Example</p>
            <p class="text-parchment/70 text-sm leading-[1.7]">{{ section.example }}</p>
          </div>
        </div>
      </div>

    </div>

    <div class="text-center mt-10 mb-2">
      <p class="text-parchment/30 font-cinzel text-[0.65rem] tracking-[0.12em] uppercase">
        Curious about a specific spell, feat, or creature?
      </p>
      <RouterLink
        to="/"
        class="inline-block mt-3 font-cinzel text-[0.7rem] tracking-[0.15em] uppercase py-2 px-5 border border-gold/40 rounded-[1px] text-parchment/50 transition-all duration-200 hover:border-gold hover:text-gold"
      >⚔ Search the Tome</RouterLink>
    </div>

  </div>
</template>

<script setup>
const sections = [
  {
    title: 'Races → Species',
    impact: 'Major',
    summary: 'Races are now called Species, and they were stripped of most mechanical traits. Ability score increases no longer come from your species — they come from your Background instead. This was the single biggest structural change to character creation.',
    changes: [
      {
        what: 'Ability scores moved to Backgrounds',
        detail: 'In 2014, a Half-Elf got +2 CHA and +1 to two others from their race. In 2024, your Background gives you +2 to one stat and +1 to another (or +1 to three stats). Your species no longer touches ability scores at all.',
      },
      {
        what: 'Species traits simplified',
        detail: 'Many species lost sub-race options or had their traits consolidated. Tieflings, for example, now have a single unified stat block rather than variant options.',
      },
    ],
    example: 'A 2014 Mountain Dwarf got +2 STR and +2 CON from their race. In 2024, a Dwarf character gets those ability score bumps from picking the Soldier or Acolyte background instead — the Dwarf species itself no longer provides them.',
  },
  {
    title: 'Backgrounds Grant Feats',
    impact: 'Major',
    summary: 'Every background now includes a free 1st-level feat, plus a set of ability score increases. This makes background choice far more mechanically meaningful than it was in 2014, where backgrounds were mostly flavour and skill proficiencies.',
    changes: [
      {
        what: 'Origin Feats',
        detail: 'A new category of "Origin Feats" exists specifically for this — Alert, Magic Initiate, Skilled, and others. They are designed to be strong at level 1 without being overpowered.',
      },
      {
        what: 'Skill proficiencies still included',
        detail: 'Backgrounds still give you two skill proficiencies, one tool proficiency, and a language, same as before.',
      },
    ],
    example: 'Choosing the Acolyte background in 2024 gives you +2 WIS / +1 INT (or +1 to three stats), proficiency in Insight and Religion, and the Magic Initiate feat for free at level 1.',
  },
  {
    title: 'Weapon Mastery',
    impact: 'Major',
    summary: 'Martial classes now have a Weapon Mastery system. Each weapon has a Mastery property (like Cleave, Push, Vex, or Topple), and martial characters can apply these special effects when they hit — adding tactical depth to basic attacks.',
    changes: [
      {
        what: 'Mastery properties per weapon',
        detail: 'A Greataxe has Cleave (attack another nearby creature on a hit), a Longsword has Sap (the target has Disadvantage on its next attack roll), a Maul has Topple (the target must save or fall Prone).',
      },
      {
        what: 'Limited to certain classes',
        detail: 'Fighters, Barbarians, Paladins, and Rangers gain Weapon Mastery at level 1. Rogues and Monks gain access later.',
      },
    ],
    example: 'A Fighter attacking with a Pike (Mastery: Push) can push the target 10 feet on a hit. Hit them at the edge of a cliff and suddenly basic attacks have consequences.',
  },
  {
    title: 'Spell Changes',
    impact: 'Major',
    summary: 'Dozens of spells were reworded, balanced, or had their mechanics altered. A few were renamed. The biggest trend: powerful save-or-suck spells were nerfed, concentration was removed from some spells, and healing spells were buffed.',
    changes: [
      {
        what: 'Counterspell now requires a roll',
        detail: 'In 2014, Counterspell automatically cancelled any spell of 3rd level or lower. In 2024, it always requires a DC 10 + spell level Arcana check — even for low-level spells. Auto-cancellation is gone.',
      },
      {
        what: 'Healing spells buffed',
        detail: 'Cure Wounds, Healing Word, and others restore more hit points and had their wording cleaned up. The goal was to make healing a more viable action economy choice.',
      },
      {
        what: 'Conjure Animals / Woodland Beings reworked',
        detail: 'Instead of summoning specific creatures with their own stat blocks (which slowed play significantly), these spells now summon generic Spirit creatures with fixed stats based on spell level.',
      },
    ],
    example: 'In 2014, a Wizard could stop a Fireball cold with Counterspell — no roll needed. In 2024, they still cast Counterspell, but now they must succeed on an Arcana check (DC 13 for a 3rd-level spell) or the Fireball goes off anyway.',
  },
  {
    title: 'Feats Rebalanced',
    impact: 'Moderate',
    summary: 'The most powerful feats from 2014 were toned down. Lucky, Great Weapon Master, and Sharpshooter — the so-called "Big Three" — were all changed to be strong but no longer table-warping. In return, more feats are available earlier.',
    changes: [
      {
        what: 'Lucky nerfed',
        detail: 'In 2014, Lucky let you roll 3 extra d20s per day and choose which result to use — even on rolls against you. In 2024, you get 2 Luck Points, and they can only be used on your own rolls, not on attacks made against you.',
      },
      {
        what: 'Great Weapon Master / Sharpshooter changed',
        detail: 'The -5 to hit / +10 to damage trade-off is gone. Instead, they add your Proficiency Bonus to damage when you score a Critical Hit or kill a creature — powerful, but no longer mandatory for every martial build.',
      },
    ],
    example: 'A 2014 Champion Fighter with GWM was expected to take the -5/+10 trade almost every turn. In 2024, that trade no longer exists — the feat rewards aggressive play differently, and the DM no longer has to inflate AC to compensate.',
  },
  {
    title: 'Exhaustion Reworked',
    impact: 'Moderate',
    summary: 'Exhaustion used to stack six different penalties as levels increased — culminating in death at level 6. It was rarely used because the effects were too harsh and hard to track. In 2024, it is far simpler.',
    changes: [
      {
        what: 'Flat penalty per level',
        detail: 'Each level of Exhaustion now gives -1 to all d20 rolls. At level 10, you die. That\'s it. Easy to track, consistently punishing, and scales linearly.',
      },
      {
        what: 'Speed penalty removed',
        detail: 'The old level 2 effect (speed halved) is gone. Movement is unaffected by Exhaustion in 2024.',
      },
    ],
    example: 'A character with 3 levels of Exhaustion in 2014 had their speed halved, had Disadvantage on ability checks, and had Disadvantage on attack rolls and saving throws simultaneously. In 2024, they simply roll all d20s at -3. Much easier to remember mid-combat.',
  },
  {
    title: 'Class Updates',
    impact: 'Moderate',
    summary: 'Every class received changes, some minor and some significant. The biggest shifts are in when subclasses are chosen, how certain class features scale, and what the baseline power level of each class looks like.',
    changes: [
      {
        what: 'Subclass timing adjusted',
        detail: 'Several classes now get their subclass earlier. Sorcerers choose a subclass at level 1 (was 1, unchanged). Rogues now get theirs at level 3 (was 3, unchanged). Druids get their Circle at level 3 (was 2).',
      },
      {
        what: 'Monks buffed substantially',
        detail: 'Monks were widely considered underpowered in 2014. Their Ki system was redesigned, their damage increased, and their action economy improved significantly.',
      },
      {
        what: 'Ranger revised',
        detail: 'Natural Explorer and Favored Enemy — two of the Ranger\'s most complained-about features — were replaced with more broadly useful exploration and combat tools.',
      },
    ],
    example: 'A 2014 Ranger\'s Favored Enemy gave a ribbon bonus against one creature type that rarely came up. In 2024, that slot is replaced with Favored Foe, which lets them mark a creature and deal bonus damage to it, working against anything they actually fight.',
  },
  {
    title: 'Rules Clarifications',
    impact: 'Minor',
    summary: 'The 2024 PHB also used the opportunity to clarify dozens of rules that had been argued about for a decade. These aren\'t mechanical changes — just the rules saying clearly what they meant.',
    changes: [
      {
        what: 'Grapple and Shove formalized',
        detail: 'These are now explicitly listed as possible effects of the Attack action, with cleaner wording for how they interact with Extra Attack.',
      },
      {
        what: '"Heroic Inspiration" replaces "Inspiration"',
        detail: 'Same mechanic, renamed to avoid confusion with the Bard\'s class features. A DM awards Heroic Inspiration; you spend it to roll an extra d20 and choose which result to use.',
      },
      {
        what: 'Spell component rules tightened',
        detail: 'The rules around when you need a free hand for somatic and material components were clarified — a common source of table arguments in 2014.',
      },
    ],
    example: 'The 2014 rules were silent on whether Extra Attack let you make two grapple attempts in one action. In 2024, it explicitly does — a Fighter can grapple one creature and shove another as part of the same Attack action.',
  },
]
</script>
