---
"@nateadmin/ui": patch
---

DataList: a "fit" or "grow" column without `text()` made an invalid grid track (fit-content inside minmax), which collapsed every column into one. The track is valid again.
