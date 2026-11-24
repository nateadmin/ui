---
"@nateadmin/ui": minor
---

The bundle is marked as client code, so Next.js server pages can import components directly. Add `@nateadmin/ui/components.css`: the component CSS without colors or base rules, for an app that keeps its own theme while it adopts components one at a time. `styles.css` imports it, so apps using `styles.css` change nothing.
