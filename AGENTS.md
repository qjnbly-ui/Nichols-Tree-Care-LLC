# Website implementation standard

Use Astro for pages and layouts and TypeScript for browser behavior and shared configuration.
Keep repeated site UI in shared Astro components: edit Header.astro or Footer.astro once for every page.
Keep site identity and navigation in src/data/site.ts. Do not duplicate navigation or footer markup in pages.
Preserve the working estimate API, validation, photo privacy, and request idempotency when changing presentation.
Use Nichols Tree Care without LLC in visible branding. Preserve legal/account identifiers and domains unless explicitly requested.
Run npm run check and npm run build; verify changed desktop and mobile flows in Chrome before publishing.
