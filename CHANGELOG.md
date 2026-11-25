# @nateadmin/ui

## 0.21.0

### Minor Changes

- 3814942: DataList: sub-rows. `children(row)` gives the rows under a row, drawn in the same columns, indented, folded by a chevron on the parent; the header offers Expand all / Collapse all; `openRows`/`onOpenRowsChange` or `defaultOpen` control what starts open. Sub-rows count for column widths and cannot be selected.

## 0.20.1

### Patch Changes

- b19f743: DataList: no column takes the free room any more; "grow" is content width up to its cap like the others, and the gaps between columns share the free room evenly. ListPage sizes columns from every row when it pages client-side.

## 0.20.0

### Minor Changes

- f4263c8: DataList: when the page's rows are all selected and more rows lie beyond the page (sizeFrom), a line under the titles offers "Select all N" across every page, then "All N selected · Clear".

## 0.19.0

### Minor Changes

- 72ac25e: DataList: column widths are fixed. Each column is as wide as the widest text over every row the list can show (`sizeFrom`, default the rows given) and its title, capped at maxWidth (14rem fit, 24rem grow, 20rem auto), so a page turn or a sort never moves a column. Columns take `text(row)` for that; one without it is reported while developing. useTextWidth is shared with the report grid.

## 0.18.0

### Minor Changes

- 1cb6b81: ReportGrid: every grid sorts, reorders its columns and freezes with nothing passed; it keeps that state itself while open. Pass sort/onSortChange or onColumnsReorder only to own the state. A grid never draws a heading; `title` is for screen readers only.

## 0.17.1

### Patch Changes

- e979a3a: ReportGrid: a grid that is as tall as its rows (stacked reports) no longer carries an empty band under the Total row with a stray scrollbar thumb at the corner. The scrollbar gutter lies over the right edge instead of setting the grid's height.

## 0.17.0

### Minor Changes

- 9a0a345: ToolbarTabs turns into a dropdown with the same choices when the row of tabs is wider than the whole toolbar (a small screen), instead of scrolling sideways. ToolbarSearch is documented as always the first part on the left.

## 0.16.0

### Minor Changes

- 67f371e: Toolbar fields are as small as they can be: a multi-choice filter (ToolbarFilter with `multiple`, ToolbarTreeFilter) is sized to its short states ("All", "N selected") and grows only while exactly one value is picked, no longer to its longest option name. Single-choice fields keep their no-jump width.

## 0.15.0

### Minor Changes

- 65bce9c: ToolbarTreeFilter: a box is filled only when everything under it is picked; part picked shows an empty box with a gray dash. Report: the Reset button is gone. Bar dropdowns are as wide as their widest choice from the start, so picking never moves the bar.

## 0.14.0

### Minor Changes

- f35268b: Report: the tabs are first on the bar. New ToolbarTreeFilter, a dropdown of checkboxes in groups that fold (months under years, week endings under months), used by Report's `period`. A report with no Filters dialog shows its date range on the bar. `onReset` adds a Reset button.

### Patch Changes

- f35268b: Report and ListPage: one 12px space between the bar, the content and the footer, and between a stacked report's blocks.

## 0.13.0

### Minor Changes

- b4072ec: Report: the tabs (Table, Charts) sit on the bar, and a view's own choices (a chart's type, its metrics) go on the bar too through `controls`. Nothing is picked from inside the page.

## 0.12.0

### Minor Changes

- fbd46f6: Report: pages that are more than one grid. Tabs under the bar (Table, Charts), a summary over the grids, a note under them, a stacked layout where the page scrolls and grids can sit side by side, cells marked good or bad, a custom Total label and Total cells, a column frozen from the start, a label for the date range, and a Reports menu that only picks (no saving) when the reports are a fixed set.

## 0.11.0

### Minor Changes

- 77964ca: Report: drag the right edge of a column title to change the column's width, as in a spreadsheet. Double-click the edge to give the width back to the grid. The widths are for viewing only and are not kept.

## 0.10.0

### Minor Changes

- 8d96c06: Report: freeze columns and rows. Right-click (or long-press) a column title or a cell to freeze its column at the left, or its row under the titles; the same menu unfreezes one or all. Built into the Report grid, so every report page gets it with no code of its own.

## 0.9.4

### Patch Changes

- d00ce2f: Report grid Total band with the sideways scrollbar: 12px above the text and 9px from the text down to the bar. With equal gaps the row read as sitting high, because commas hang below the line of the text.

## 0.9.3

### Patch Changes

- 4bf37f8: Report grid: the sideways scrollbar is drawn by the component, not the browser, and the Total band's height is worked out from where its text really is. The gap from the band's top edge to the text now equals the gap from the text to the scrollbar on every machine and browser.

## 0.9.2

### Patch Changes

- 4b3a8e3: CustomizeMenu: while a row is dragged, the cursor stays a move cursor over the whole list (other rows, their handles, the gaps between them). The "not allowed" sign only shows outside the list.

## 0.9.1

### Patch Changes

- ecf66b1: Toolbar dropdown fields (filters, views) are as wide as what they show, not padded out to their widest choice. A field only gets wider when its row of the bar has room to fill.

## 0.9.0

### Minor Changes

- 258609e: ListPage filters are multi-select, always: a person can pick any number of values and none picked means all. General rule, now in the README: anything that can be multi-select is multi-select.

## 0.8.0

### Minor Changes

- e383c3e: Every icon on a bar is unique. ListPage requires an icon on each filter and reports, while developing, any two parts of the bar that share one. On a phone the bar shows icons only, so two filters with the same icon could not be told apart.

## 0.7.1

### Patch Changes

- 7c5296b: Catalog: removed the users example from the List page. The catalog shows components; an app's own pages are built in the app.

## 0.7.0

### Minor Changes

- 1838277: ListPage: a whole list page as one component. The bar (Search, filters, Filters, Export, the page's actions; icons on a phone), the list (sorting, rows that open, bulk select, cards on a phone) and the footer. Hand it every row and it sorts and pages them itself, or hand it one page with a total for a list the server pages. An app supplies rows, columns, filter choices and handlers and nothing else.

## 0.6.1

### Patch Changes

- a491943: ToolbarReportLibrary: the menu opens under its button and uses the room to the right of it. It used to keep its full width and slide left, away from the button, when the button was not at the start of the bar.

## 0.6.0

### Minor Changes

- b39fe73: Report: the whole reports page as one component. The bar (Chat, Search, Reports, Columns, Filters, Export, icons on a phone), the grid (sort cycle, drag to move with the drop line, groups, subtotals, Total band, scrolling), column widths settled from the whole report so sorting never moves a column, drawing only the rows in view, the date range inside Filters with the library's periods, and the footer. An app supplies data and handlers and nothing else. The catalog's Report page is now this component with placeholder data, so the catalog is exactly what apps run.

## 0.5.3

### Patch Changes

- 6d91420: ListPagination: the page size field is only as wide as the size in use, and its menu is exactly as wide as the field. ToolbarReportLibrary: opening the menu with no report open shows the first category, also when categories load after the first paint.

## 0.5.2

### Patch Changes

- b7c2c44: ListPagination: the page size menu is as wide as its widest size, no longer stretched to the button's width.

## 0.5.1

### Patch Changes

- 1d1ddd0: Report grid Total band: equal space above and below its text. With the sideways scrollbar the band grows and the text lifts so the gap to the bar matches the gap above; without the bar the text is dead center. (0.5.0 pinned the band to one height, which put the text on the bar.)

## 0.5.0

### Minor Changes

- 4fba5a7: ReportGridColumns: the column-title row with its behavior built in. Click a title to sort, drag a title to move its column, and a line down the whole column shows where it will land while the moved column fades. It was written inside the catalog's Report page, so apps did not get it; the page now uses the component. The Total band keeps one height with or without the sideways scrollbar, so its text is always centered.

## 0.4.2

### Patch Changes

- 1893701: CustomizeMenu: inside a Toolbar that shows icons only, its button is an icon like the other parts.

## 0.4.1

### Patch Changes

- 1c51901: Toolbar: "icons-on-phones" now works on a server-rendered page. The phone check ran before the page loaded in the browser, so a phone kept the desktop labels.

## 0.4.0

### Minor Changes

- 9a76d5a: Report grid: the report's table is now a set of parts apps can import (ReportGridCard, ReportGridTable, ReportGridHeadRow, ReportGridHead, ReportGridRow, ReportGridCell, ReportGridGroupLabel, ReportGridTotalRow, ReportGridScroll). They were written inside the catalog's Report page; that page now uses them. ListPagination: `stepOnly` for a list that can only go one page back or forward, `hasPrevious` and `hasNext`, `allSize` for a page size that means every row, and `range` for the rows on screen.

## 0.3.0

### Minor Changes

- e6e7c2e: CustomizeMenu can be locked with `disabled`. ToolbarReportLibrary takes `deleteCategoryNote`, so an app that deletes a category's reports with it says so in the confirmation.
- e6e7c2e: CustomizeMenu: sections. One menu can cover more than one list, such as a report with two tables: a switch on top picks the section and the app passes that section's columns and settings.
- e6e7c2e: ToolbarFilterDialog: an app can add its own filter controls inside the dialog (children, counted with extraCount and cleared through onClearAll), and a filter group can be locked with `disabled`. For apps moving over one page at a time, whose filters these parts do not cover yet.

## 0.2.0

### Minor Changes

- 89e042d: New CustomizeMenu, with CustomizeOption and CustomizeSwitch: one dropdown to show, hide and reorder parts or columns (drag, or Alt and the up or down arrow), search long lists, Show all and Reset, plus extra settings. The catalog's Toolbar and List builders now use it in place of the rows of chips and the separate order list.
- 6f81b8c: New DataList: the list under a toolbar, built from columns, with cell parts (ListTitle, ListBadge, ListNumber, ListDate, ListMono, ListMuted, ListNone) and sortRows(). The catalog's List page opens with a builder: turn on any of 27 field types and the row parts, pick row end, row height, title style and layout, and drag columns into order, over 2,000 placeholder rows.
- 69f274d: Date range: Presets menu (renamed from Custom) with one row per group and thin lines between; `dataRange` shows the data's first and last date in gray and the calendar opens on the latest; `fields`, `field`, `onFieldChange` name the date column the range filters and let the person pick another. The field keeps one width whatever it shows. Toolbar: popups' focus-trap elements no longer make the bar think it wrapped, which re-sized every part while a popup was open.
- b58bf62: ToolbarExport takes `onEmail`: the Export menu gains Email, which opens a dialog with several addresses, the format and an optional message. New EmailInput (chips for several addresses, invalid ones in red) and isEmail(). CustomizeMenu now shows its list and its settings side by side, so it is about half as tall; on a phone they stack.
- 1935e6c: ToolbarFilterDialog: selected options now fill with the main text color (white in dark mode, black in light mode) so they stand out; each category shows Clear while anything in it is selected; groups take `required` for a category that must keep a choice (no Clear, not counted on the Filters button, kept by Clear all, last option can't be turned off).
- c05090d: Filters dialog: a group can set `display: "dropdown"` (or "pills"). MultiSelect gets `allLabel`: every box starts ticked, unticking hides, the last stays ticked, and the footer offers Select all; the dialog uses it for dropdown groups so they work like the pills. Search and placeholder text keep acronyms such as ISO.
- a391936: Add ContextMenu. List sample: the table always fits its box with no sideways scroll (long text is cut with "…", cards below 1024px), and right-clicking the list opens a menu of bulk actions for the selected rows.
- b177b4e: Add ListPagination: rows-per-page dropdown (50, 100, 250, 500, 1,000, 2,000) on the left, "Showing x–y of total" in the middle, and Previous / Next with a page field you can type into on the right. Page size is reported through onPageSizeChange so the app can save it to the user's profile.
- 8f2d330: New ListTextarea: the Sales Deals Notes field for list rows (64px tall, full column width, resizable taller, saved on leaving the field, locked while saving, 4,000 characters). The list builder has a "Notes (multi-line input)" column.
- fa43c6a: The bundle is marked as client code, so Next.js server pages can import components directly. Add `@nateadmin/ui/components.css`: the component CSS without colors or base rules, for an app that keeps its own theme while it adopts components one at a time. `styles.css` imports it, so apps using `styles.css` change nothing.
- 8ba24a0: Period menu in three columns: Days | Weeks and Months | Quarters and Years, with rolling ranges (24h, 3 to 120 days, 1 to 4 weeks, 3, 6, 12 months) and named quarters and years. Presets take `group`, `column`, and a label worked out from today. The field keeps the name of the period picked when two cover the same days.
- e774a20: ToolbarDateRange is now one field ("Custom range" until set) with a Period dropdown inside the picker; DateRangePicker takes `presets` and `timeZone`. ToolbarFilterDialog gets a Column filters section (`columns`, `conditions`, `onConditionsChange`, plus `matchesCondition`). ListPagination stays on one row on phones. ToolbarReportLibrary always shows Save as report while no report is open.
- 629588c: Add DateRangePicker: one field that opens two months side by side with start and end slots and a hover preview; ToolbarDateRange now uses it. Add ToolbarExport: an Export button that asks for CSV or PDF. Calendar: parts keep a stable identity, fixing a first click on a day that was lost.
- ff49fad: New ToolbarReportLibrary: saved reports in categories for reports pages. Categories (add, rename, delete; reports from a deleted category move to Uncategorized), report tiles (open, rename, delete), Save as report with a name and a category, Update report with a confirmation and Save as new once the open report has unsaved changes. The catalog's Report page uses it, and each saved report restores the whole view.
- 6e45ecc: Add ToolbarSavedViews: save the current filters as a named view, switch between views, update or delete them. The catalog's Filters dialog now mixes pill groups with a 100-person Owner group shown as a searchable multi-select dropdown.
- 4eb6b11: New SplashCheckbox: a round checkbox that splashes in the accent color when ticked (from Uiverse.io by Shoh2008, MIT). Boxes that load checked show filled without replaying the splash, and clicks don't reach the row underneath. Its styles ship in styles.css under `.sf-cte`; the tick uses the theme's on-accent color so it shows in dark mode. The catalog has a new Checkbox page comparing it with the simple round ListCheckbox.
- 1cef102: Add Table (header, body, row, head, cell, footer, caption). The catalog gains a List page with the current applications-list layout and placeholder data, as the starting point for the library's list design.
- 12914de: Toolbar: when the parts wrap onto more rows, every part stretches so each row fills the full width. New `labels` prop: "show", "icons" (icons only, so the bar takes fewer rows) or "icons-on-phones" (icons only below 640px). New ToolbarLabel wraps your own button text so it follows along. Filters without an icon show a filter icon in icons-only mode.
- 3449f09: Add Toolbar: the bar on top of a list, table, or board, built from parts (ToolbarViews, ToolbarTabs, ToolbarSearch, ToolbarFilter, ToolbarFilterDialog, ToolbarDateRange, ToolbarCount, ToolbarActions, ToolbarActiveFilters) so each page uses only what it needs. Views switch to a dropdown at four or more. Filters can be single or multi-select, long lists get a searchable dropdown, and dropdown buttons keep one width whatever is selected. Applied filters show as removable chips. Add MultiSelect, Input, DropdownMenu, and Dialog. DatePicker gains a label and min/max dates. Remove the starter Card, Badge, Separator, and Switch; no app uses them. Replace Storybook with a catalog built from the library, with desktop, tablet, and mobile previews and a light/dark switch.
- 126ebc4: Dates can be typed: new DateInput (mm/dd/yyyy, slashes fill in), used by DatePicker and by DateRangePicker's Start and End boxes. Calendar captions: the month and the year open lists that scroll to the current one. Filters dialog: multi-select pills start all selected and Select all restores them; required groups show a red star. Report library: each tile's options button sits inside the tile.

### Patch Changes

- df6bf06: Calendar month and year buttons: no arrows, one fixed width (the longest choice), and opening their lists no longer scrolls or locks the page; the list scrolls only itself to the current choice.
- f0fb43c: Calendar: no ring or border on the day you hover or click; the date's own highlight is enough. A day focused from the keyboard shows a soft grey tint.
- b0ddf58: styles.css sets color-scheme (light by default, dark under .dark), so native scrollbars and form controls turn dark gray in dark mode.
- fb8c756: Compact toolbar fields. The date range field reads the date column's name ("Funding Date") until a range is set, then the range in slightly smaller type, at about half its former width. ToolbarReportLibrary reads "Report" until one is open, then its name, sized to the word "Report" (long names are cut, full name on hover). Both keep one width whatever they show.
- cabb992: CustomizeMenu: dragging a row shows a 2px accent line between rows where it will land, the same as the report's column titles; the row lands before or after by which half the pointer is on.
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
- 5cf637c: DateRangePicker: start, end and the Period menu share one top row with no labels (on the narrowest phones Period wraps under the dates). Calendar month and year text is centered in its button.
- f818025: ToolbarSavedViews: 8px of space between the "Name" label and its field in the Save view dialog.
- f045d8c: ToolbarSavedViews: the trigger reads "View: Default" or "View: <name>", drops the changed-filters dot, and follows the toolbar width rule (sized to the longest view name, capped at 15rem). The menu matches the trigger's width.
- 0234801: Toolbar: every dropdown trigger follows one width rule (sized to its longest option, capped at 15rem, long text cut with "…"). The catalog's Toolbar page is now one interactive builder instead of many separate examples.
- 8d453a3: Toolbar: the saved views button is sized to the default view name, not the longest saved name; longer names are cut with "..." and shown in full on hover. In the catalog, "Push right" no longer leaves an empty gap; search fills the bar.
- e6a8518: Toolbar icons-only mode: every labeled button becomes a 36px square that doesn't stretch, the Filters count sits on the icon's corner, and search, status tabs and other fields take the free room. A row of icons alone spreads across the full width. The default toolbar fits in two rows on a phone.
- 563b2d0: Toolbar icons-only mode never leaves empty space: icon buttons start as 36px squares, fields (search, tabs) take nearly all the free room on their row, and on a row of icons alone the icons widen evenly to fill it.
- 4a7026d: ToolbarExport: the format menu opens left-aligned under the button like every other toolbar dropdown. Catalog builder: drag parts (or use arrow keys) to set their order, with a "Push right" spacer part.
- 7d56cc8: styles.css adds `ui-scrollbar`: a quiet scrollbar with no arrow buttons, a thin rounded gray thumb on an invisible track, darker on hover (thin gray in Firefox).

## 0.1.0

- Initial library: Button, Card, Calendar (month and year dropdowns), Popover, DatePicker (mm/dd/yyyy).
