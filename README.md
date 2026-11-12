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
| Toolbar | The bar on top of a list, table, or board. Parts below. Include only the parts a page needs. Wraps on narrow screens. |
| MultiSelect | Searchable checkbox dropdown for long lists (people, statuses). |
| DatePicker | Calendar in a popover, shows mm/dd/yyyy, optional label and min/max. |
| Button | Variants: default, outline, secondary, ghost, destructive, link |
| Input | Text input |
| Table | Table primitives: header, body, row, head, cell, footer, caption |
| ListPagination | Footer under a list: rows-per-page dropdown (50 to 2,000), "Showing x–y of total", Previous / Next and a page field you can type into. Controlled: the app saves page size to the user's profile (never the browser) and passes it back. |
| DropdownMenu | Items, checkbox items, radio items, submenus |
| ContextMenu | Right-click menu: items, labels, separators, submenus |
| Dialog | Modal with header, footer, and close button |
| Calendar, Popover | Building blocks for the date picker |
| Toggle, ToggleGroup | Single toggle or a segmented group |

Toolbar parts:

| Part | Does |
| --- | --- |
| `ToolbarViews` | Switch between views (Board, List). Up to 3 show as a segmented switch, 4 or more as a dropdown. Optional counts. |
| `ToolbarTabs` | Status tabs that filter the list (Active 128, Monitor 41). Stay tabs at any number, scroll sideways when they do not fit. `stretch` fills the row. |
| `ToolbarSearch` | Search box that fills the free space. |
| `ToolbarFilter` | One filter. Use `multiple` unless the choices exclude each other. Over 10 options it becomes a searchable dropdown. The button keeps one width whatever is picked. |
| `ToolbarFilterDialog` | "Filters" button with a count, opening every filter group in a dialog. Groups up to 8 options show as pills, longer ones as a searchable dropdown (`pillLimit`). |
| `ToolbarDateRange` | From and To pickers plus presets (Today, Yesterday, This week, Last week, 7 days, This month, Last month, 30 days). "Today" follows `timeZone`, America/New_York by default. Weeks start Sunday. |
| `ToolbarCount` | Result count text ("6,113 rows"). |
| `ToolbarActions` | Buttons pinned to the right edge. |
| `ToolbarActiveFilters` | Applied filters as removable chips under the bar, with Clear all. Hidden when nothing is applied. |

Rule of thumb: a filter is multi-select whenever picking two values makes sense (people, statuses, services, priorities). Single-select is only for choices that exclude each other (views, status tabs, sort order).

### Toolbar

```tsx
<Toolbar>
  <ToolbarViews views={[{ value: "board", label: "Board" }, { value: "list", label: "List" }]} value={view} onValueChange={setView} />
  <ToolbarSearch placeholder="Search projects" value={q} onChange={(e) => setQ(e.target.value)} />
  <ToolbarFilter label="Owner" options={ownerOptions} value={owner} onValueChange={setOwner} />
  <ToolbarFilter multiple label="Status" placeholder="All" options={statusOptions} values={statuses} onValuesChange={setStatuses} />
  <ToolbarFilterDialog filters={filterGroups} values={filters} onValuesChange={setFilters} />
  <ToolbarActions>
    <Button size="lg">New project</Button>
  </ToolbarActions>
</Toolbar>
<ToolbarActiveFilters items={activeFilterItems(filterGroups, filters, setFilters)} onClearAll={() => setFilters({})} />
```

`activeFilterItems` builds the chips from the same filter groups and values the Filters dialog uses. For inline filters, pass chips yourself: `{ id, label, value, onRemove }`.

## Scripts

| Script | Does |
| --- | --- |
| `npm run dev` | Component catalog at localhost:5173 |
| `npm run build` | Builds `dist/` (JS, types, styles.css) |
| `npm run typecheck` | TypeScript check |
| `npm run build-site` | Builds the catalog to `site-dist/`, deployed to https://ui.wefoundd.com on every push to main |
