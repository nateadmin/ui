---
"@nateadmin/ui": minor
---

DataList: column widths are fixed. Each column is as wide as the widest text over every row the list can show (`sizeFrom`, default the rows given) and its title, capped at maxWidth (14rem fit, 24rem grow, 20rem auto), so a page turn or a sort never moves a column. Columns take `text(row)` for that; one without it is reported while developing. useTextWidth is shared with the report grid.
