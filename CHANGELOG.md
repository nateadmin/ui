# @nateadmin/ui

## 0.2.0

### Minor Changes

- 89e042d: New CustomizeMenu, with CustomizeOption and CustomizeSwitch: one dropdown to show, hide and reorder parts or columns (drag, or Alt and the up or down arrow), search long lists, Show all and Reset, plus extra settings. The catalog's Toolbar and List builders now use it in place of the rows of chips and the separate order list.
- 6f81b8c: New DataList: the list under a toolbar, built from columns, with cell parts (ListTitle, ListBadge, ListNumber, ListDate, ListMono, ListMuted, ListNone) and sortRows(). The catalog's List page opens with a builder: turn on any of 27 field types and the row parts, pick row end, row height, title style and layout, and drag columns into order, over 2,000 placeholder rows.
- b58bf62: ToolbarExport takes `onEmail`: the Export menu gains Email, which opens a dialog with several addresses, the format and an optional message. New EmailInput (chips for several addresses, invalid ones in red) and isEmail(). CustomizeMenu now shows its list and its settings side by side, so it is about half as tall; on a phone they stack.
- a391936: Add ContextMenu. List sample: the table always fits its box with no sideways scroll (long text is cut with "…", cards below 1024px), and right-clicking the list opens a menu of bulk actions for the selected rows.
- b177b4e: Add ListPagination: rows-per-page dropdown (50, 100, 250, 500, 1,000, 2,000) on the left, "Showing x–y of total" in the middle, and Previous / Next with a page field you can type into on the right. Page size is reported through onPageSizeChange so the app can save it to the user's profile.
- 629588c: Add DateRangePicker: one field that opens two months side by side with start and end slots and a hover preview; ToolbarDateRange now uses it. Add ToolbarExport: an Export button that asks for CSV or PDF. Calendar: parts keep a stable identity, fixing a first click on a day that was lost.
- 6e45ecc: Add ToolbarSavedViews: save the current filters as a named view, switch between views, update or delete them. The catalog's Filters dialog now mixes pill groups with a 100-person Owner group shown as a searchable multi-select dropdown.
- 1cef102: Add Table (header, body, row, head, cell, footer, caption). The catalog gains a List page with the current applications-list layout and placeholder data, as the starting point for the library's list design.
- 12914de: Toolbar: when the parts wrap onto more rows, every part stretches so each row fills the full width. New `labels` prop: "show", "icons" (icons only, so the bar takes fewer rows) or "icons-on-phones" (icons only below 640px). New ToolbarLabel wraps your own button text so it follows along. Filters without an icon show a filter icon in icons-only mode.
- 3449f09: Add Toolbar: the bar on top of a list, table, or board, built from parts (ToolbarViews, ToolbarTabs, ToolbarSearch, ToolbarFilter, ToolbarFilterDialog, ToolbarDateRange, ToolbarCount, ToolbarActions, ToolbarActiveFilters) so each page uses only what it needs. Views switch to a dropdown at four or more. Filters can be single or multi-select, long lists get a searchable dropdown, and dropdown buttons keep one width whatever is selected. Applied filters show as removable chips. Add MultiSelect, Input, DropdownMenu, and Dialog. DatePicker gains a label and min/max dates. Remove the starter Card, Badge, Separator, and Switch; no app uses them. Replace Storybook with a catalog built from the library, with desktop, tablet, and mobile previews and a light/dark switch.

### Patch Changes

- f0fb43c: Calendar: no ring or border on the day you hover or click; the date's own highlight is enough. A day focused from the keyboard shows a soft grey tint.
- b12b037: DataList never leaves empty space: free room is shared out evenly between the columns, so every gap is the same. The select circle and expand arrow sit inside the first column, a fixed 24px before its content, so the first column stays at the left edge and the row end stays at the right edge.
- 2db5c16: DataList never scrolls sideways and text never wraps, so every row keeps one height. Columns are "auto" (never squeezed), "fit" or "grow" (text that squeezes down to minWidth and cuts with "..."). When room runs short the columns squeeze, then the gaps tighten from 24px to 12px, then every row becomes a card; widening the box steps back up. The column `wrap` option is removed and `width` no longer takes a custom grid track; use `minWidth` and `maxWidth`.
- 74aac9a: ToolbarDateRange: presets move from a row of chips into a dropdown that shows the active preset or "Custom range". Input: thinner focus glow.
- 231e507: DateRangePicker: after you pick the end date, End stays the active box instead of jumping back to Start. Another click changes the end; a day before the start begins a new range. Clicking Start to change it keeps the end when it is still after the new start.
- a4aa485: ToolbarFilterDialog: opening a dropdown inside the dialog no longer makes it grow. MultiSelect: the dropdown matches its button's width (at least 12rem, at most 20rem) instead of a fixed 18rem minimum.
- 4b7b9a5: Filters dialog: 8px between each filter title and its options, and the long-list dropdown (Owner) is 16rem wide instead of the full dialog width.
- dcc84ac: Catalog site: the update bar's Reload is now a real hard refresh. It opens the page at a fresh URL no cache holds, and example frames carry the build id in their URL, so both the page and every example show the new version.
- c125010: Input: focus no longer changes the border color. Focus shows only a soft glow in the text color (dark in light mode, light in dark mode) instead of shadcn's thick gray ring.
- d9ba342: List sample: the three-dot actions button fills nearly the full row height so it is easy to hit, and border and divider lines are a little lighter.
- 1d3133a: List sample: rows are a CSS grid where every column sizes to its widest value and the gap between columns is the same 24px everywhere. From, Subject and Underwriter cap their width; leftover room goes to the last column so the actions button stays at the edge.
- 7d03710: List sample: lighter border and row dividers, and taller rows.
- 1578c39: List sample: remove its own search bar and count. The Toolbar goes on top of a list. Remove PageHeader and StatCard.
- 79dd693: List sample: the Scorecard column is replaced by a three-dot actions menu at the end of each row, and the underwriting status shows as a colored pill.
- 663ab35: List sample: bulk select with round checkboxes and Select all, a smaller muted header row, and tighter text and row height so more columns fit.
- 1e8b5bb: List sample: angular two-arrow sort icon (right arrow fills when sorting up, left when sorting down), slightly smaller, and a third click on a column clears the sort back to the original order.
- bf7ec38: List sample: Shift+click selects a range of rows, and every column title shows sort arrows and sorts on click.
- 89128fa: List sample: rows 4px shorter, equal edge padding left and right, Subject in regular weight capped at about 50 characters, a narrower From column, and wider gaps between columns.
- 84560f3: List sample: rows scroll inside their own window with the column titles pinned and no visible scrollbar, so the page doesn't scroll and the pagination footer always stays in view. The sample now holds 2,000 placeholder rows. ListPagination says "Showing 1-50" with a plain hyphen.
- 8036f2f: DropdownMenu and ContextMenu: menu items show the hand cursor on hover.
- cb9651c: Menus are only as wide as their longest item: removed the fixed widths on DataList's three-dot and right-click menus and the minimum widths in DropdownMenuContent, DropdownMenuSubContent and ContextMenuContent. A dropdown under a toolbar field still matches the field's width.
- fb97a41: Show the hand cursor on everything clickable (buttons, links, switches, toggles, tabs, menu items, options, calendar days), and a not-allowed cursor on disabled controls.
- f818025: ToolbarSavedViews: 8px of space between the "Name" label and its field in the Save view dialog.
- f045d8c: ToolbarSavedViews: the trigger reads "View: Default" or "View: <name>", drops the changed-filters dot, and follows the toolbar width rule (sized to the longest view name, capped at 15rem). The menu matches the trigger's width.
- 0234801: Toolbar: every dropdown trigger follows one width rule (sized to its longest option, capped at 15rem, long text cut with "…"). The catalog's Toolbar page is now one interactive builder instead of many separate examples.
- 8d453a3: Toolbar: the saved views button is sized to the default view name, not the longest saved name; longer names are cut with "..." and shown in full on hover. In the catalog, "Push right" no longer leaves an empty gap; search fills the bar.
- e6a8518: Toolbar icons-only mode: every labeled button becomes a 36px square that doesn't stretch, the Filters count sits on the icon's corner, and search, status tabs and other fields take the free room. A row of icons alone spreads across the full width. The default toolbar fits in two rows on a phone.
- 563b2d0: Toolbar icons-only mode never leaves empty space: icon buttons start as 36px squares, fields (search, tabs) take nearly all the free room on their row, and on a row of icons alone the icons widen evenly to fill it.
- 4a7026d: ToolbarExport: the format menu opens left-aligned under the button like every other toolbar dropdown. Catalog builder: drag parts (or use arrow keys) to set their order, with a "Push right" spacer part.

## 0.1.0

- Initial library: Button, Card, Calendar (month and year dropdowns), Popover, DatePicker (mm/dd/yyyy).
