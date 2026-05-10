# ⚔ Tome of Changes

> *"The rules have changed. But by how much?"*

The 2024 Player's Handbook rewrote a lot. Spells got tweaked, feats got overhauled, creatures got adjusted, and your Tiefling is now technically a "species." If you've ever sat at the table mid-session trying to remember whether *Fireball* still does the same damage, or whether *Lucky* works the way you remember — this tool is for you.

**Tome of Changes** puts the 2014 and 2024 SRD side by side, highlights exactly what's different, and gets out of your way.

---

## What it does

Search for anything in the SRD — a spell, feat, creature, condition, magic item, or species — and instantly see both editions compared:

- **Word-level diffs** highlight added and removed text inline, so you spot changes at a glance instead of re-reading entire paragraphs
- **Stat changes** surface the mechanical stuff that matters: spell level, casting time, range, duration, creature CR, species size and speed
- **Detected Changes** gives you a plain-English summary at the bottom of each card
- **Shareable links** — every search lives at its own URL, so you can drop it in Discord and your whole group sees the same result

---

## Searchable categories

| Category | Examples |
|---|---|
| Spells | Fireball, Hex, Counterspell, Healing Word |
| Feats | Lucky, Sentinel, War Caster, Great Weapon Master |
| Conditions | Grappled, Frightened, Exhaustion, Blinded |
| Creatures | Goblin, Beholder, Tarrasque, Owlbear |
| Magic Items | Bag of Holding, Vorpal Sword, Ring of Protection |
| Species | Elf, Tiefling, Dragonborn, Halfling |

---

## Running it locally

No backend, no database, no `.env` file to wrestle with. It talks directly to the Open5e API.

```bash
git clone https://github.com/your-username/tome-of-changes.git
cd tome-of-changes
pnpm install
pnpm dev
```

Open [localhost:3000](http://localhost:3000) and start searching.

```bash
pnpm build    # production build
pnpm preview  # preview the build locally
```

---

## Stack

| | |
|---|---|
| [Vue 3](https://vuejs.org) | Composition API, `<script setup>` throughout |
| [Vite 8](https://vitejs.dev) | Dev server + build |
| [Tailwind CSS v4](https://tailwindcss.com) | Utility classes, CSS-native config via `@theme` |
| [Vue Router](https://router.vuejs.org) | Every search is a URL you can bookmark or share |
| [Open5e API](https://open5e.com) | Live SRD data for both editions, free and open |

The diff engine is a hand-rolled LCS (longest common subsequence) algorithm — no libraries, just the classic O(mn) grid. It runs entirely in the browser.

---

## Data & legal

All rules data comes from [Open5e](https://open5e.com), which aggregates the official Systems Reference Documents released by Wizards of the Coast. The 2024 SRD is under Creative Commons; the 2014 SRD is under the OGL.

Tome of Changes is a fan project. Not affiliated with Wizards of the Coast or Dungeons & Dragons.

---

*Built by [Matheus](https://matheusdmm.dev) because the PHB doesn't have a diff view.*
