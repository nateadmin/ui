# @nateadmin/ui

## 0.2.0

### Minor Changes

- 3449f09: Add Toolbar: the bar on top of a list, table, or board, built from parts (ToolbarViews, ToolbarTabs, ToolbarSearch, ToolbarFilter, ToolbarFilterDialog, ToolbarDateRange, ToolbarCount, ToolbarActions, ToolbarActiveFilters) so each page uses only what it needs. Views switch to a dropdown at four or more. Filters can be single or multi-select, long lists get a searchable dropdown, and dropdown buttons keep one width whatever is selected. Applied filters show as removable chips. Add PageHeader, StatCard and StatGrid, MultiSelect, Input, DropdownMenu, and Dialog. DatePicker gains a label and min/max dates. Remove the starter Card, Badge, Separator, and Switch; no app uses them. Replace Storybook with a catalog built from the library, with desktop, tablet, and mobile previews and a light/dark switch.

### Patch Changes

- fb97a41: Show the hand cursor on everything clickable (buttons, links, switches, toggles, tabs, menu items, options, calendar days), and a not-allowed cursor on disabled controls.

## 0.1.0

- Initial library: Button, Card, Calendar (month and year dropdowns), Popover, DatePicker (mm/dd/yyyy).
