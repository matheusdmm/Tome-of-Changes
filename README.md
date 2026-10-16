# ⚔ Tome of Changes

Compare the available D&D 5e SRD rules from 2014 and 2024, with word-level highlighting and a shared comparison of rules statistics.

## Features

- Search spells, feats, conditions, creatures, magic items, and species. Exact names rank first; broad result sets have pages of ten comparisons.
- Compare descriptions, spell upcasting and reaction details, feat benefits, species traits, and creature traits/actions. Summary messages identify changes in the fields compared without guessing their mechanical significance.
- Browse all available conditions at `/conditions`, or read selected sourced rules notes at `/whats-new`.
- Save favorites as dated source snapshots, write per-entry session notes, and return to recent exact searches or entries you interacted with.
- Copy a shareable search URL or a Portuguese AI-analysis prompt. Clipboard failures are reported; notes are excluded from the prompt.
- Switch between light and dark themes. Saved state stays in your browser, with recovery for corrupt or blocked storage and a complete reset on `/privacy`.

Open5e supplies a subset of the books. For example, Grappler is available as a feat in both source editions, while other feats may only appear in the newer SRD. A missing match is not evidence that a rule was removed from the game. See `/attribution` for sources and licensing.

## Local development with Bun

Use **Bun 1.4.2** (pinned in `package.json`) and **Node 24** for the Vite/Vitest tools. Bun manages dependencies and runs the project scripts. `bun run test` invokes Vitest, which compiles Vue components; it is distinct from Bun's built-in `bun test` runner.

```sh
bun install --frozen-lockfile
bun run dev
```

Open [localhost:3000](http://localhost:3000). Typing starts a debounced search; Enter searches immediately. `/` or Ctrl/Cmd+K focuses the search field.

```sh
bun run test          # regression tests, including Vue/route journeys
bun run test:watch    # interactive test runner
bun run build        # production output in dist/
bun run preview      # preview the production build
```

There is no application backend or required environment file. Live searches require access to the public Open5e API. Dependencies are locked in `bun.lock`; do not introduce another package manager's lockfile. To change dependencies, use `bun add` / `bun remove` and commit the manifest and lockfile together.

## Deployment

Vercel uses the Bun lockfile and the SPA routing/cache configuration in `vercel.json`. Configure `bun run build` as the build command and `dist` as the output directory. Analytics collection depends on the host's Vercel setup.

For the standalone nginx image:

```sh
docker build -t tome-of-changes .
docker run --rm -p 8080:80 tome-of-changes
```

Open [localhost:8080](http://localhost:8080). Both hosting configurations revalidate HTML and non-hashed public files, cache hashed `/assets/` files immutably, and avoid caching the legacy worker. Deep links fall back to the SPA. The current manifest provides app metadata; it does not promise offline use.

The legacy service-worker migration only targets the root `/sw.js` registration and known app caches. Its client trigger expires after 2027-04-16. Verify older-client upgrades before removing the cleanup endpoint.

## Contributing and checks

Before opening a change, run a frozen Bun install, `bun run test`, and `bun run build`. CI runs those checks and builds the Docker image; CodeQL runs separately. Tests use static responses in `src/composables/__tests__/fixtures/` and do not depend on a live API. Refresh those fixtures intentionally when adapting to upstream changes.

The application uses Vue 3, Vue Router, Vite 8, and Tailwind CSS 4. Data adapters and statistics live in `src/utils/comparison.js`; API requests and edition pairing live in `src/composables/useOpen5e.js`. Editorial content is separate in `src/data/editorial.js` with source links and review dates.

The diff is computed once per card. It trims shared prefixes/suffixes and bounds the token LCS matrix to one million cells. Larger replacements use a linear, lossless fallback that may highlight more surrounding text. Searches cache up to 30 completed request sets for five minutes and follow at most ten pages of 100 records per source; incomplete coverage is disclosed.

Favorites are snapshots, not automatically refreshed bookmarks. Personal data uses versioned browser storage and reads the original unversioned format. Same-origin tabs receive changes with last-write-wins semantics. Delete saved data from `/privacy`; deletion also clears live state and theme preference.

## Rules data and licenses

Rules data comes from [Open5e](https://open5e.com/api-docs/). Both [SRD 5.1 and SRD 5.2](https://www.dndbeyond.com/srd) are available under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/); SRD 5.1 also has an OGL option. The project uses the Creative Commons rules attribution shown on `/attribution`, separately from the original code/design's [CC BY-NC 4.0 project license](LICENSE).

Tome of Changes is an independent fan project, not affiliated with Wizards of the Coast or Dungeons & Dragons. Editorial sources link to published rules; automated comparisons are limited to the available source fields.

Built by [Matheus](https://matheusdmm.dev).
