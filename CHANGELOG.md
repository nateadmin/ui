# @nateadmin/ui

## 0.2.0

### Minor Changes

- a391936: Add ContextMenu. List sample: the table always fits its box with no sideways scroll (long text is cut with "…", cards below 1024px), and right-clicking the list opens a menu of bulk actions for the selected rows.
- b177b4e: Add ListPagination: rows-per-page dropdown (50, 100, 250, 500, 1,000, 2,000) on the left, "Showing x–y of total" in the middle, and Previous / Next with a page field you can type into on the right. Page size is reported through onPageSizeChange so the app can save it to the user's profile.
- 1cef102: Add Table (header, body, row, head, cell, footer, caption). The catalog gains a List page with the current applications-list layout and placeholder data, as the starting point for the library's list design.
- 3449f09: Add Toolbar: the bar on top of a list, table, or board, built from parts (ToolbarViews, ToolbarTabs, ToolbarSearch, ToolbarFilter, ToolbarFilterDialog, ToolbarDateRange, ToolbarCount, ToolbarActions, ToolbarActiveFilters) so each page uses only what it needs. Views switch to a dropdown at four or more. Filters can be single or multi-select, long lists get a searchable dropdown, and dropdown buttons keep one width whatever is selected. Applied filters show as removable chips. Add MultiSelect, Input, DropdownMenu, and Dialog. DatePicker gains a label and min/max dates. Remove the starter Card, Badge, Separator, and Switch; no app uses them. Replace Storybook with a catalog built from the library, with desktop, tablet, and mobile previews and a light/dark switch.

### Patch Changes

- d9ba342: List sample: the three-dot actions button fills nearly the full row height so it is easy to hit, and border and divider lines are a little lighter.
- 1d3133a: List sample: rows are a CSS grid where every column sizes to its widest value and the gap between columns is the same 24px everywhere. From, Subject and Underwriter cap their width; leftover room goes to the last column so the actions button stays at the edge.
- 7d03710: List sample: lighter border and row dividers, and taller rows.
- 1578c39: List sample: remove its own search bar and count. The Toolbar goes on top of a list. Remove PageHeader and StatCard.
- 79dd693: List sample: the Scorecard column is replaced by a three-dot actions menu at the end of each row, and the underwriting status shows as a colored pill.
- 663ab35: List sample: bulk select with round checkboxes and Select all, a smaller muted header row, and tighter text and row height so more columns fit.
- 1e8b5bb: List sample: angular two-arrow sort icon (right arrow fills when sorting up, left when sorting down), slightly smaller, and a third click on a column clears the sort back to the original order.
- bf7ec38: List sample: Shift+click selects a range of rows, and every column title shows sort arrows and sorts on click.
- 89128fa: List sample: rows 4px shorter, equal edge padding left and right, Subject in regular weight capped at about 50 characters, a narrower From column, and wider gaps between columns.
- 8036f2f: DropdownMenu and ContextMenu: menu items show the hand cursor on hover.
- fb97a41: Show the hand cursor on everything clickable (buttons, links, switches, toggles, tabs, menu items, options, calendar days), and a not-allowed cursor on disabled controls.

## 0.1.0

- Initial library: Button, Card, Calendar (month and year dropdowns), Popover, DatePicker (mm/dd/yyyy).
