# @nateadmin/ui

Shared React UI library for every app. shadcn/ui (base-nova style, Base UI primitives), Tailwind CSS v4, light and dark mode. Private package on GitHub Packages.

## Use it in an app

1. Add an `.npmrc` to the app root:
   ```
   @nateadmin:registry=https://npm.pkg.github.com
   //npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
   ```
   `GITHUB_TOKEN` is a personal access token with `read:packages`.
2. `npm i @nateadmin/ui`
3. In the app's global CSS:
   ```css
   @import "tailwindcss";
   @import "@nateadmin/ui/styles.css";
   ```
4. Import components: `import { Button, DatePicker } from "@nateadmin/ui"`.

Each app sets its brand color by overriding `--primary`, `--primary-foreground`, `--ring`, and `--sidebar-primary` after the import, in both `:root` and `.dark`.

## Change a component

1. Edit it under `src/components/ui/`. Add or update its story in `src/stories/`.
2. `npm run storybook` and check it in light and dark.
3. `npm run changeset` and write one line: which component changed and why.
4. Commit and push to `main`. The Release workflow opens a "Release @nateadmin/ui" pull request that bumps the version and updates `CHANGELOG.md`. Merge it and the new version publishes.

## Add a shadcn component

The library is the only place shadcn lives. Apps never run `shadcn init` or `shadcn add`. Add official components here in the base-nova style.

## Components

| Component | Notes |
| --- | --- |
| Button | Variants: default, outline, secondary, ghost, destructive, link |
| Card | Header, title, description, action, content, footer |
| Calendar | Month and year dropdowns by default |
| Popover | Base UI popover |
| DatePicker | Calendar in a popover, shows mm/dd/yyyy |

## Scripts

| Script | Does |
| --- | --- |
| `npm run storybook` | Component catalog at localhost:6006 |
| `npm run build` | Builds `dist/` (JS, types, styles.css) |
| `npm run typecheck` | TypeScript check |
| `npm run build-storybook` | Static catalog in `storybook-static/` |
