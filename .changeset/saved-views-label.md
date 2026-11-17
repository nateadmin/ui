---
"@nateadmin/ui": patch
---

ToolbarSavedViews: the trigger reads "View: Default" or "View: <name>", drops the changed-filters dot, and follows the toolbar width rule (sized to the longest view name, capped at 15rem). The menu matches the trigger's width.
