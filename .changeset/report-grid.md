---
"@nateadmin/ui": minor
---

Report grid: the report's table is now a set of parts apps can import (ReportGridCard, ReportGridTable, ReportGridHeadRow, ReportGridHead, ReportGridRow, ReportGridCell, ReportGridGroupLabel, ReportGridTotalRow, ReportGridScroll). They were written inside the catalog's Report page; that page now uses them. ListPagination: `stepOnly` for a list that can only go one page back or forward, `hasPrevious` and `hasNext`, `allSize` for a page size that means every row, and `range` for the rows on screen.
