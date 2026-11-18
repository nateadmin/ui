---
"@nateadmin/ui": patch
---

DataList never scrolls sideways and text never wraps, so every row keeps one height. Columns are "auto" (never squeezed), "fit" or "grow" (text that squeezes down to minWidth and cuts with "..."). When room runs short the columns squeeze, then the gaps tighten from 24px to 12px, then every row becomes a card; widening the box steps back up. The column `wrap` option is removed and `width` no longer takes a custom grid track; use `minWidth` and `maxWidth`.
