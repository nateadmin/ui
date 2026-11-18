---
"@nateadmin/ui": patch
---

DataList never leaves empty space: free room is shared out evenly between the columns, so every gap is the same. The select circle and expand arrow sit inside the first column, a fixed 24px before its content, so the first column stays at the left edge and the row end stays at the right edge.
