---
"@nateadmin/ui": minor
---

Report: the whole reports page as one component. The bar (Chat, Search, Reports, Columns, Filters, Export, icons on a phone), the grid (sort cycle, drag to move with the drop line, groups, subtotals, Total band, scrolling), column widths settled from the whole report so sorting never moves a column, drawing only the rows in view, the date range inside Filters with the library's periods, and the footer. An app supplies data and handlers and nothing else. The catalog's Report page is now this component with placeholder data, so the catalog is exactly what apps run.
