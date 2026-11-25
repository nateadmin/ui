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

## Adopt it in an app that has its own theme

An app that already has a shadcn theme (same token names: `--primary`, `--border`, and so on) can take components one at a time and keep its own colors:

```css
@import "tailwindcss";
@import "@nateadmin/ui/components.css";
@source "../node_modules/@nateadmin/ui/dist/index.js";
```

Do not import `styles.css` there; it would replace the app's colors. `components.css` holds only what components need beyond Tailwind classes. The bundle is marked `"use client"`, so server pages can render components; call helpers such as `cn` only from client code.

## Catalog

https://ui.wefoundd.com lists every component, built with the library itself. The header has Desktop, Tablet, and Mobile preview sizes and a light/dark switch. The URL keeps the current component, size, and theme, so links can be shared.

## Pages are components

A page type an app builds more than once (the reports page) is one component here, `Report`. It owns everything a person sees and does: the bar and its order, the grid, sorting, column widths, dragging, scrolling, the footer. An app passes data and handlers.

- Filters are multi-select. Anything a person could want more than one of, they can pick more than one of; nothing picked means all. A single-choice filter is the exception and needs a reason (the choices exclude each other, like a sort order).
- Every icon on a bar is unique. A bar shows icons only on a phone, so two parts with the same icon cannot be told apart. This holds for every kind of part: filters, actions, menus. `ListPage` requires an icon on each filter and reports a repeat while developing.
- Every report can freeze columns and rows. Right-click (or long-press) a column title or a cell: a frozen column stays at the left, a frozen row stays under the titles, and the same menu unfreezes. `Report` does this on its own; an app passes `frozen` and `onFrozenChange` only to save the choice.
- Every report can change a column's width. Drag the right edge of a column title, as in a spreadsheet; double-click the edge to give the width back. The widths are for viewing only and are not kept.
- One space everywhere on a page: 12px between the bar, the figures, the charts, the grids and the footer. The app gives the page the same 12px above the bar.
- Everything a person chooses is on the bar: the tabs first, then the report, its period (`period`, a dropdown of checkboxes in groups), its other choices (`controls`), then Export. Nothing is picked from inside the page.
- Nothing on the bar moves after a choice. A dropdown is as wide as its widest choice from the start (up to its limit), and a part of the bar never appears or disappears while data loads: it is disabled instead.
- A catalog page holds placeholder data and handlers only. If a catalog page needs state or markup to make something look or behave right, that belongs in the component.
- An app never assembles a page from the smaller parts, and never re-creates a behavior. If an app needs something the component does not do, add it to the component.

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
| DatePicker | Calendar in a popover, shows mm/dd/yyyy, optional label and min/max. The date can be typed (DateInput, also exported). |
| DateRangePicker | One field for a start and end date. Opens two months side by side (one on phones), like an airline site: first click sets the start, second the end, hover previews the range. Optional `presets` add a Period dropdown at the top. Start and End can be typed (mm/dd/yyyy; slashes fill in). |
| Button | Variants: default, outline, secondary, ghost, destructive, link |
| Input | Text input |
| Table | Table primitives: header, body, row, head, cell, footer, caption |
| ListTextarea | Notes field in a row, as on the Sales Deals table: 64px tall, full column width, drag the corner to make it taller, saved when you leave it, locked while `saving`, 4,000 characters max. Column needs `interactive: true`. |
| ListPagination | Footer under a list, always one row (on phones the labels shorten to "50", "1-50 of 878" and arrow buttons): rows-per-page dropdown (50 to 2,000), "Showing x-y of total", Previous / Next and a page field you can type into. Controlled: the app saves page size to the user's profile (never the browser) and passes it back. |
| DataList | The list itself, built from columns. Column widths are fixed: each is the widest text over every row the list can show (`sizeFrom`, all pages) and its title, capped at the column's maxWidth, so a page turn or a sort never moves a column; give every column a `text()` for that. Longer text is cut with "…". Sizes each column to its content with equal 24px gaps and scrolls rows in their own window with pinned titles, so the footer stays in view. Never scrolls sideways and text never wraps: as room runs short, text columns squeeze and cut with "...", the gaps tighten to 12px, then every row becomes a card. Optional: bulk select (Shift range), sortable titles, three-dot menu or chevron per row, expandable rows, dimmed rows, right-click bulk menu, three row heights, CAPS or hidden titles, cards layout. Cell parts: ListTitle, ListBadge, ListNumber, ListDate, ListMono, ListMuted, ListNone. sortRows() sorts by a column. |
| CustomizeMenu | One dropdown to choose which parts or columns show and in what order: tick to show or hide, drag (or Alt and the up or down arrow) to reorder, search long lists, Show all, Reset. The list sits on the left and extra settings on the right, so the menu stays short; on a phone they stack. Extra settings go inside as CustomizeOption (a row of choices) and CustomizeSwitch (on/off). The value is the ordered list of shown keys; save it to the user's profile. |
| EmailInput | Field for several email addresses: Enter, comma, semicolon, space, leaving the field or pasting a list turns them into chips; Backspace removes the last; invalid addresses show in red. `isEmail()` checks one address. |
| SplashCheckbox | Round checkbox that splashes in the accent color when ticked; boxes that load checked show filled without the splash. Clicks don't reach the row underneath. Styles are in styles.css (`.sf-cte`). From Uiverse.io by Shoh2008, MIT. The simpler round checkbox is `ListCheckbox` (on, off, some selected). |
| DropdownMenu | Items, checkbox items, radio items, submenus |
| ContextMenu | Right-click menu: items, labels, separators, submenus |
| Dialog | Modal with header, footer, and close button |
| Calendar, Popover | Building blocks for the date picker. The month and year in the caption open lists (100 years back, 10 ahead by default). |
| Toggle, ToggleGroup | Single toggle or a segmented group |

Toolbar parts:

| Part | Does |
| --- | --- |
| `ToolbarViews` | Switch between views (Board, List). Up to 3 show as a segmented switch, 4 or more as a dropdown. Optional counts. |
| `ToolbarTabs` | Status tabs that filter the list (Active 128, Monitor 41). Stay tabs at any number; when the row of tabs is wider than the whole bar (a small screen) they turn into a dropdown with the same choices. `stretch` fills the row. |
| `ToolbarSearch` | Search box that fills the free space. Always the first part on the left when a bar has one. |
| `ToolbarFilter` | One filter. Use `multiple` unless the choices exclude each other. Over 10 options it becomes a searchable dropdown. The button keeps one width whatever is picked. |
| `ToolbarFilterDialog` | "Filters" button with a count, opening every filter group in a dialog. Groups up to 8 options show as pills, longer ones as a searchable dropdown (`pillLimit`). Multi-select pills all start selected (everything shows); unselect to hide, the last can't be turned off, Select all puts them back. `required` groups get a red star. Pass `columns`, `conditions` and `onConditionsChange` for a Column filters section (column, condition, value; text, number and date columns); apply them with `matchesCondition`. |
| `ToolbarDateRange` | One compact field: "Custom range" (or the date column's name, such as "Funding Date") until set, then the range; one fixed width so nothing moves. Opens a DateRangePicker: Start and End (typed or picked) and a Presets menu with one row per group (Days, Weeks, Months, Quarters, Years). `dataRange` fills the fields in gray with the first and last date in the rows shown. `fields`, `field` and `onFieldChange` name the date column being filtered ("Funding date: ...") and add a menu to change it. "Today" follows `timeZone`, America/New_York by default. Weeks start Sunday. |
| `ToolbarSavedViews` | Named views of a list (filters, search, sort) for interactive browsing. Pick a view, see a dot when filters changed, "Update" the active view, "Save current view as..." with a name, delete views. The app stores views on the user's profile. Not the same as saving a report on a reports page. |
| `ToolbarExport` | Export button that opens a dropdown to pick the format (CSV or PDF by default; pass `formats` to change). |
| `ToolbarCount` | Result count text ("6,113 rows"). |
| `ToolbarActions` | Buttons pinned to the right edge. |
| `ToolbarActiveFilters` | Applied filters as removable chips under the bar, with Clear all. Hidden when nothing is applied. |

All dropdown triggers on the toolbar follow one width rule: as small as they can be. A single-choice field is as wide as its longest choice so it never jumps on select. A multi-choice field is as wide as its short states ("All", "N selected") and grows only while exactly one value is picked, never to its longest option name. Capped at 15rem with "…" for longer text.

In the catalog, the Toolbar page is a builder: switch parts on and off, then drag them (or focus one and use the arrow keys) to set their order. "Push right" is a spacer: parts after it sit at the right edge. Every toolbar dropdown opens left-aligned under its button.

Rule of thumb: a filter is multi-select whenever picking two values makes sense (people, statuses, services, priorities). Single-select is only for choices that exclude each other (views, status tabs, sort order).

### Toolbar

```tsx
<Toolbar labels="icons-on-phones">
  <ToolbarViews views={[{ value: "board", label: "Board" }, { value: "list", label: "List" }]} value={view} onValueChange={setView} />
  <ToolbarSearch placeholder="Search projects" value={q} onChange={(e) => setQ(e.target.value)} />
  <ToolbarFilter label="Owner" options={ownerOptions} value={owner} onValueChange={setOwner} />
  <ToolbarFilter multiple label="Status" placeholder="All" options={statusOptions} values={statuses} onValuesChange={setStatuses} />
  <ToolbarFilterDialog filters={filterGroups} values={filters} onValuesChange={setFilters} />
  <ToolbarActions>
    <Button size="lg"><Plus /><ToolbarLabel>New project</ToolbarLabel></Button>
  </ToolbarActions>
</Toolbar>
<ToolbarActiveFilters items={activeFilterItems(filterGroups, filters, setFilters)} onClearAll={() => setFilters({})} />
```

`ToolbarReportLibrary` is the saved-reports menu for reports pages: categories on the left (add, rename, delete), the category's reports as tiles on the right (open, rename, delete), Save as report with a name and a category, and Update report (with a confirmation) or Save as new once the open report has unsaved changes. The app stores reports and categories; pass `modified` and `canSave` so the right actions show. Leave out a handler to hide that action.

`ToolbarExport` takes `onEmail` to add Email to its menu: a dialog with several addresses, the format and an optional message, which calls `onEmail({ to, format, message })`. Return a promise to show "Sending..." until it settles.

When the parts wrap onto more rows (tablet, phone), every part stretches so each row fills the full width. `labels` is `"show"` (default), `"icons"` (icons only, fewer rows; text stays readable by screen readers) or `"icons-on-phones"` (icons only below 640px). Wrap your own button text in `ToolbarLabel` so it hides too.

`activeFilterItems` builds the chips from the same filter groups and values the Filters dialog uses. For inline filters, pass chips yourself: `{ id, label, value, onRemove }`.

## Scripts

| Script | Does |
| --- | --- |
| `npm run dev` | Component catalog at localhost:5173 |
| `npm run build` | Builds `dist/` (JS, types, styles.css) |
| `npm run typecheck` | TypeScript check |
| `npm run build-site` | Builds the catalog to `site-dist/`, deployed to https://ui.wefoundd.com on every push to main |
