---
"@nateadmin/ui": patch
---

Report grid: the sideways scrollbar is drawn by the component, not the browser, and the Total band's height is worked out from where its text really is. The gap from the band's top edge to the text now equals the gap from the text to the scrollbar on every machine and browser.
