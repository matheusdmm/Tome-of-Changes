# Tome Of Changes

A browser app for comparing D&D 5e SRD rules from 2014 and 2024. Built with Vue 3, Vue Router, Vite 8, and Tailwind CSS 4.

## Features

- Search spells, feats, conditions, creatures, magic items, and species.
- Compare rules text and statistics, with additions and removals highlighted.
- View each edition's source and switch between full text and changes only.
- Browse without a name and filter spells by level or school, creatures by CR or type, and entries by comparison status.
- Browse conditions and read sourced notes about the 2024 rules.
- Save favorites and session notes in your browser.
- Organize saved entries into campaign or character collections with notes and review checklists.
- Export and restore favorites, notes, and collections with a JSON backup.
- Share searches by URL.
- Light and dark themes.

Rules come from Open5e and are limited to SRD content. The app does not cover every entry in the published books.

## Development

Requires Bun 1.4.2.

```sh
bun install --frozen-lockfile
bun run dev
```

Open [localhost:3000](http://localhost:3000). No backend or environment file is required. Searches need an internet connection.

| Command | Description |
| --- | --- |
| `bun run test` | Run the Vitest suite |
| `bun run test:watch` | Run tests in watch mode |
| `bun run build` | Build to `dist/` |
| `bun run preview` | Preview the production build |

Use Bun to manage dependencies and keep `bun.lock` committed. Run the tests and build before submitting changes. CI also builds the Docker image and runs CodeQL separately.

## Deployment

For Vercel, use `bun run build` with `dist` as the output directory. Routing and cache settings are in `vercel.json`.

To run with Docker and nginx:

```sh
docker build -t tome-of-changes .
docker run --rm -p 8080:80 tome-of-changes
```

Open [localhost:8080](http://localhost:8080).

## Saved data

Favorites store a snapshot of the rules when saved. Notes, recent entries, and theme preferences are also stored locally. Delete saved browser data from the Privacy page.

Use Favorites to manage collections and download backups of the full library or a selected collection. Imports show a preview before applying changes. Merge keeps current values by default; you can choose imported values for conflicts or replace the saved library. Backups can include saved rules text or just entry references. Backup files contain personal notes.

## Data and licensing

Rules data is provided by [Open5e](https://open5e.com/api-docs/). [SRD 5.1 and SRD 5.2](https://www.dndbeyond.com/srd) are available under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Rules attribution is available at `/attribution`.

The original code and design use [CC BY-NC 4.0](LICENSE). Tome Of Changes is not affiliated with Wizards of the Coast or Dungeons & Dragons.

Created by [Matheus](https://matheusdmm.dev).
