# @nateadmin/ui

Shared React UI library for every app. shadcn/ui (base-nova style, Base UI primitives), Tailwind CSS v4, light and dark mode. Private package on GitHub Packages.

## Use it in an app

1. Add an `.npmrc` to the app root:
   ```
   @nateadmin:registry=https://npm.pkg.github.com
   //npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
   ```
   `GITHUB_TOKEN` is a personal access token with `read:packages`.
2. `npm i @nateadmin/ui`
3. In the app's global CSS:
   ```css
   @import "tailwindcss";
   @import "@nateadmin/ui/styles.css";
   ```
4. Import components: `import { Toolbar, ToolbarSearch } from "@nateadmin/ui"`.

Each app sets its brand color by overriding `--primary`, `--primary-foreground`, `--ring`, and `--sidebar-primary` after the import, in both `:root` and `.dark`.

## Catalog

https://ui.wefoundd.com lists every component, built with the library itself. The header has Desktop, Tablet, and Mobile preview sizes and a light/dark switch. The URL keeps the current component, size, and theme, so links can be shared.

## Change a component

1. Edit it under `src/components/ui/`. Add or update its examples in `src/catalog/entries.tsx`.
2. `npm run dev` and check it in light and dark, and at desktop, tablet, and mobile widths.
3. `npm run changeset` and write one line: which component changed and why.
4. Commit and push to `main`. The Release workflow opens a "Release @nateadmin/ui" pull request that bumps the version and updates `CHANGELOG.md`. Merge it and the new version publishes.

## Add a shadcn component

The library is the only place shadcn lives. Apps never run `shadcn init` or `shadcn add`. Add official components here in the base-nova style.

## Components

| Component | Notes |
| --- | --- |
| Toolbar | The bar on top of a list, table, or board. Parts: `ToolbarViews` (Board/List switch), `ToolbarSearch` (fills the free space), `ToolbarFilter` (dropdown, optional "Label: Value" and color dots), `ToolbarActions` (right edge). Include only the parts a page needs. Wraps on narrow screens. |
| Button | Variants: default, outline, secondary, ghost, destructive, link |
| Input | Text input |
| DropdownMenu | Items, checkbox items, radio items, submenus |
| Toggle, ToggleGroup | Single toggle or a segmented group |

### Toolbar

```tsx
<Toolbar>
  <ToolbarViews views={[{ value: "board", label: "Board" }, { value: "list", label: "List" }]} value={view} onValueChange={setView} />
  <ToolbarSearch placeholder="Search projects" value={q} onChange={(e) => setQ(e.target.value)} />
  <ToolbarFilter label="Status" options={statusOptions} value={status} onValueChange={setStatus} />
  <ToolbarActions>
    <Button size="lg">New project</Button>
  </ToolbarActions>
</Toolbar>
```

## Scripts

| Script | Does |
| --- | --- |
| `npm run dev` | Component catalog at localhost:5173 |
| `npm run build` | Builds `dist/` (JS, types, styles.css) |
| `npm run typecheck` | TypeScript check |
| `npm run build-site` | Builds the catalog to `site-dist/`, deployed to https://ui.wefoundd.com on every push to main |
