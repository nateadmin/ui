---
"@nateadmin/ui": minor
---

ReportGrid: every grid sorts, reorders its columns and freezes with nothing passed; it keeps that state itself while open. Pass sort/onSortChange or onColumnsReorder only to own the state. A grid never draws a heading; `title` is for screen readers only.
